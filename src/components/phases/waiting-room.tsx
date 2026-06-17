"use client";

import { Room, Participant } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function WaitingRoom({ room, participants }: { room: Room; participants: Participant[] }) {
  const visible = participants.filter((p) => p.name !== "__real__");
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Sala de espera</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="bg-accent/50 rounded-xl p-5 text-center">
          <p className="text-sm text-muted-foreground mb-2">Comparte este código para que se unan</p>
          <span className="text-3xl font-bold font-mono tracking-[0.3em] text-primary">{room.code}</span>
        </div>
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
            Participantes ({visible.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {visible.map((p) => (
              <Badge key={p.id} variant={p.is_facilitator ? "default" : "secondary"} className="py-1.5 px-3 text-sm">
                {p.name} {p.is_facilitator && "⭐"}
              </Badge>
            ))}
          </div>
          {visible.length <= 1 && (
            <p className="text-sm text-muted-foreground mt-4">Esperando participantes...</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
