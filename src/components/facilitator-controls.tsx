"use client";

import { supabase } from "@/lib/supabase";
import { Room, Phase } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const PHASES: Phase[] = ["WAITING_ROOM", "READ_HU", "CREATE_TASKS", "REVIEW", "RESULTS", "REAL_COMPARISON", "FINISHED"];
const TIMER_OPTIONS = [3, 5, 8, 10, 15];

export function FacilitatorControls({ room }: { room: Room }) {
  const currentIndex = PHASES.indexOf(room.current_phase as Phase);

  const changePhase = async (phase: Phase) => {
    await supabase.from("rooms").update({ current_phase: phase, timer_end_at: null }).eq("id", room.id);
  };

  const setTimer = async (minutes: number) => {
    const end = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    await supabase.from("rooms").update({ timer_end_at: end }).eq("id", room.id);
  };

  const nextPhase = () => {
    if (currentIndex < PHASES.length - 1) changePhase(PHASES[currentIndex + 1]);
  };

  return (
    <Card className="border-primary/20 bg-primary/5 shadow-sm">
      <CardContent className="flex flex-wrap items-center gap-3 py-4 px-5">
        <span className="text-sm font-semibold text-primary mr-1">⚡ Facilitador</span>
        <div className="h-5 w-px bg-primary/20" />
        <Button size="sm" onClick={nextPhase} disabled={currentIndex >= PHASES.length - 1}>
          Siguiente fase →
        </Button>
        <div className="h-5 w-px bg-primary/20" />
        {TIMER_OPTIONS.map((m) => (
          <Button key={m} size="sm" variant="ghost" onClick={() => setTimer(m)} className="text-xs">
            {m} min
          </Button>
        ))}
        <Button size="sm" variant="ghost" onClick={() => supabase.from("rooms").update({ timer_end_at: null }).eq("id", room.id)} className="text-xs">
          ⏹ Parar
        </Button>
      </CardContent>
    </Card>
  );
}
