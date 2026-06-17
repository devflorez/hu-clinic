"use client";

import { Participant, Phase } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function ReadyIndicator({ participants, currentPhase }: {
  participants: Participant[];
  currentPhase: Phase;
}) {
  const real = participants.filter((p) => !p.is_facilitator && p.name !== "__real__");
  const ready = real.filter((p) => p.ready_phase === currentPhase);
  const total = real.length;
  const percent = total > 0 ? (ready.length / total) * 100 : 0;

  return (
    <div className="flex items-center gap-4 bg-accent/30 rounded-xl px-5 py-3">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Participantes listos</span>
          <Badge variant={percent === 100 ? "default" : "secondary"} className="text-xs">
            {ready.length}/{total}
          </Badge>
        </div>
        <Progress value={percent} className="h-2" />
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {real.map((p) => (
          <div
            key={p.id}
            title={p.name}
            className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${
              p.ready_phase === currentPhase
                ? "bg-green-100 border-green-500 text-green-700"
                : "bg-muted border-border text-muted-foreground"
            }`}
          >
            {p.name.charAt(0).toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  );
}
