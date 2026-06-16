"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Room, Task, TaskType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TASK_TYPES: TaskType[] = ["frontend", "backend", "QA", "análisis", "devops", "diseño", "otro"];

const typeColors: Record<string, string> = {
  frontend: "border-l-blue-500 bg-blue-50/50",
  backend: "border-l-green-500 bg-green-50/50",
  QA: "border-l-purple-500 bg-purple-50/50",
  "análisis": "border-l-yellow-500 bg-yellow-50/50",
  devops: "border-l-orange-500 bg-orange-50/50",
  "diseño": "border-l-pink-500 bg-pink-50/50",
  otro: "border-l-gray-500 bg-gray-50/50",
};

const typeBadgeColors: Record<string, string> = {
  frontend: "bg-blue-100 text-blue-700",
  backend: "bg-green-100 text-green-700",
  QA: "bg-purple-100 text-purple-700",
  "análisis": "bg-yellow-100 text-yellow-700",
  devops: "bg-orange-100 text-orange-700",
  "diseño": "bg-pink-100 text-pink-700",
  otro: "bg-gray-100 text-gray-700",
};

export function CreateTasks({ room, participantId }: { room: Room; participantId: string | null }) {
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", type: "otro" as TaskType, dependencies: "", done_criteria: "" });

  useEffect(() => {
    if (!participantId) return;
    supabase.from("tasks").select().eq("room_id", room.id).eq("participant_id", participantId)
      .then(({ data }) => { if (data) setMyTasks(data); });
  }, [room.id, participantId]);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantId) return;
    const { data, error } = await supabase.from("tasks")
      .insert({ room_id: room.id, participant_id: participantId, ...form })
      .select().single();
    if (data) {
      setMyTasks([...myTasks, data]);
      setForm({ title: "", description: "", type: "otro", dependencies: "", done_criteria: "" });
      setIsCreating(false);
      setSelectedTask(data);
    }
    if (error) alert(error.message);
  };

  const deleteTask = async (id: string) => {
    await supabase.from("tasks").delete().eq("id", id);
    setMyTasks(myTasks.filter((t) => t.id !== id));
    if (selectedTask?.id === id) setSelectedTask(null);
  };

  const startNew = () => {
    setSelectedTask(null);
    setIsCreating(true);
    setForm({ title: "", description: "", type: "otro", dependencies: "", done_criteria: "" });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-0 border rounded-xl overflow-hidden bg-card shadow-sm min-h-[500px]">
      {/* Left panel - Backlog list (Azure DevOps style) */}
      <div className="border-r flex flex-col">
        {/* Panel header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Backlog ({myTasks.length})
          </span>
          <Button size="sm" onClick={startNew} className="h-7 text-xs gap-1">
            + Nuevo
          </Button>
        </div>

        {/* Task list */}
        <div className="flex-1 overflow-y-auto">
          {myTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => { setSelectedTask(task); setIsCreating(false); }}
              className={`flex items-center gap-3 px-4 py-3 border-b cursor-pointer transition-colors hover:bg-accent/50 ${selectedTask?.id === task.id ? "bg-accent" : ""}`}
            >
              <div className={`w-1 h-8 rounded-full ${typeColors[task.type]?.includes("blue") ? "bg-blue-500" : typeColors[task.type]?.includes("green") ? "bg-green-500" : typeColors[task.type]?.includes("purple") ? "bg-purple-500" : typeColors[task.type]?.includes("yellow") ? "bg-yellow-500" : typeColors[task.type]?.includes("orange") ? "bg-orange-500" : typeColors[task.type]?.includes("pink") ? "bg-pink-500" : "bg-gray-400"}`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{task.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{task.type}</div>
              </div>
            </div>
          ))}
          {myTasks.length === 0 && !isCreating && (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="text-3xl mb-2">📋</div>
              <p className="text-sm text-muted-foreground">Sin tareas aún</p>
              <Button size="sm" variant="outline" onClick={startNew} className="mt-3 text-xs">
                Crear primera tarea
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Right panel - Detail/Form (Azure DevOps work item style) */}
      <div className="flex flex-col">
        {isCreating ? (
          // Create form
          <div className="flex-1 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-2 h-5 bg-primary rounded-full" />
              <h3 className="font-semibold text-lg">Nuevo Work Item</h3>
            </div>
            <form onSubmit={addTask} className="flex flex-col gap-4 max-w-xl">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Título</Label>
                <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-11 text-base font-medium" placeholder="¿Qué hay que hacer?" autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tipo</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as TaskType })}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TASK_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Dependencias</Label>
                  <Input value={form.dependencies} onChange={(e) => setForm({ ...form, dependencies: e.target.value })} placeholder="Ej: login, API" className="h-10" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Descripción</Label>
                <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="resize-none" placeholder="Detalla la tarea..." />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Criterio de terminado</Label>
                <Textarea rows={2} value={form.done_criteria} onChange={(e) => setForm({ ...form, done_criteria: e.target.value })} className="resize-none" placeholder="¿Cómo sabemos que está hecha?" />
              </div>
              <div className="flex gap-3 mt-2">
                <Button type="submit" className="h-10 font-semibold">Guardar work item</Button>
                <Button type="button" variant="ghost" onClick={() => setIsCreating(false)} className="h-10">Cancelar</Button>
              </div>
            </form>
          </div>
        ) : selectedTask ? (
          // Detail view
          <div className="flex-1 p-6">
            <div className={`border-l-4 rounded-r-lg p-5 mb-5 ${typeColors[selectedTask.type]}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge className={`text-xs mb-2 ${typeBadgeColors[selectedTask.type]}`}>{selectedTask.type}</Badge>
                  <h3 className="font-bold text-xl leading-tight">{selectedTask.title}</h3>
                </div>
                <Button size="sm" variant="ghost" onClick={() => deleteTask(selectedTask.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                  🗑️ Eliminar
                </Button>
              </div>
            </div>

            <div className="grid gap-5 max-w-xl">
              {selectedTask.description && (
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Descripción</Label>
                  <p className="mt-1.5 text-sm leading-relaxed">{selectedTask.description}</p>
                </div>
              )}
              {selectedTask.dependencies && (
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Dependencias</Label>
                  <p className="mt-1.5 text-sm">{selectedTask.dependencies}</p>
                </div>
              )}
              {selectedTask.done_criteria && (
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Criterio de terminado</Label>
                  <p className="mt-1.5 text-sm leading-relaxed">{selectedTask.done_criteria}</p>
                </div>
              )}
              {!selectedTask.description && !selectedTask.dependencies && !selectedTask.done_criteria && (
                <p className="text-sm text-muted-foreground">Sin detalles adicionales.</p>
              )}
            </div>
          </div>
        ) : (
          // Empty state
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="font-semibold text-lg mb-1">Selecciona o crea un work item</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Usa el panel izquierdo para ver tus tareas o crea una nueva con el botón &quot;+ Nuevo&quot;.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
