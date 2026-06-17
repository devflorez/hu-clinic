-- Migration: Add enriched fields to rooms and real_items, add real_tasks table
-- Run this if you already have the previous schema. Otherwise use schema.sql from scratch.

-- Add story context fields to rooms
alter table rooms add column if not exists story_points integer;
alter table rooms add column if not exists assignee text not null default '';
alter table rooms add column if not exists activated_at date;
alter table rooms add column if not exists closed_at date;

-- Add enriched fields to real_items
alter table real_items add column if not exists external_id text not null default '';
alter table real_items add column if not exists points integer;
alter table real_items add column if not exists assignee text not null default '';
alter table real_items add column if not exists activated_at date;
alter table real_items add column if not exists closed_at date;

-- Create real_tasks table
create table if not exists real_tasks (
  id uuid primary key default gen_random_uuid(),
  real_item_id uuid references real_items(id) on delete cascade not null,
  external_id text not null default '',
  title text not null,
  description text not null default ''
);

create index if not exists idx_real_tasks_item on real_tasks(real_item_id);

-- RLS
alter table real_tasks enable row level security;
create policy "Allow all on real_tasks" on real_tasks for all using (true) with check (true);
