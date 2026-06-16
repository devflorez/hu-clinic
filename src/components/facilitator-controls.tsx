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
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="flex flex-wrap items-center gap-2 py-3">
        <span className="text-sm font-medium text-blue-700 mr-2">Facilitador:</span>
        <Button size="sm" variant="outline" onClick={nextPhase} disabled={currentIndex >= PHASES.length - 1}>
          Siguiente fase →
        </Button>
        {TIMER_OPTIONS.map((m) => (
          <Button key={m} size="sm" variant="ghost" onClick={() => setTimer(m)}>
            {m} min
          </Button>
        ))}
        <Button size="sm" variant="ghost" onClick={() => supabase.from("rooms").update({ timer_end_at: null }).eq("id", room.id)}>
          ⏹ Parar timer
        </Button>
      </CardContent>
    </Card>
  );
}
