"use client";

import { use } from "react";
import { useRoom } from "@/hooks/use-room";
import { useTimer } from "@/hooks/use-timer";
import { WaitingRoom } from "@/components/phases/waiting-room";
import { ReadHU } from "@/components/phases/read-hu";
import { CreateTasks } from "@/components/phases/create-tasks";
import { ReviewPhase } from "@/components/phases/review-phase";
import { Results } from "@/components/phases/results";
import { RealComparison } from "@/components/phases/real-comparison";
import { Finished } from "@/components/phases/finished";
import { FacilitatorControls } from "@/components/facilitator-controls";
import { Badge } from "@/components/ui/badge";

export default function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const { room, participants, tasks, reviews, loading } = useRoom(code);
  const { display, remaining } = useTimer(room?.timer_end_at ?? null);

  if (loading) return <div className="flex flex-1 items-center justify-center">Cargando...</div>;
  if (!room) return <div className="flex flex-1 items-center justify-center">Sala no encontrada</div>;

  const participantId = typeof window !== "undefined" ? sessionStorage.getItem("participant_id") : null;
  const isFacilitator = typeof window !== "undefined" ? sessionStorage.getItem("is_facilitator") === "true" : false;

  const phaseLabels: Record<string, string> = {
    WAITING_ROOM: "Sala de espera",
    READ_HU: "Lectura de HU",
    CREATE_TASKS: "Crear tareas",
    REVIEW: "Revisión cruzada",
    RESULTS: "Resultados",
    REAL_COMPARISON: "Comparación real",
    FINISHED: "Finalizado",
  };

  return (
    <div className="flex flex-col flex-1 p-4 gap-4 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">🏥 {room.title}</h1>
          <Badge variant="secondary">Código: {room.code}</Badge>
          <Badge>{phaseLabels[room.current_phase] || room.current_phase}</Badge>
        </div>
        {room.timer_end_at && remaining > 0 && (
          <Badge variant="destructive" className="text-base px-3 py-1">⏱ {display}</Badge>
        )}
      </div>

      {/* Facilitator Controls */}
      {isFacilitator && <FacilitatorControls room={room} />}

      {/* Phase Content */}
      {room.current_phase === "WAITING_ROOM" && <WaitingRoom room={room} participants={participants} />}
      {room.current_phase === "READ_HU" && <ReadHU room={room} />}
      {room.current_phase === "CREATE_TASKS" && <CreateTasks room={room} participantId={participantId} />}
      {room.current_phase === "REVIEW" && <ReviewPhase room={room} participants={participants} tasks={tasks} reviews={reviews} participantId={participantId} />}
      {room.current_phase === "RESULTS" && <Results tasks={tasks} reviews={reviews} participants={participants} />}
      {room.current_phase === "REAL_COMPARISON" && <RealComparison room={room} tasks={tasks} participants={participants} isFacilitator={isFacilitator} />}
      {room.current_phase === "FINISHED" && <Finished />}
    </div>
  );
}
