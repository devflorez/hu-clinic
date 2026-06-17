-- Migration: Add is_from_real to tasks table
alter table tasks add column if not exists is_from_real boolean not null default false;
