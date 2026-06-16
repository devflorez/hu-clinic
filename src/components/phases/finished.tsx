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
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">🎉 Dinámica finalizada</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <p className="text-muted-foreground leading-relaxed">
          Gracias por participar. Discutan en equipo las siguientes preguntas de cierre:
        </p>
        <ol className="flex flex-col gap-4">
          {QUESTIONS.map((q, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="shrink-0 w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">{i + 1}</span>
              <span className="text-sm leading-relaxed pt-1">{q}</span>
            </li>
          ))}
        </ol>
        <div className="bg-accent/50 rounded-xl p-5 mt-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            💡 Usen estas reflexiones para mejorar la próxima descomposición de HU en su equipo.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
