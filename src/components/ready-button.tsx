"use client";

import { supabase } from "@/lib/supabase";
import { Phase } from "@/types";
import { Button } from "@/components/ui/button";

export function ReadyButton({ participantId, currentPhase, readyPhase }: {
  participantId: string | null;
  currentPhase: Phase;
  readyPhase: string;
}) {
  if (!participantId) return null;

  const isReady = readyPhase === currentPhase;

  const toggle = async () => {
    await supabase
      .from("participants")
      .update({ ready_phase: isReady ? "" : currentPhase })
      .eq("id", participantId);
  };

  return (
    <Button
      onClick={toggle}
      variant={isReady ? "default" : "outline"}
      className={`h-10 px-5 font-semibold ${isReady ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
    >
      {isReady ? "✓ Listo" : "Marcar como listo"}
    </Button>
  );
}
