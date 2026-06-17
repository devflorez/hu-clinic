"use client";

import { supabase } from "@/lib/supabase";
import { Room, Phase } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const PHASES: { key: Phase; label: string; icon: string }[] = [
  { key: "WAITING_ROOM", label: "Espera", icon: "⏳" },
  { key: "READ_HU", label: "Lectura", icon: "📖" },
  { key: "CREATE_TASKS", label: "Tareas", icon: "✏️" },
  { key: "REVIEW", label: "Revisión", icon: "👀" },
  { key: "RESULTS", label: "Resultados", icon: "📊" },
  { key: "REAL_COMPARISON", label: "Comparar", icon: "🔗" },
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
      <CardContent className="py-5 px-6 flex flex-col gap-5">
        {/* Phase selector */}
        <div>
          <span className="text-[11px] font-semibold text-primary uppercase tracking-wider mb-2.5 block">Fases</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {PHASES.map((phase, i) => {
              const isActive = phase.key === room.current_phase;
              const isPast = i < currentIndex;
              return (
                <Button
                  key={phase.key}
                  size="sm"
                  variant={isActive ? "default" : "outline"}
                  onClick={() => changePhase(phase.key)}
                  className={`text-xs gap-1.5 h-9 px-3 ${isPast ? "opacity-50" : ""} ${isActive ? "shadow-md" : ""}`}
                >
                  <span>{phase.icon}</span>
                  <span className="hidden md:inline">{phase.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Timer controls */}
        <div>
          <span className="text-[11px] font-semibold text-primary uppercase tracking-wider mb-2.5 block">Temporizador</span>
          <div className="flex items-center gap-2 flex-wrap">
            {TIMER_OPTIONS.map((m) => (
              <Button key={m} size="sm" variant="outline" onClick={() => setTimer(m)} className="text-xs h-8 px-3 font-medium">
                {m} min
              </Button>
            ))}
            <Button size="sm" variant="ghost" onClick={() => supabase.from("rooms").update({ timer_end_at: null }).eq("id", room.id)} className="text-xs h-8 px-3 text-destructive font-medium">
              ⏹ Detener
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
