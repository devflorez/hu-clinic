"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Room, Participant, Task, Review } from "@/types";

export function useRoom(code: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchParticipants = useCallback(async (roomId: string) => {
    const { data } = await supabase.from("participants").select().eq("room_id", roomId);
    if (data) setParticipants(data);
  }, []);

  const fetchTasks = useCallback(async (roomId: string) => {
    const { data } = await supabase.from("tasks").select().eq("room_id", roomId);
    if (data) setTasks(data);
  }, []);

  const fetchReviews = useCallback(async (roomId: string) => {
    const { data: roomTasks } = await supabase.from("tasks").select("id").eq("room_id", roomId);
    if (!roomTasks || roomTasks.length === 0) { setReviews([]); return; }
    const taskIds = roomTasks.map((t) => t.id);
    const { data } = await supabase.from("reviews").select().in("task_id", taskIds);
    if (data) setReviews(data);
  }, []);

  useEffect(() => {
    // Cleanup previous channel if any
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    let cancelled = false;

    const init = async () => {
      const { data: roomData } = await supabase.from("rooms").select().eq("code", code).single();
      if (cancelled) return;
      if (!roomData) { setLoading(false); return; }
      setRoom(roomData);

      await Promise.all([
        fetchParticipants(roomData.id),
        fetchTasks(roomData.id),
        fetchReviews(roomData.id),
      ]);
      if (cancelled) return;
      setLoading(false);

      // Create a unique channel name to avoid conflicts
      const channelName = `room-${roomData.id}-${Date.now()}`;
      const channel = supabase.channel(channelName);

      channel.on("postgres_changes", { event: "*", schema: "public", table: "rooms", filter: `id=eq.${roomData.id}` },
        (payload) => {
          if (payload.eventType === "DELETE") { setRoom(null); }
          else if (payload.new) { setRoom(payload.new as Room); }
        }
      );
      channel.on("postgres_changes", { event: "*", schema: "public", table: "participants", filter: `room_id=eq.${roomData.id}` },
        () => { fetchParticipants(roomData.id); }
      );
      channel.on("postgres_changes", { event: "*", schema: "public", table: "tasks", filter: `room_id=eq.${roomData.id}` },
        () => { fetchTasks(roomData.id); }
      );
      channel.on("postgres_changes", { event: "*", schema: "public", table: "reviews" },
        () => { fetchReviews(roomData.id); }
      );

      channel.subscribe();
      channelRef.current = channel;
    };

    init();

    return () => {
      cancelled = true;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [code, fetchParticipants, fetchTasks, fetchReviews]);

  return { room, participants, tasks, reviews, loading };
}
