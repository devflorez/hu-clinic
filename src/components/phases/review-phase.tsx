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

function getAssignments(participants: Participant[], currentId: string): string[] {
  // Assign each participant 2-3 other participants' boards to review
  const others = participants.filter((p) => p.id !== currentId && !p.is_facilitator);
  // Simple round-robin: take up to 3
  const shuffled = [...others].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(3, shuffled.length)).map((p) => p.id);
}

export function ReviewPhase({ room, participants, tasks, reviews, participantId }: {
  room: Room; participants: Participant[]; tasks: Task[]; reviews: Review[]; participantId: string | null;
}) {
  const [assignments, setAssignments] = useState<string[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState({ clarity: 3, is_necessary: true, detail: 3, alternative_approach: "", comment: "" });
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [submittedReviews, setSubmittedReviews] = useState<Set<string>>(new Set());

  // Generate stable assignments using a seed based on participant ID
  useEffect(() => {
    if (!participantId) return;
    const nonFacilitators = participants.filter((p) => !p.is_facilitator);
    const others = nonFacilitators.filter((p) => p.id !== participantId);
    // Deterministic assignment: use participantId char codes as seed
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

  // Track submitted reviews
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
      <Card>
        <CardContent className="py-6">
          <p className="text-muted-foreground">Los participantes están revisando las tareas de otros tableros...</p>
          <p className="mt-2">Reviews completadas: {reviews.length}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Board selector */}
      <div className="flex gap-2 flex-wrap">
        {assignments.map((pid) => {
          const p = participants.find((x) => x.id === pid);
          const boardDone = tasks.filter((t) => t.participant_id === pid).every((t) => submittedReviews.has(t.id));
          return (
            <Button key={pid} variant={selectedBoard === pid ? "default" : "outline"} size="sm"
              onClick={() => { setSelectedBoard(pid); setCurrentTaskIndex(0); }}>
              {p?.name || "?"} {boardDone && "✓"}
            </Button>
          );
        })}
      </div>

      {selectedBoard && boardTasks.length > 0 && currentTask && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Task being reviewed */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Tablero de {boardOwner?.name} — Tarea {currentTaskIndex + 1}/{boardTasks.length}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{currentTask.title}</span>
                <Badge variant="outline">{currentTask.type}</Badge>
              </div>
              {currentTask.description && <p className="text-sm">{currentTask.description}</p>}
              {currentTask.dependencies && <p className="text-xs text-muted-foreground">Dependencias: {currentTask.dependencies}</p>}
              {currentTask.done_criteria && <p className="text-xs text-muted-foreground">Criterio: {currentTask.done_criteria}</p>}

              <div className="flex gap-1 mt-2">
                {boardTasks.map((_, i) => (
                  <Button key={i} size="sm" variant={i === currentTaskIndex ? "default" : "ghost"}
                    onClick={() => setCurrentTaskIndex(i)} className="w-8 h-8 p-0">
                    {submittedReviews.has(boardTasks[i].id) ? "✓" : i + 1}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Review form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tu revisión</CardTitle>
            </CardHeader>
            <CardContent>
              {submittedReviews.has(currentTask.id) ? (
                <p className="text-green-600 font-medium">✓ Ya revisaste esta tarea</p>
              ) : (
                <div className="flex flex-col gap-3">
                  <div>
                    <Label>¿Se entiende la tarea? (Claridad 1-5)</Label>
                    <Select value={String(reviewForm.clarity)} onValueChange={(v) => setReviewForm({ ...reviewForm, clarity: Number(v) })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>¿Es necesaria?</Label>
                    <Select value={reviewForm.is_necessary ? "yes" : "no"} onValueChange={(v) => setReviewForm({ ...reviewForm, is_necessary: v === "yes" })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Sí</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>¿Está bien detallada? (Detalle 1-5)</Label>
                    <Select value={String(reviewForm.detail)} onValueChange={(v) => setReviewForm({ ...reviewForm, detail: Number(v) })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>¿La harías así o tomarías otro camino?</Label>
                    <Textarea rows={2} value={reviewForm.alternative_approach} onChange={(e) => setReviewForm({ ...reviewForm, alternative_approach: e.target.value })} />
                  </div>
                  <div>
                    <Label>Comentario (opcional)</Label>
                    <Textarea rows={2} value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} />
                  </div>
                  <Button onClick={submitReview}>Enviar revisión</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {selectedBoard && boardTasks.length === 0 && (
        <p className="text-muted-foreground">Este participante no creó tareas.</p>
      )}
    </div>
  );
}
