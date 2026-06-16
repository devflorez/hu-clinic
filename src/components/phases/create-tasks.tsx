"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Room, Task, TaskType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TASK_TYPES: TaskType[] = ["frontend", "backend", "QA", "análisis", "devops", "diseño", "otro"];

export function CreateTasks({ room, participantId }: { room: Room; participantId: string | null }) {
  const [myTasks, setMyTasks] = useState<Task[]>([]);
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
    }
    if (error) alert(error.message);
  };

  const deleteTask = async (id: string) => {
    await supabase.from("tasks").delete().eq("id", id);
    setMyTasks(myTasks.filter((t) => t.id !== id));
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Form */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">✏️ Agregar tarea</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addTask} className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Título</Label>
              <Input id="task-title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-desc">Descripción</Label>
              <Textarea id="task-desc" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="resize-none" />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as TaskType })}>
                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TASK_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-deps">Dependencias</Label>
              <Input id="task-deps" value={form.dependencies} onChange={(e) => setForm({ ...form, dependencies: e.target.value })} placeholder="Ej: login, base de datos" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-done">Criterio de terminado</Label>
              <Textarea id="task-done" rows={2} value={form.done_criteria} onChange={(e) => setForm({ ...form, done_criteria: e.target.value })} className="resize-none" />
            </div>
            <Button type="submit" size="lg" className="h-11 font-semibold mt-1">Agregar tarea</Button>
          </form>
        </CardContent>
      </Card>

      {/* My tasks list */}
      <div className="flex flex-col gap-3">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Mis tareas ({myTasks.length})
        </h3>
        {myTasks.map((task) => (
          <Card key={task.id} className="shadow-sm">
            <CardContent className="py-4 px-5 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-[15px] leading-tight">{task.title}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-xs">{task.type}</Badge>
                  <Button size="sm" variant="ghost" onClick={() => deleteTask(task.id)} className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive">✕</Button>
                </div>
              </div>
              {task.description && <p className="text-sm text-muted-foreground leading-relaxed">{task.description}</p>}
              {task.dependencies && <p className="text-xs text-muted-foreground">🔗 {task.dependencies}</p>}
              {task.done_criteria && <p className="text-xs text-muted-foreground">✓ {task.done_criteria}</p>}
            </CardContent>
          </Card>
        ))}
        {myTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-muted-foreground text-sm">Aún no has creado tareas.</p>
            <p className="text-muted-foreground text-xs mt-1">Usa el formulario para agregar tu primera tarea.</p>
          </div>
        )}
      </div>
    </div>
  );
}
