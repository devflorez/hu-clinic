"use client";

import { useMemo } from "react";
import { Task, Review, Participant } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function Results({ tasks, reviews, participants }: { tasks: Task[]; reviews: Review[]; participants: Participant[] }) {
  const stats = useMemo(() => {
    const tasksByParticipant = participants
      .filter((p) => !p.is_facilitator)
      .map((p) => ({ name: p.name, count: tasks.filter((t) => t.participant_id === p.id).length }))
      .sort((a, b) => b.count - a.count);

    const taskStats = tasks.map((task) => {
      const taskReviews = reviews.filter((r) => r.task_id === task.id);
      const avgClarity = taskReviews.length ? taskReviews.reduce((s, r) => s + r.clarity, 0) / taskReviews.length : 0;
      const avgDetail = taskReviews.length ? taskReviews.reduce((s, r) => s + r.detail, 0) / taskReviews.length : 0;
      const commentCount = taskReviews.filter((r) => r.comment).length;
      const owner = participants.find((p) => p.id === task.participant_id);
      return { ...task, avgClarity, avgDetail, commentCount, reviewCount: taskReviews.length, ownerName: owner?.name || "?" };
    });

    const reviewed = taskStats.filter((t) => t.reviewCount > 0);
    const best = [...taskStats].sort((a, b) => (b.avgClarity + b.avgDetail) - (a.avgClarity + a.avgDetail)).slice(0, 5);
    const worst = [...reviewed].sort((a, b) => (a.avgClarity + a.avgDetail) - (b.avgClarity + b.avgDetail)).slice(0, 5);
    const mostCommented = [...taskStats].sort((a, b) => b.commentCount - a.commentCount).slice(0, 5);

    const avgClarity = reviewed.length ? reviewed.reduce((s, t) => s + t.avgClarity, 0) / reviewed.length : 0;
    const avgDetail = reviewed.length ? reviewed.reduce((s, t) => s + t.avgDetail, 0) / reviewed.length : 0;

    return { tasksByParticipant, taskStats, best, worst, mostCommented, avgClarity, avgDetail };
  }, [tasks, reviews, participants]);

  const typeColors: Record<string, string> = {
    frontend: "bg-blue-50 text-blue-700 border-blue-200",
    backend: "bg-green-50 text-green-700 border-green-200",
    QA: "bg-purple-50 text-purple-700 border-purple-200",
    "análisis": "bg-yellow-50 text-yellow-700 border-yellow-200",
    devops: "bg-orange-50 text-orange-700 border-orange-200",
    "diseño": "bg-pink-50 text-pink-700 border-pink-200",
    otro: "bg-gray-50 text-gray-700 border-gray-200",
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="py-5 text-center">
            <div className="text-3xl font-bold text-primary">{tasks.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Total tareas</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="py-5 text-center">
            <div className="text-3xl font-bold text-primary">{reviews.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Total reviews</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="py-5 text-center">
            <div className="text-3xl font-bold text-primary">{stats.avgClarity ? stats.avgClarity.toFixed(1) : "—"}</div>
            <div className="text-xs text-muted-foreground mt-1">Prom. claridad</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="py-5 text-center">
            <div className="text-3xl font-bold text-primary">{stats.avgDetail ? stats.avgDetail.toFixed(1) : "—"}</div>
            <div className="text-xs text-muted-foreground mt-1">Prom. detalle</div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks per participant */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">👥 Tareas por participante</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {stats.tasksByParticipant.map((p) => (
              <div key={p.name} className="flex items-center gap-2 bg-accent/50 rounded-lg px-3 py-2">
                <span className="text-sm font-medium">{p.name}</span>
                <Badge variant="secondary" className="font-bold">{p.count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Best and worst */}
      <div className="grid md:grid-cols-2 gap-5">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">🏆 Mejor calificadas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {stats.best.map((t, i) => (
              <div key={t.id} className="flex items-center justify-between gap-2 py-2 border-b last:border-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-muted-foreground font-mono w-4">{i + 1}.</span>
                  <span className="text-sm font-medium truncate">{t.title}</span>
                  <span className="text-xs text-muted-foreground shrink-0">({t.ownerName})</span>
                </div>
                <Badge className="bg-green-100 text-green-700 shrink-0">{((t.avgClarity + t.avgDetail) / 2).toFixed(1)}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">⚠️ Peor calificadas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {stats.worst.map((t, i) => (
              <div key={t.id} className="flex items-center justify-between gap-2 py-2 border-b last:border-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-muted-foreground font-mono w-4">{i + 1}.</span>
                  <span className="text-sm font-medium truncate">{t.title}</span>
                  <span className="text-xs text-muted-foreground shrink-0">({t.ownerName})</span>
                </div>
                <Badge className="bg-red-100 text-red-700 shrink-0">{((t.avgClarity + t.avgDetail) / 2).toFixed(1)}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Most commented */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">💬 Más comentarios</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {stats.mostCommented.filter(t => t.commentCount > 0).map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-2 py-2 border-b last:border-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-medium truncate">{t.title}</span>
                <span className="text-xs text-muted-foreground">({t.ownerName})</span>
              </div>
              <Badge variant="outline">{t.commentCount}</Badge>
            </div>
          ))}
          {stats.mostCommented.filter(t => t.commentCount > 0).length === 0 && (
            <p className="text-sm text-muted-foreground">Sin comentarios aún.</p>
          )}
        </CardContent>
      </Card>

      {/* Consolidated board - Azure DevOps style */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">📋 Tablero consolidado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {["frontend", "backend", "QA", "análisis", "devops", "diseño", "otro"].map((type) => (
              <div key={type} className="flex flex-col gap-2">
                <div className={`text-xs font-semibold px-3 py-1.5 rounded-md border ${typeColors[type]}`}>
                  {type} ({tasks.filter(t => t.type === type).length})
                </div>
                {tasks.filter((t) => t.type === type).map((task) => (
                  <div key={task.id} className="border rounded-lg p-2.5 text-xs bg-card shadow-sm">
                    <div className="font-medium leading-tight">{task.title}</div>
                    <div className="text-muted-foreground mt-1">{participants.find(p => p.id === task.participant_id)?.name}</div>
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
