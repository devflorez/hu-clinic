"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const QUESTIONS = [
  "¿Qué faltó en la HU para que todos llegáramos a tareas similares?",
  "¿Qué criterios de aceptación estaban ambiguos?",
  "¿Qué tareas aparecieron tarde?",
  "¿Qué tarea fue la más clara y por qué?",
  "¿Qué tarea fue la más débil y por qué?",
  "¿Qué deberíamos mejorar al crear ítems en próximas HU?",
];

export function Finished() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>🎉 Dinámica finalizada</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-muted-foreground">
          Gracias por participar. Discutan en equipo las siguientes preguntas de cierre:
        </p>
        <ol className="list-decimal list-inside flex flex-col gap-3">
          {QUESTIONS.map((q, i) => (
            <li key={i} className="text-sm leading-relaxed">{q}</li>
          ))}
        </ol>
        <p className="text-sm text-muted-foreground mt-4">
          💡 Usen estas reflexiones para mejorar la próxima descomposición de HU en su equipo.
        </p>
      </CardContent>
    </Card>
  );
}
