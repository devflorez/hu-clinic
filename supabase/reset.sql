-- Reset completo: borra todo y recrea desde cero
-- CUIDADO: elimina todos los datos existentes

drop table if exists real_item_matches cascade;
drop table if exists real_tasks cascade;
drop table if exists real_items cascade;
drop table if exists reviews cascade;
drop table if exists tasks cascade;
drop table if exists participants cascade;
drop table if exists rooms cascade;

-- Ahora ejecuta schema.sql completo
