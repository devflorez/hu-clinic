"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function CreateRoom() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    acceptance_criteria: "",
    facilitator_name: "",
    real_items: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const code = generateCode();

    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .insert({ code, title: form.title, description: form.description, acceptance_criteria: form.acceptance_criteria })
      .select()
      .single();

    if (roomError || !room) {
      alert("Error creando sala: " + roomError?.message);
      setLoading(false);
      return;
    }

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

    if (form.real_items.trim()) {
      const items = form.real_items.split("\n").filter(Boolean).map((line) => {
        const [title, ...descParts] = line.split("|");
        return { room_id: room.id, title: title.trim(), description: (descParts.join("|") || "").trim() };
      });
      if (items.length > 0) {
        await supabase.from("real_items").insert(items);
      }
    }

    sessionStorage.setItem("participant_id", participant.id);
    sessionStorage.setItem("participant_name", participant.name);
    sessionStorage.setItem("is_facilitator", "true");

    router.push(`/room/${code}`);
  };

  return (
    <div className="flex flex-1 items-center justify-center p-6 bg-gradient-to-br from-background via-background to-accent/30">
      <Card className="w-full max-w-lg shadow-xl border-0 shadow-primary/5">
        <CardHeader className="space-y-2 pb-6 pt-8 px-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-xl">⚡</div>
            <div>
              <CardTitle className="text-xl font-bold">Crear sala</CardTitle>
              <CardDescription>Configura la Historia de Usuario para la dinámica</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="space-y-2">
              <Label htmlFor="facilitator_name">Tu nombre (facilitador)</Label>
              <Input id="facilitator_name" required value={form.facilitator_name} onChange={(e) => setForm({ ...form, facilitator_name: e.target.value })} className="h-11" />
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="real_items">Ítems reales (opcional)</Label>
              <Textarea id="real_items" rows={3} placeholder="Uno por línea. Formato: título|descripción" value={form.real_items} onChange={(e) => setForm({ ...form, real_items: e.target.value })} className="resize-none" />
              <p className="text-xs text-muted-foreground">Se usarán en la fase de comparación final</p>
            </div>
            <Button type="submit" disabled={loading} size="lg" className="h-12 text-base font-semibold mt-2">
              {loading ? "Creando..." : "Crear sala"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
