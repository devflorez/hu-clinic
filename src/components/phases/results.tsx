"use client";

import { useMemo } from "react";
import { Task, Review, Participant } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function Results({ tasks, reviews, participants }: { tasks: Task[]; reviews: Review[]; participants: Participant[] }) {
  const stats = useMemo(() => {
    // Tasks per participant
    const tasksByParticipant = participants
      .filter((p) => !p.is_facilitator)
      .map((p) => ({ name: p.name, count: tasks.filter((t) => t.participant_id === p.id).length }))
      .sort((a, b) => b.count - a.count);

    // Reviews per task with averages
    const taskStats = tasks.map((task) => {
      const taskReviews = reviews.filter((r) => r.task_id === task.id);
      const avgClarity = taskReviews.length ? taskReviews.reduce((s, r) => s + r.clarity, 0) / taskReviews.length : 0;
      const avgDetail = taskReviews.length ? taskReviews.reduce((s, r) => s + r.detail, 0) / taskReviews.length : 0;
      const commentCount = taskReviews.filter((r) => r.comment).length;
      const owner = participants.find((p) => p.id === task.participant_id);
      return { ...task, avgClarity, avgDetail, commentCount, reviewCount: taskReviews.length, ownerName: owner?.name || "?" };
    });

    const best = [...taskStats].sort((a, b) => (b.avgClarity + b.avgDetail) - (a.avgClarity + a.avgDetail)).slice(0, 5);
    const worst = [...taskStats].filter((t) => t.reviewCount > 0).sort((a, b) => (a.avgClarity + a.avgDetail) - (b.avgClarity + b.avgDetail)).slice(0, 5);
    const mostCommented = [...taskStats].sort((a, b) => b.commentCount - a.commentCount).slice(0, 5);

    return { tasksByParticipant, taskStats, best, worst, mostCommented };
  }, [tasks, reviews, participants]);

  const typeColors: Record<string, string> = {
    frontend: "bg-blue-100 text-blue-800",
    backend: "bg-green-100 text-green-800",
    QA: "bg-purple-100 text-purple-800",
    "análisis": "bg-yellow-100 text-yellow-800",
    devops: "bg-orange-100 text-orange-800",
    "diseño": "bg-pink-100 text-pink-800",
    otro: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="py-4 text-center">
          <div className="text-2xl font-bold">{tasks.length}</div>
          <div className="text-xs text-muted-foreground">Total tareas</div>
        </CardContent></Card>
        <Card><CardContent className="py-4 text-center">
          <div className="text-2xl font-bold">{reviews.length}</div>
          <div className="text-xs text-muted-foreground">Total reviews</div>
        </CardContent></Card>
        <Card><CardContent className="py-4 text-center">
          <div className="text-2xl font-bold">
            {stats.taskStats.length ? (stats.taskStats.reduce((s, t) => s + t.avgClarity, 0) / stats.taskStats.filter(t => t.reviewCount > 0).length || 0).toFixed(1) : "—"}
          </div>
          <div className="text-xs text-muted-foreground">Promedio claridad</div>
        </CardContent></Card>
        <Card><CardContent className="py-4 text-center">
          <div className="text-2xl font-bold">
            {stats.taskStats.length ? (stats.taskStats.reduce((s, t) => s + t.avgDetail, 0) / stats.taskStats.filter(t => t.reviewCount > 0).length || 0).toFixed(1) : "—"}
          </div>
          <div className="text-xs text-muted-foreground">Promedio detalle</div>
        </CardContent></Card>
      </div>

      {/* Tasks per participant */}
      <Card>
        <CardHeader><CardTitle className="text-base">Tareas por participante</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {stats.tasksByParticipant.map((p) => (
              <div key={p.name} className="flex items-center gap-1">
                <span className="text-sm">{p.name}</span>
                <Badge variant="secondary">{p.count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Best and worst */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base text-green-700">🏆 Mejor calificadas</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2">
            {stats.best.map((t) => (
              <div key={t.id} className="flex items-center justify-between text-sm">
                <span>{t.title} <span className="text-muted-foreground">({t.ownerName})</span></span>
                <span className="text-green-600">{((t.avgClarity + t.avgDetail) / 2).toFixed(1)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base text-red-700">⚠️ Peor calificadas</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2">
            {stats.worst.map((t) => (
              <div key={t.id} className="flex items-center justify-between text-sm">
                <span>{t.title} <span className="text-muted-foreground">({t.ownerName})</span></span>
                <span className="text-red-600">{((t.avgClarity + t.avgDetail) / 2).toFixed(1)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Most commented */}
      <Card>
        <CardHeader><CardTitle className="text-base">💬 Más comentarios</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-2">
          {stats.mostCommented.filter(t => t.commentCount > 0).map((t) => (
            <div key={t.id} className="flex items-center justify-between text-sm">
              <span>{t.title} <span className="text-muted-foreground">({t.ownerName})</span></span>
              <Badge variant="outline">{t.commentCount} comentarios</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Consolidated board - Azure DevOps style */}
      <Card>
        <CardHeader><CardTitle className="text-base">📋 Tablero consolidado</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {["frontend", "backend", "QA", "análisis", "devops", "diseño", "otro"].map((type) => (
              <div key={type} className="flex flex-col gap-1">
                <div className={`text-xs font-medium px-2 py-1 rounded ${typeColors[type]}`}>{type} ({tasks.filter(t => t.type === type).length})</div>
                {tasks.filter((t) => t.type === type).map((task) => (
                  <div key={task.id} className="border rounded p-2 text-xs">
                    <div className="font-medium">{task.title}</div>
                    <div className="text-muted-foreground">{participants.find(p => p.id === task.participant_id)?.name}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
