"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const normalizedCode = code.trim().toUpperCase();

    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select()
      .eq("code", normalizedCode)
      .single();

    if (roomError || !room) {
      alert("Sala no encontrada");
      setLoading(false);
      return;
    }

    const { data: participant, error: partError } = await supabase
      .from("participants")
      .insert({ room_id: room.id, name: name.trim(), is_facilitator: false })
      .select()
      .single();

    if (partError || !participant) {
      alert("Error uniéndose: " + partError?.message);
      setLoading(false);
      return;
    }

    sessionStorage.setItem("participant_id", participant.id);
    sessionStorage.setItem("participant_name", participant.name);
    sessionStorage.setItem("is_facilitator", "false");

    router.push(`/room/${normalizedCode}`);
  };

  return (
    <div className="flex flex-1 items-center justify-center p-6 bg-gradient-to-br from-background via-background to-accent/30">
      <Card className="w-full max-w-md shadow-xl border-0 shadow-primary/5">
        <CardHeader className="text-center space-y-3 pb-8 pt-10">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-3xl mb-2">
            🏥
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">HU Clinic</CardTitle>
          <CardDescription className="text-base leading-relaxed max-w-xs mx-auto">
            Ingresa el código de sala y tu nombre para unirte a la dinámica
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-10">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm font-medium">Código de sala</Label>
              <Input
                id="code"
                required
                placeholder="ABC123"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="h-12 text-center text-lg tracking-widest uppercase font-semibold"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Tu nombre</Label>
              <Input
                id="name"
                required
                placeholder="Ej: María García"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12"
              />
            </div>
            <Button type="submit" disabled={loading} size="lg" className="h-12 text-base font-semibold mt-2">
              {loading ? "Entrando..." : "Unirse a sala"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
