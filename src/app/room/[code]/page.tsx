"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useRoom } from "@/hooks/use-room";
import { useTimer } from "@/hooks/use-timer";
import { supabase } from "@/lib/supabase";
import { WaitingRoom } from "@/components/phases/waiting-room";
import { ReadHU } from "@/components/phases/read-hu";
import { CreateTasks } from "@/components/phases/create-tasks";
import { ReviewPhase } from "@/components/phases/review-phase";
import { Results } from "@/components/phases/results";
import { RealComparison } from "@/components/phases/real-comparison";
import { Finished } from "@/components/phases/finished";
import { FacilitatorControls } from "@/components/facilitator-controls";
import { Spinner } from "@/components/spinner";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const { room, participants, tasks, reviews, loading } = useRoom(code);
  const { display, remaining } = useTimer(room?.timer_end_at ?? null);

  if (loading) return <div className="flex flex-1 items-center justify-center"><Spinner text="Conectando a la sala..." /></div>;
  if (!room) {
    if (typeof window !== "undefined") {
      sessionStorage.clear();
      window.location.href = "/";
    }
    return <div className="flex flex-1 items-center justify-center"><Spinner text="La sala fue eliminada. Redirigiendo..." /></div>;
  }

  const participantId = typeof window !== "undefined" ? sessionStorage.getItem("participant_id") : null;
  const isFacilitator = typeof window !== "undefined" ? sessionStorage.getItem("is_facilitator") === "true" : false;

  const handleDeleteRoom = async () => {
    if (!confirm("¿Eliminar esta sala? Se perderán todos los datos.")) return;
    await supabase.from("rooms").delete().eq("id", room.id);
    sessionStorage.clear();
    router.push("/");
  };

  const handleLeaveRoom = async () => {
    if (!confirm("¿Salir de esta sala?")) return;
    if (participantId) {
      await supabase.from("participants").delete().eq("id", participantId);
    }
    sessionStorage.clear();
    router.push("/");
  };

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
    <div className="flex flex-col flex-1 p-6 md:p-8 gap-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-5 border-b">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 shrink-0">
            <Image src="/logo.svg" alt="TaskSplit" width={40} height={40} />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">{room.title}</h1>
            <div className="flex items-center gap-2.5 mt-1.5">
              <Badge variant="secondary" className="text-xs font-mono px-2.5 py-0.5">{room.code}</Badge>
              <Badge className="text-xs px-2.5 py-0.5">{phaseLabels[room.current_phase] || room.current_phase}</Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {room.timer_end_at && remaining > 0 && (
            <div className="flex items-center gap-2 bg-destructive/10 text-destructive px-5 py-2.5 rounded-xl">
              <span className="text-sm">⏱</span>
              <span className="text-xl font-bold font-mono">{display}</span>
            </div>
          )}
          {isFacilitator ? (
            <Button size="sm" variant="destructive" onClick={handleDeleteRoom} className="text-xs h-9 px-4">
              🗑️ Eliminar
            </Button>
          ) : (
            <Button size="sm" variant="ghost" onClick={handleLeaveRoom} className="text-xs text-muted-foreground h-9 px-4">
              Salir
            </Button>
          )}
        </div>
      </div>

      {/* Facilitator Controls */}
      {isFacilitator && <FacilitatorControls room={room} />}

      {/* Phase Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={room.current_phase}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="flex-1"
        >
          {room.current_phase === "WAITING_ROOM" && <WaitingRoom room={room} participants={participants} />}
          {room.current_phase === "READ_HU" && <ReadHU room={room} />}
          {room.current_phase === "CREATE_TASKS" && <CreateTasks room={room} participantId={participantId} />}
          {room.current_phase === "REVIEW" && <ReviewPhase room={room} participants={participants} tasks={tasks} reviews={reviews} participantId={participantId} />}
          {room.current_phase === "RESULTS" && <Results tasks={tasks} reviews={reviews} participants={participants} />}
          {room.current_phase === "REAL_COMPARISON" && <RealComparison room={room} tasks={tasks} participants={participants} isFacilitator={isFacilitator} reviews={reviews} />}
          {room.current_phase === "FINISHED" && <Finished />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
