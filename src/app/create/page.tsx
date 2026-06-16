"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

    // Create real items if provided
    if (form.real_items.trim()) {
      const items = form.real_items.split("\n").filter(Boolean).map((line) => {
        const [title, ...descParts] = line.split("|");
        return { room_id: room.id, title: title.trim(), description: (descParts.join("|") || "").trim() };
      });
      if (items.length > 0) {
        await supabase.from("real_items").insert(items);
      }
    }

    // Store participant info in sessionStorage
    sessionStorage.setItem("participant_id", participant.id);
    sessionStorage.setItem("participant_name", participant.name);
    sessionStorage.setItem("is_facilitator", "true");

    router.push(`/room/${code}`);
  };

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Crear sala</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <Label htmlFor="facilitator_name">Tu nombre (facilitador)</Label>
              <Input id="facilitator_name" required value={form.facilitator_name} onChange={(e) => setForm({ ...form, facilitator_name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="title">Título de la HU</Label>
              <Input id="title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="acceptance_criteria">Criterios de aceptación</Label>
              <Textarea id="acceptance_criteria" rows={4} value={form.acceptance_criteria} onChange={(e) => setForm({ ...form, acceptance_criteria: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="real_items">Ítems reales (opcional, uno por línea, formato: título|descripción)</Label>
              <Textarea id="real_items" rows={3} placeholder="Crear endpoint login|POST /auth/login" value={form.real_items} onChange={(e) => setForm({ ...form, real_items: e.target.value })} />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear sala"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
