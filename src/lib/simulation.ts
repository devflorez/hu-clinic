import { supabase } from "@/lib/supabase";
import { PREDEFINED_HUS } from "@/lib/predefined-hus";
import { TaskType } from "@/types";

const VIRTUAL_PARTICIPANTS = [
  "Carlos Dev",
  "María QA",
  "Andrés Backend",
  "Laura Frontend",
  "Pedro DevOps",
  "Sofía Diseño",
  "Julián Análisis",
  "Camila Full",
];

const TASK_TYPES: TaskType[] = ["frontend", "backend", "QA", "análisis", "devops", "diseño", "otro"];

const SAMPLE_TASKS: { title: string; type: TaskType; description: string; done_criteria: string }[] = [
  { title: "Crear endpoint REST", type: "backend", description: "Implementar el endpoint con validaciones", done_criteria: "Endpoint responde 200 con datos correctos" },
  { title: "Diseñar componente UI", type: "frontend", description: "Crear el componente según el diseño en Figma", done_criteria: "Componente renderiza correctamente" },
  { title: "Escribir pruebas unitarias", type: "QA", description: "Cobertura mínima del 80%", done_criteria: "Tests pasan en CI" },
  { title: "Configurar pipeline CI/CD", type: "devops", description: "Configurar build y deploy automático", done_criteria: "Pipeline verde en main" },
  { title: "Análisis de requerimientos", type: "análisis", description: "Documentar casos de uso y edge cases", done_criteria: "Documento aprobado por el equipo" },
  { title: "Crear mockups de pantalla", type: "diseño", description: "Propuesta visual para la funcionalidad", done_criteria: "Mockup aprobado por PO" },
  { title: "Migración de datos", type: "backend", description: "Script para migrar registros existentes", done_criteria: "Datos migrados sin pérdida" },
  { title: "Validación de formularios", type: "frontend", description: "Validar inputs del usuario", done_criteria: "Errores se muestran correctamente" },
  { title: "Pruebas de integración", type: "QA", description: "Verificar flujo completo end-to-end", done_criteria: "Flujo funciona sin errores" },
  { title: "Documentar API", type: "análisis", description: "Swagger o Postman collection", done_criteria: "Documentación publicada" },
  { title: "Revisión de accesibilidad", type: "diseño", description: "Verificar contraste y navegación por teclado", done_criteria: "Cumple WCAG AA" },
  { title: "Configurar monitoreo", type: "devops", description: "Alertas y dashboards de observabilidad", done_criteria: "Alertas configuradas" },
  { title: "Crear servicio de notificaciones", type: "backend", description: "Enviar notificaciones al usuario", done_criteria: "Notificaciones se reciben" },
  { title: "Implementar filtros de búsqueda", type: "frontend", description: "Filtros por fecha y estado", done_criteria: "Filtros funcionan correctamente" },
  { title: "Test de carga", type: "QA", description: "Simular usuarios concurrentes", done_criteria: "Respuesta < 2s con 100 usuarios" },
];

const COMMENTS = [
  "Buen nivel de detalle",
  "Podría ser más específica",
  "Me parece redundante con otra tarea",
  "Yo la haría diferente, separándola en dos",
  "Falta definir el criterio de éxito",
  "Está clara y bien definida",
  "",
  "",
  "",
];

const ALTERNATIVES = [
  "La abordaría con TDD",
  "Yo primero haría un spike técnico",
  "La combinaría con otra tarea similar",
  "Usaría un enfoque diferente para el backend",
  "",
  "",
  "",
];

export type LogEntry = { time: string; message: string };

type LogFn = (msg: string) => void;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function runSimulation(log: LogFn) {
  const hu = PREDEFINED_HUS[PREDEFINED_HUS.length - 1]; // Use the biggest one (77207)
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const numParticipants = randomBetween(6, 8);
  const participants = VIRTUAL_PARTICIPANTS.slice(0, numParticipants);

  // 1. Create room (like facilitator)
  log(`Creando sala con código ${code}...`);
  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .insert({
      code,
      title: hu.title,
      description: hu.description,
      acceptance_criteria: hu.acceptance_criteria,
      story_points: hu.story_points,
      assignee: hu.assignee,
      activated_at: hu.activated_at,
      closed_at: hu.closed_at,
    })
    .select()
    .single();

  if (roomError || !room) {
    log(`❌ Error creando sala: ${roomError?.message}`);
    return null;
  }
  log(`✅ Sala creada: ${room.code}`);

  // Create real items and tasks
  for (const item of hu.real_items) {
    const { data: realItem } = await supabase
      .from("real_items")
      .insert({
        room_id: room.id,
        external_id: item.external_id,
        title: item.title,
        description: item.description,
        points: hu.story_points,
        assignee: hu.assignee,
        activated_at: hu.activated_at,
        closed_at: hu.closed_at,
      })
      .select()
      .single();

    if (realItem && item.tasks.length > 0) {
      await supabase.from("real_tasks").insert(
        item.tasks.map((t) => ({
          real_item_id: realItem.id,
          external_id: t.external_id,
          title: t.title,
          description: t.description,
        }))
      );
    }
  }
  log(`✅ Ítems reales creados (${hu.real_items[0]?.tasks.length} tasks)`);

  // 2. Create facilitator
  const { data: facilitator } = await supabase
    .from("participants")
    .insert({ room_id: room.id, name: "Facilitador Virtual", is_facilitator: true })
    .select()
    .single();
  log(`✅ Facilitador creado`);

  // 3. Participants join (like real users joining)
  await delay(500);
  const participantRecords: { id: string; name: string }[] = [];
  for (const name of participants) {
    const { data } = await supabase
      .from("participants")
      .insert({ room_id: room.id, name, is_facilitator: false })
      .select()
      .single();
    if (data) participantRecords.push(data);
    log(`👤 ${name} se unió a la sala`);
    await delay(200);
  }

  // 4. Move to READ_HU
  await delay(1000);
  log(`\n⏭️ Avanzando a fase: READ_HU`);
  await supabase.from("rooms").update({ current_phase: "READ_HU" }).eq("id", room.id);
  await delay(1500);

  // 5. Move to CREATE_TASKS
  log(`\n⏭️ Avanzando a fase: CREATE_TASKS`);
  await supabase.from("rooms").update({ current_phase: "CREATE_TASKS" }).eq("id", room.id);
  await delay(500);

  // Each participant creates 3-5 tasks
  const allTasks: { id: string; participant_id: string }[] = [];
  for (const p of participantRecords) {
    const numTasks = randomBetween(3, 5);
    for (let i = 0; i < numTasks; i++) {
      const sample = pick(SAMPLE_TASKS);
      const { data: task } = await supabase
        .from("tasks")
        .insert({
          room_id: room.id,
          participant_id: p.id,
          title: sample.title + ` (${p.name.split(" ")[0]})`,
          description: sample.description,
          type: sample.type,
          dependencies: Math.random() > 0.5 ? "tarea anterior" : "",
          done_criteria: sample.done_criteria,
        })
        .select()
        .single();
      if (task) allTasks.push({ id: task.id, participant_id: p.id });
    }
    log(`✏️ ${p.name} creó ${numTasks} tareas`);
    await delay(300);
  }

  // 6. Move to REVIEW
  await delay(1000);
  log(`\n⏭️ Avanzando a fase: REVIEW`);
  await supabase.from("rooms").update({ current_phase: "REVIEW" }).eq("id", room.id);
  await delay(500);

  // Each participant reviews 2-3 other participants' tasks
  for (const reviewer of participantRecords) {
    const others = participantRecords.filter((p) => p.id !== reviewer.id);
    const toReview = others.slice(0, randomBetween(2, 3));
    let reviewCount = 0;

    for (const target of toReview) {
      const targetTasks = allTasks.filter((t) => t.participant_id === target.id);
      for (const task of targetTasks) {
        await supabase.from("reviews").insert({
          task_id: task.id,
          reviewer_id: reviewer.id,
          clarity: randomBetween(2, 5),
          is_necessary: Math.random() > 0.2,
          detail: randomBetween(2, 5),
          alternative_approach: pick(ALTERNATIVES),
          comment: pick(COMMENTS),
        });
        reviewCount++;
      }
    }
    log(`👀 ${reviewer.name} revisó ${reviewCount} tareas`);
    await delay(200);
  }

  // 7. Move to RESULTS
  await delay(1000);
  log(`\n⏭️ Avanzando a fase: RESULTS`);
  await supabase.from("rooms").update({ current_phase: "RESULTS" }).eq("id", room.id);
  await delay(1500);

  // 8. Move to REAL_COMPARISON
  log(`\n⏭️ Avanzando a fase: REAL_COMPARISON`);
  await supabase.from("rooms").update({ current_phase: "REAL_COMPARISON" }).eq("id", room.id);
  await delay(500);

  // Create some matches
  const { data: realItems } = await supabase.from("real_items").select().eq("room_id", room.id);
  if (realItems && realItems.length > 0) {
    const ri = realItems[0];
    const tasksToMatch = allTasks.slice(0, Math.min(8, allTasks.length));
    for (const task of tasksToMatch) {
      const coverage = pick(["full", "partial", "none", "partial"] as const);
      await supabase.from("real_item_matches").insert({
        real_item_id: ri.id,
        task_id: task.id,
        coverage,
      });
    }
    log(`🔗 Comparación realizada con ${tasksToMatch.length} tareas mapeadas`);
  }

  // 9. Move to FINISHED
  await delay(1000);
  log(`\n⏭️ Avanzando a fase: FINISHED`);
  await supabase.from("rooms").update({ current_phase: "FINISHED" }).eq("id", room.id);

  log(`\n🎉 Simulación completada exitosamente`);
  log(`📊 Resumen: ${participantRecords.length} participantes, ${allTasks.length} tareas, múltiples reviews`);
  log(`🔗 Puedes ver la sala en: /room/${code}`);

  return code;
}
