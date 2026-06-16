"use client";

import { supabase } from "@/lib/supabase";
import { Room, Phase } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const PHASES: { key: Phase; label: string; icon: string }[] = [
  { key: "WAITING_ROOM", label: "Espera", icon: "⏳" },
  { key: "READ_HU", label: "Lectura HU", icon: "📖" },
  { key: "CREATE_TASKS", label: "Crear tareas", icon: "✏️" },
  { key: "REVIEW", label: "Revisión", icon: "👀" },
  { key: "RESULTS", label: "Resultados", icon: "📊" },
  { key: "REAL_COMPARISON", label: "Comparación", icon: "🔗" },
  { key: "FINISHED", label: "Fin", icon: "🎉" },
];

const TIMER_OPTIONS = [3, 5, 8, 10, 15];

export function FacilitatorControls({ room }: { room: Room }) {
  const currentIndex = PHASES.findIndex((p) => p.key === room.current_phase);

  const changePhase = async (phase: Phase) => {
    await supabase.from("rooms").update({ current_phase: phase, timer_end_at: null }).eq("id", room.id);
  };

  const setTimer = async (minutes: number) => {
    const end = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    await supabase.from("rooms").update({ timer_end_at: end }).eq("id", room.id);
  };

  return (
    <Card className="border-primary/20 bg-primary/5 shadow-sm">
      <CardContent className="py-4 px-5 flex flex-col gap-4">
        {/* Phase selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-primary uppercase tracking-wide mr-1">Fase:</span>
          {PHASES.map((phase, i) => (
            <Button
              key={phase.key}
              size="sm"
              variant={phase.key === room.current_phase ? "default" : "outline"}
              onClick={() => changePhase(phase.key)}
              className={`text-xs gap-1 h-8 ${i < currentIndex ? "opacity-60" : ""}`}
            >
              <span>{phase.icon}</span>
              <span className="hidden sm:inline">{phase.label}</span>
            </Button>
          ))}
        </div>

        {/* Timer controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-primary uppercase tracking-wide mr-1">Timer:</span>
          {TIMER_OPTIONS.map((m) => (
            <Button key={m} size="sm" variant="ghost" onClick={() => setTimer(m)} className="text-xs h-7 px-2.5">
              {m} min
            </Button>
          ))}
          <Button size="sm" variant="ghost" onClick={() => supabase.from("rooms").update({ timer_end_at: null }).eq("id", room.id)} className="text-xs h-7 px-2.5 text-destructive">
            ⏹ Parar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
