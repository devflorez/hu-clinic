"use client";

import { Room, Participant } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function WaitingRoom({ room, participants }: { room: Room; participants: Participant[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sala de espera</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-muted-foreground">
          Comparte el código <span className="font-bold text-foreground">{room.code}</span> para que se unan los participantes.
        </p>
        <div>
          <h3 className="font-medium mb-2">Participantes ({participants.length})</h3>
          <div className="flex flex-wrap gap-2">
            {participants.map((p) => (
              <Badge key={p.id} variant={p.is_facilitator ? "default" : "secondary"}>
                {p.name} {p.is_facilitator && "⭐"}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
