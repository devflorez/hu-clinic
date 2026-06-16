"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Room, Participant, Task, Review } from "@/types";

export function useRoom(code: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoom = useCallback(async () => {
    const { data } = await supabase.from("rooms").select().eq("code", code).single();
    if (data) setRoom(data);
  }, [code]);

  const fetchParticipants = useCallback(async (roomId: string) => {
    const { data } = await supabase.from("participants").select().eq("room_id", roomId);
    if (data) setParticipants(data);
  }, []);

  const fetchTasks = useCallback(async (roomId: string) => {
    const { data } = await supabase.from("tasks").select().eq("room_id", roomId);
    if (data) setTasks(data);
  }, []);

  const fetchReviews = useCallback(async (roomId: string) => {
    const { data } = await supabase.from("reviews").select();
    if (data) setReviews(data);
  }, []);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const init = async () => {
      const { data: roomData } = await supabase.from("rooms").select().eq("code", code).single();
      if (!roomData) { setLoading(false); return; }
      setRoom(roomData);

      await Promise.all([
        fetchParticipants(roomData.id),
        fetchTasks(roomData.id),
        fetchReviews(roomData.id),
      ]);
      setLoading(false);

      // Subscribe to realtime changes
      channel = supabase
        .channel(`room-${roomData.id}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "rooms", filter: `id=eq.${roomData.id}` },
          (payload) => {
            if (payload.eventType === "DELETE") { setRoom(null); }
            else if (payload.new) { setRoom(payload.new as Room); }
          }
        )
        .on("postgres_changes", { event: "*", schema: "public", table: "participants", filter: `room_id=eq.${roomData.id}` },
          () => { fetchParticipants(roomData.id); }
        )
        .on("postgres_changes", { event: "*", schema: "public", table: "tasks", filter: `room_id=eq.${roomData.id}` },
          () => { fetchTasks(roomData.id); }
        )
        .on("postgres_changes", { event: "*", schema: "public", table: "reviews" },
          () => { fetchReviews(roomData.id); }
        )
        .subscribe();
    };

    init();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [code, fetchParticipants, fetchTasks, fetchReviews]);

  return { room, participants, tasks, reviews, loading, refetch: fetchRoom };
}
