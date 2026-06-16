"use client";

import { Room } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ReadHU({ room }: { room: Room }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">📖 Lectura de la Historia de Usuario</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="bg-accent/50 rounded-xl p-6">
          <h3 className="font-bold text-xl mb-1">{room.title}</h3>
        </div>
        {room.description && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Descripción</h4>
            <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{room.description}</p>
          </div>
        )}
        {room.acceptance_criteria && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Criterios de aceptación</h4>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{room.acceptance_criteria}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
