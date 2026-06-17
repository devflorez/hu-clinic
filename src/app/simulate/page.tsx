"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { runSimulation, LogEntry } from "@/lib/simulation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SimulatePage() {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { time, message }]);
    setTimeout(() => {
      logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  };

  const handleRun = async () => {
    setRunning(true);
    setLogs([]);
    setRoomCode(null);
    addLog("🚀 Iniciando simulación...");

    const code = await runSimulation(addLog);
    if (code) setRoomCode(code);
    setRunning(false);
  };

  return (
    <div className="flex flex-1 items-center justify-center p-6 bg-gradient-to-br from-background via-background to-accent/30">
      <Card className="w-full max-w-2xl shadow-xl border-0 shadow-primary/5">
        <CardHeader className="space-y-2 pb-6 pt-8 px-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-xl">🧪</div>
            <div>
              <CardTitle className="text-xl font-bold">Modo Simulación</CardTitle>
              <CardDescription>
                Lanza participantes virtuales que interactúan con la app como usuarios reales
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8 flex flex-col gap-5">
          <div className="bg-accent/50 rounded-xl p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-2">La simulación incluye:</p>
            <ul className="grid grid-cols-2 gap-1 text-xs">
              <li>✓ Crear sala con HU real</li>
              <li>✓ 6-8 participantes virtuales</li>
              <li>✓ Avance por todas las fases</li>
              <li>✓ Creación de tareas (3-5 c/u)</li>
              <li>✓ Revisión cruzada con ratings</li>
              <li>✓ Comparación con ítems reales</li>
              <li>✓ Validación de Realtime</li>
              <li>✓ Datos vía Supabase client</li>
            </ul>
          </div>

          <Button onClick={handleRun} disabled={running} size="lg" className="h-12 text-base font-semibold">
            {running ? "⏳ Simulación en curso..." : "🚀 Ejecutar simulación"}
          </Button>

          {roomCode && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
              <Badge className="bg-green-100 text-green-700 text-sm">✅ Completada</Badge>
              <span className="text-sm">Sala: <span className="font-mono font-bold">{roomCode}</span></span>
              <Button size="sm" variant="outline" onClick={() => router.push(`/room/${roomCode}`)} className="ml-auto">
                Ver sala →
              </Button>
            </div>
          )}

          {/* Log output */}
          {logs.length > 0 && (
            <div ref={logRef} className="bg-gray-900 text-gray-100 rounded-xl p-4 font-mono text-xs max-h-80 overflow-y-auto">
              {logs.map((entry, i) => (
                <div key={i} className="py-0.5">
                  <span className="text-gray-500">[{entry.time}]</span> {entry.message}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
