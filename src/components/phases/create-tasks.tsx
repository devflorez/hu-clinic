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
    <div className="grid md:grid-cols-2 gap-4">
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Agregar tarea</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addTask} className="flex flex-col gap-3">
            <div>
              <Label htmlFor="task-title">Título</Label>
              <Input id="task-title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="task-desc">Descripción</Label>
              <Textarea id="task-desc" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as TaskType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TASK_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="task-deps">Dependencias</Label>
              <Input id="task-deps" value={form.dependencies} onChange={(e) => setForm({ ...form, dependencies: e.target.value })} placeholder="Ej: login, base de datos" />
            </div>
            <div>
              <Label htmlFor="task-done">Criterio de terminado</Label>
              <Textarea id="task-done" rows={2} value={form.done_criteria} onChange={(e) => setForm({ ...form, done_criteria: e.target.value })} />
            </div>
            <Button type="submit">Agregar</Button>
          </form>
        </CardContent>
      </Card>

      {/* My tasks list */}
      <div className="flex flex-col gap-2">
        <h3 className="font-medium">Mis tareas ({myTasks.length})</h3>
        {myTasks.map((task) => (
          <Card key={task.id}>
            <CardContent className="py-3 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">{task.title}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{task.type}</Badge>
                  <Button size="sm" variant="ghost" onClick={() => deleteTask(task.id)}>✕</Button>
                </div>
              </div>
              {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
              {task.done_criteria && <p className="text-xs text-muted-foreground">✓ {task.done_criteria}</p>}
            </CardContent>
          </Card>
        ))}
        {myTasks.length === 0 && <p className="text-muted-foreground text-sm">Aún no has creado tareas.</p>}
      </div>
    </div>
  );
}
