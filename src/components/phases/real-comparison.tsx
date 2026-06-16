"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Room, Task, Participant, RealItem, RealItemMatch } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function RealComparison({ room, tasks, participants, isFacilitator }: {
  room: Room; tasks: Task[]; participants: Participant[]; isFacilitator: boolean;
}) {
  const [realItems, setRealItems] = useState<RealItem[]>([]);
  const [matches, setMatches] = useState<RealItemMatch[]>([]);

  useEffect(() => {
    supabase.from("real_items").select().eq("room_id", room.id).then(({ data }) => { if (data) setRealItems(data); });
    supabase.from("real_item_matches").select().then(({ data }) => { if (data) setMatches(data); });
  }, [room.id]);

  const setMatch = async (realItemId: string, taskId: string, coverage: "full" | "partial" | "none") => {
    const existing = matches.find((m) => m.real_item_id === realItemId && m.task_id === taskId);
    if (existing) {
      await supabase.from("real_item_matches").update({ coverage }).eq("id", existing.id);
      setMatches(matches.map((m) => m.id === existing.id ? { ...m, coverage } : m));
    } else {
      const { data } = await supabase.from("real_item_matches").insert({ real_item_id: realItemId, task_id: taskId, coverage }).select().single();
      if (data) setMatches([...matches, data]);
    }
  };

  const summary = useMemo(() => {
    const covered = realItems.filter((ri) => matches.some((m) => m.real_item_id === ri.id && m.coverage === "full"));
    const partial = realItems.filter((ri) => matches.some((m) => m.real_item_id === ri.id && m.coverage === "partial") && !covered.includes(ri));
    const uncovered = realItems.filter((ri) => !matches.some((m) => m.real_item_id === ri.id && (m.coverage === "full" || m.coverage === "partial")));
    const matchedTaskIds = new Set(matches.filter((m) => m.coverage !== "none").map((m) => m.task_id));
    const unnecessary = tasks.filter((t) => !matchedTaskIds.has(t.id));
    return { covered, partial, uncovered, unnecessary };
  }, [realItems, matches, tasks]);

  if (realItems.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardContent className="py-10 text-center">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-muted-foreground">No se configuraron ítems reales para comparar.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="py-5 text-center">
            <div className="text-3xl font-bold text-green-600">{summary.covered.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Ítems cubiertos</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="py-5 text-center">
            <div className="text-3xl font-bold text-yellow-600">{summary.partial.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Parcialmente</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="py-5 text-center">
            <div className="text-3xl font-bold text-red-600">{summary.uncovered.length}</div>
            <div className="text-xs text-muted-foreground mt-1">No identificados</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="py-5 text-center">
            <div className="text-3xl font-bold text-muted-foreground">{summary.unnecessary.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Tareas sin match</div>
          </CardContent>
        </Card>
      </div>

      {/* Matching matrix */}
      {isFacilitator && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">🔗 Mapeo: ítems reales → tareas propuestas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {realItems.map((item) => (
              <div key={item.id} className="border rounded-xl p-4 bg-accent/30">
                <div className="font-semibold mb-1">{item.title}</div>
                {item.description && <p className="text-sm text-muted-foreground mb-3">{item.description}</p>}
                <div className="flex flex-col gap-2">
                  {tasks.slice(0, 20).map((task) => {
                    const match = matches.find((m) => m.real_item_id === item.id && m.task_id === task.id);
                    return (
                      <div key={task.id} className="flex items-center gap-3 text-sm bg-card rounded-lg px-3 py-2">
                        <span className="flex-1 truncate">{task.title} <span className="text-muted-foreground">({participants.find(p => p.id === task.participant_id)?.name})</span></span>
                        <Select value={match?.coverage || "none"} onValueChange={(v) => setMatch(item.id, task.id, v as "full" | "partial" | "none")}>
                          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full">✅ Cubre</SelectItem>
                            <SelectItem value="partial">🟡 Parcial</SelectItem>
                            <SelectItem value="none">❌ No cubre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Results for everyone */}
      {!isFacilitator && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">📊 Resumen de comparación</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div>
              <h4 className="font-semibold text-sm text-green-700 mb-2">✅ Ítems cubiertos</h4>
              {summary.covered.map((i) => <div key={i.id} className="text-sm ml-4 py-1">{i.title}</div>)}
              {summary.covered.length === 0 && <p className="text-sm text-muted-foreground ml-4">Ninguno aún</p>}
            </div>
            <div>
              <h4 className="font-semibold text-sm text-red-700 mb-2">❌ Ítems no identificados</h4>
              {summary.uncovered.map((i) => <div key={i.id} className="text-sm ml-4 py-1">{i.title}</div>)}
              {summary.uncovered.length === 0 && <p className="text-sm text-muted-foreground ml-4">¡Todos cubiertos!</p>}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
