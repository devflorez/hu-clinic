"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Room, Participant, Task, Review } from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ReviewPhase({ room, participants, tasks, reviews, participantId }: {
  room: Room; participants: Participant[]; tasks: Task[]; reviews: Review[]; participantId: string | null;
}) {
  const [assignments, setAssignments] = useState<string[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState({ clarity: 3, is_necessary: true, detail: 3, alternative_approach: "", comment: "" });
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [submittedReviews, setSubmittedReviews] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!participantId) return;
    const nonFacilitators = participants.filter((p) => !p.is_facilitator);
    const others = nonFacilitators.filter((p) => p.id !== participantId);
    const seed = participantId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const sorted = [...others].sort((a, b) => {
      const ha = (a.id.charCodeAt(0) + seed) % 100;
      const hb = (b.id.charCodeAt(0) + seed) % 100;
      return ha - hb;
    });
    const assigned = sorted.slice(0, Math.min(3, sorted.length)).map((p) => p.id);
    setAssignments(assigned);
    if (assigned.length > 0) setSelectedBoard(assigned[0]);
  }, [participantId, participants]);

  useEffect(() => {
    if (!participantId) return;
    const myReviews = reviews.filter((r) => r.reviewer_id === participantId);
    setSubmittedReviews(new Set(myReviews.map((r) => r.task_id)));
  }, [reviews, participantId]);

  const boardTasks = useMemo(() => {
    if (!selectedBoard) return [];
    return tasks.filter((t) => t.participant_id === selectedBoard);
  }, [selectedBoard, tasks]);

  const currentTask = boardTasks[currentTaskIndex];
  const boardOwner = participants.find((p) => p.id === selectedBoard);

  const submitReview = async () => {
    if (!currentTask || !participantId) return;
    await supabase.from("reviews").insert({
      task_id: currentTask.id,
      reviewer_id: participantId,
      ...reviewForm,
    });
    setSubmittedReviews(new Set([...submittedReviews, currentTask.id]));
    setReviewForm({ clarity: 3, is_necessary: true, detail: 3, alternative_approach: "", comment: "" });
    if (currentTaskIndex < boardTasks.length - 1) setCurrentTaskIndex(currentTaskIndex + 1);
  };

  if (!participantId) return <p>Error: no se encontró tu identidad de participante.</p>;

  const isFacilitator = participants.find((p) => p.id === participantId)?.is_facilitator;
  if (isFacilitator) {
    return (
      <Card className="shadow-sm">
        <CardContent className="py-8 text-center">
          <div className="text-4xl mb-3">👀</div>
          <p className="text-muted-foreground">Los participantes están revisando las tareas de otros tableros...</p>
          <p className="mt-3 text-2xl font-bold">{reviews.length}</p>
          <p className="text-xs text-muted-foreground">Reviews completadas</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Board selector */}
      <div className="flex gap-3 flex-wrap">
        {assignments.map((pid) => {
          const p = participants.find((x) => x.id === pid);
          const boardDone = tasks.filter((t) => t.participant_id === pid).every((t) => submittedReviews.has(t.id));
          return (
            <Button key={pid} variant={selectedBoard === pid ? "default" : "outline"} size="sm"
              onClick={() => { setSelectedBoard(pid); setCurrentTaskIndex(0); }}
              className="gap-2">
              {p?.name === "__real__" ? "Participante Anónimo" : p?.name || "?"} {boardDone && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">✓</Badge>}
            </Button>
          );
        })}
      </div>

      {selectedBoard && boardTasks.length > 0 && currentTask && (
        <div className="grid md:grid-cols-2 gap-5">
          {/* Task being reviewed */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Tablero de {boardOwner?.name === "__real__" ? "Participante Anónimo" : boardOwner?.name}</CardTitle>
                <Badge variant="secondary" className="text-xs">Tarea {currentTaskIndex + 1}/{boardTasks.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="bg-accent/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-[15px]">{currentTask.title}</span>
                  <Badge variant="outline" className="text-xs">{currentTask.type}</Badge>
                </div>
                {currentTask.description && <p className="text-sm leading-relaxed">{currentTask.description}</p>}
                {currentTask.dependencies && <p className="text-xs text-muted-foreground mt-2">🔗 {currentTask.dependencies}</p>}
                {currentTask.done_criteria && <p className="text-xs text-muted-foreground mt-1">✓ {currentTask.done_criteria}</p>}
              </div>

              <div className="flex gap-1.5 flex-wrap">
                {boardTasks.map((_, i) => (
                  <Button key={i} size="sm" variant={i === currentTaskIndex ? "default" : "outline"}
                    onClick={() => setCurrentTaskIndex(i)} className="w-9 h-9 p-0 text-xs font-medium">
                    {submittedReviews.has(boardTasks[i].id) ? "✓" : i + 1}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Review form */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">📝 Tu revisión</CardTitle>
            </CardHeader>
            <CardContent>
              {submittedReviews.has(currentTask.id) ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xl mb-3">✓</div>
                  <p className="text-green-700 font-medium">Ya revisaste esta tarea</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <Label>¿Se entiende la tarea? (Claridad)</Label>
                    <Select value={String(reviewForm.clarity)} onValueChange={(v) => setReviewForm({ ...reviewForm, clarity: Number(v) })}>
                      <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 — Nada clara</SelectItem>
                        <SelectItem value="2">2 — Poco clara</SelectItem>
                        <SelectItem value="3">3 — Aceptable</SelectItem>
                        <SelectItem value="4">4 — Clara</SelectItem>
                        <SelectItem value="5">5 — Muy clara</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>¿Es necesaria?</Label>
                    <Select value={reviewForm.is_necessary ? "si" : "no"} onValueChange={(v) => setReviewForm({ ...reviewForm, is_necessary: v === "si" })}>
                      <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="si">Sí</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>¿Está bien detallada? (Detalle)</Label>
                    <Select value={String(reviewForm.detail)} onValueChange={(v) => setReviewForm({ ...reviewForm, detail: Number(v) })}>
                      <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 — Sin detalle</SelectItem>
                        <SelectItem value="2">2 — Poco detalle</SelectItem>
                        <SelectItem value="3">3 — Aceptable</SelectItem>
                        <SelectItem value="4">4 — Buen detalle</SelectItem>
                        <SelectItem value="5">5 — Muy detallada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>¿La harías así o tomarías otro camino?</Label>
                    <Textarea rows={2} value={reviewForm.alternative_approach} onChange={(e) => setReviewForm({ ...reviewForm, alternative_approach: e.target.value })} className="resize-none" />
                  </div>
                  <div className="space-y-2">
                    <Label>Comentario (opcional)</Label>
                    <Textarea rows={2} value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} className="resize-none" />
                  </div>
                  <Button onClick={submitReview} size="lg" className="h-11 font-semibold mt-1">Enviar revisión</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {selectedBoard && boardTasks.length === 0 && (
        <Card className="shadow-sm">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Este participante no creó tareas.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
