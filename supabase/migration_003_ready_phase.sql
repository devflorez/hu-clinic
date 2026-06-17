-- Migration: Add ready_phase to participants to track who is ready in each phase
alter table participants add column if not exists ready_phase text not null default '';
