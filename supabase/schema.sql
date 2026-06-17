-- HU Clinic - Supabase Schema

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- Rooms table
create table rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  title text not null,
  description text not null default '',
  acceptance_criteria text not null default '',
  story_points integer,
  assignee text not null default '',
  activated_at date,
  closed_at date,
  current_phase text not null default 'WAITING_ROOM',
  timer_end_at timestamptz,
  created_at timestamptz default now()
);

-- Participants table
create table participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade not null,
  name text not null,
  is_facilitator boolean default false,
  ready_phase text not null default '',
  created_at timestamptz default now()
);

-- Tasks table (created by participants during the dynamic)
create table tasks (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade not null,
  participant_id uuid references participants(id) on delete cascade not null,
  title text not null,
  description text not null default '',
  type text not null default 'otro',
  dependencies text not null default '',
  done_criteria text not null default '',
  is_from_real boolean not null default false,
  created_at timestamptz default now()
);

-- Reviews table
create table reviews (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade not null,
  reviewer_id uuid references participants(id) on delete cascade not null,
  clarity integer not null check (clarity between 1 and 5),
  is_necessary boolean not null default true,
  detail integer not null check (detail between 1 and 5),
  alternative_approach text not null default '',
  comment text not null default '',
  created_at timestamptz default now()
);

-- Real items table (the actual work items for comparison)
create table real_items (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade not null,
  external_id text not null default '',
  title text not null,
  description text not null default '',
  points integer,
  assignee text not null default '',
  activated_at date,
  closed_at date
);

-- Real tasks (actual tasks that belong to a real item)
create table real_tasks (
  id uuid primary key default gen_random_uuid(),
  real_item_id uuid references real_items(id) on delete cascade not null,
  external_id text not null default '',
  title text not null,
  description text not null default ''
);

-- Real item matches (mapping between proposed tasks and real items)
create table real_item_matches (
  id uuid primary key default gen_random_uuid(),
  real_item_id uuid references real_items(id) on delete cascade not null,
  task_id uuid references tasks(id) on delete cascade not null,
  coverage text not null default 'none' check (coverage in ('full', 'partial', 'none'))
);

-- Indexes for performance
create index idx_participants_room on participants(room_id);
create index idx_tasks_room on tasks(room_id);
create index idx_tasks_participant on tasks(participant_id);
create index idx_reviews_task on reviews(task_id);
create index idx_reviews_reviewer on reviews(reviewer_id);
create index idx_real_items_room on real_items(room_id);
create index idx_real_tasks_item on real_tasks(real_item_id);
create index idx_real_item_matches_real_item on real_item_matches(real_item_id);
create index idx_real_item_matches_task on real_item_matches(task_id);
create index idx_rooms_code on rooms(code);

-- Enable Realtime for relevant tables
alter publication supabase_realtime add table rooms;
alter publication supabase_realtime add table participants;
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table reviews;

-- RLS policies (permissive for MVP - no auth)
alter table rooms enable row level security;
alter table participants enable row level security;
alter table tasks enable row level security;
alter table reviews enable row level security;
alter table real_items enable row level security;
alter table real_tasks enable row level security;
alter table real_item_matches enable row level security;

create policy "Allow all on rooms" on rooms for all using (true) with check (true);
create policy "Allow all on participants" on participants for all using (true) with check (true);
create policy "Allow all on tasks" on tasks for all using (true) with check (true);
create policy "Allow all on reviews" on reviews for all using (true) with check (true);
create policy "Allow all on real_items" on real_items for all using (true) with check (true);
create policy "Allow all on real_tasks" on real_tasks for all using (true) with check (true);
create policy "Allow all on real_item_matches" on real_item_matches for all using (true) with check (true);
