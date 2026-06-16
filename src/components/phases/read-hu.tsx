"use client";

import { Room } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ReadHU({ room }: { room: Room }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>📖 Lectura de la Historia de Usuario</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <h3 className="font-semibold text-lg">{room.title}</h3>
        </div>
        {room.description && (
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Descripción</h4>
            <p className="whitespace-pre-wrap">{room.description}</p>
          </div>
        )}
        {room.acceptance_criteria && (
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Criterios de aceptación</h4>
            <p className="whitespace-pre-wrap">{room.acceptance_criteria}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
