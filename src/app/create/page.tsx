"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { PREDEFINED_HUS } from "@/lib/predefined-hus";
import { PredefinedHU } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function CreateRoom() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"select" | "manual">("select");
  const [selectedHU, setSelectedHU] = useState<PredefinedHU | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    acceptance_criteria: "",
    facilitator_name: "",
    story_points: "",
    assignee: "",
    activated_at: "",
    closed_at: "",
  });

  const selectPredefined = (hu: PredefinedHU) => {
    setSelectedHU(hu);
    setForm({
      ...form,
      title: hu.title,
      description: hu.description,
      acceptance_criteria: hu.acceptance_criteria,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const code = generateCode();

    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .insert({
        code,
        title: form.title,
        description: form.description,
        acceptance_criteria: form.acceptance_criteria,
        story_points: selectedHU?.story_points || (form.story_points ? Number(form.story_points) : null),
        assignee: selectedHU?.assignee || form.assignee,
        activated_at: selectedHU?.activated_at || form.activated_at || null,
        closed_at: selectedHU?.closed_at || form.closed_at || null,
      })
      .select()
      .single();

    if (roomError || !room) {
      alert("Error creando sala: " + roomError?.message);
      setLoading(false);
      return;
    }

    // Create facilitator participant
    const { data: participant, error: partError } = await supabase
      .from("participants")
      .insert({ room_id: room.id, name: form.facilitator_name, is_facilitator: true })
      .select()
      .single();

    if (partError || !participant) {
      alert("Error: " + partError?.message);
      setLoading(false);
      return;
    }

    // Create real items and their tasks if predefined HU selected
    if (selectedHU) {
      for (const item of selectedHU.real_items) {
        const { data: realItem } = await supabase
          .from("real_items")
          .insert({
            room_id: room.id,
            external_id: item.external_id,
            title: item.title,
            description: item.description,
            points: selectedHU.story_points,
            assignee: selectedHU.assignee,
            activated_at: selectedHU.activated_at,
            closed_at: selectedHU.closed_at,
          })
          .select()
          .single();

        if (realItem && item.tasks.length > 0) {
          await supabase.from("real_tasks").insert(
            item.tasks.map((t) => ({
              real_item_id: realItem.id,
              external_id: t.external_id,
              title: t.title,
              description: t.description,
            }))
          );
        }
      }
    }

    sessionStorage.setItem("participant_id", participant.id);
    sessionStorage.setItem("participant_name", participant.name);
    sessionStorage.setItem("is_facilitator", "true");

    router.push(`/room/${code}`);
  };

  return (
    <div className="flex flex-1 items-center justify-center p-6 bg-gradient-to-br from-background via-background to-accent/30">
      <Card className="w-full max-w-2xl shadow-xl border-0 shadow-primary/5">
        <CardHeader className="space-y-2 pb-6 pt-8 px-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-xl">⚡</div>
            <div>
              <CardTitle className="text-xl font-bold">Crear sala</CardTitle>
              <CardDescription>Selecciona una HU predefinida o ingresa los datos manualmente</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          {/* Mode toggle */}
          <div className="flex gap-2 mb-6">
            <Button size="sm" variant={mode === "select" ? "default" : "outline"} onClick={() => setMode("select")}>
              Seleccionar HU
            </Button>
            <Button size="sm" variant={mode === "manual" ? "default" : "outline"} onClick={() => { setMode("manual"); setSelectedHU(null); }}>
              Manual
            </Button>
          </div>

          {/* Predefined HU selector */}
          {mode === "select" && !selectedHU && (
            <div className="grid gap-3 mb-6">
              {PREDEFINED_HUS.map((hu) => (
                <div
                  key={hu.id}
                  onClick={() => selectPredefined(hu)}
                  className="border rounded-xl p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{hu.title}</div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{hu.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge variant="secondary" className="text-xs">{hu.story_points} pts</Badge>
                      <span className="text-xs text-muted-foreground">{hu.assignee.split(" ")[0]}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-[10px]">{hu.real_items[0]?.tasks.length || 0} tasks reales</Badge>
                    <Badge variant="outline" className="text-[10px]">{hu.activated_at} → {hu.closed_at}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Selected HU preview */}
          {mode === "select" && selectedHU && (
            <div className="border rounded-xl p-4 bg-accent/30 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">{selectedHU.title}</span>
                <Button size="sm" variant="ghost" onClick={() => { setSelectedHU(null); setForm({ ...form, title: "", description: "", acceptance_criteria: "" }); }} className="text-xs">
                  Cambiar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{selectedHU.story_points} pts</Badge>
                <Badge variant="outline">{selectedHU.assignee}</Badge>
                <Badge variant="outline">{selectedHU.activated_at} → {selectedHU.closed_at}</Badge>
                <Badge variant="outline">{selectedHU.real_items[0]?.tasks.length || 0} tasks reales</Badge>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="space-y-2">
              <Label htmlFor="facilitator_name">Tu nombre (facilitador)</Label>
              <Input id="facilitator_name" required value={form.facilitator_name} onChange={(e) => setForm({ ...form, facilitator_name: e.target.value })} className="h-11" />
            </div>

            {mode === "manual" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title">Título de la HU</Label>
                  <Input id="title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea id="description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="resize-none" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acceptance_criteria">Criterios de aceptación</Label>
                  <Textarea id="acceptance_criteria" rows={4} value={form.acceptance_criteria} onChange={(e) => setForm({ ...form, acceptance_criteria: e.target.value })} className="resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="story_points">Puntos de historia</Label>
                    <Input id="story_points" type="number" value={form.story_points} onChange={(e) => setForm({ ...form, story_points: e.target.value })} className="h-11" placeholder="Ej: 3" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assignee">Responsable</Label>
                    <Input id="assignee" value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} className="h-11" placeholder="Nombre" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="activated_at">Fecha inicio</Label>
                    <Input id="activated_at" type="date" value={form.activated_at} onChange={(e) => setForm({ ...form, activated_at: e.target.value })} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="closed_at">Fecha cierre</Label>
                    <Input id="closed_at" type="date" value={form.closed_at} onChange={(e) => setForm({ ...form, closed_at: e.target.value })} className="h-11" />
                  </div>
                </div>
              </>
            )}

            <Button type="submit" disabled={loading || (!selectedHU && mode === "select")} size="lg" className="h-12 text-base font-semibold mt-2">
              {loading ? "Creando..." : "Crear sala"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
