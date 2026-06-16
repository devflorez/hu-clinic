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
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">🏥 HU Clinic</CardTitle>
          <CardDescription>
            Ingresa el código de sala y tu nombre para unirte a la dinámica
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <Label htmlFor="code">Código de sala</Label>
              <Input id="code" required placeholder="ABC123" value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="name">Tu nombre</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading} size="lg">
              {loading ? "Entrando..." : "Unirse a sala"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
