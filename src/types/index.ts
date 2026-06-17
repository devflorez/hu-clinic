export type Phase =
  | "WAITING_ROOM"
  | "READ_HU"
  | "CREATE_TASKS"
  | "REVIEW"
  | "RESULTS"
  | "REAL_COMPARISON"
  | "FINISHED";

export type TaskType =
  | "frontend"
  | "backend"
  | "QA"
  | "análisis"
  | "devops"
  | "diseño"
  | "otro";

export interface Room {
  id: string;
  code: string;
  title: string;
  description: string;
  acceptance_criteria: string;
  story_points: number | null;
  assignee: string;
  activated_at: string | null;
  closed_at: string | null;
  current_phase: Phase;
  timer_end_at: string | null;
  created_at: string;
}

export interface Participant {
  id: string;
  room_id: string;
  name: string;
  is_facilitator: boolean;
  ready_phase: string;
  created_at: string;
}

export interface Task {
  id: string;
  room_id: string;
  participant_id: string;
  title: string;
  description: string;
  type: TaskType;
  dependencies: string;
  done_criteria: string;
  is_from_real: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  task_id: string;
  reviewer_id: string;
  clarity: number;
  is_necessary: boolean;
  detail: number;
  alternative_approach: string;
  comment: string;
  created_at: string;
}

export interface RealItem {
  id: string;
  room_id: string;
  external_id: string;
  title: string;
  description: string;
  points: number | null;
  assignee: string;
  activated_at: string | null;
  closed_at: string | null;
}

export interface RealTask {
  id: string;
  real_item_id: string;
  external_id: string;
  title: string;
  description: string;
}

export interface RealItemMatch {
  id: string;
  real_item_id: string;
  task_id: string;
  coverage: "full" | "partial" | "none";
}

// Predefined HU for facilitator selection
export interface PredefinedHU {
  id: string;
  title: string;
  description: string;
  acceptance_criteria: string;
  story_points: number;
  assignee: string;
  activated_at: string;
  closed_at: string;
  real_items: {
    external_id: string;
    title: string;
    description: string;
    tasks: { external_id: string; title: string; description: string }[];
  }[];
}
