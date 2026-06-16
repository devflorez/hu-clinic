# 🏥 HU Clinic

Dinámica colaborativa en tiempo real para revisar qué tan bien un equipo descompone una Historia de Usuario en tareas.

## Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **Supabase** (PostgreSQL + Realtime)

## Cómo funciona la dinámica

1. **El facilitador crea una sala** con la Historia de Usuario (título, descripción, criterios de aceptación) y opcionalmente ítems reales para comparación.
2. **Los participantes se unen** con el código de sala y su nombre.
3. La dinámica avanza por fases controladas por el facilitador:
   - **WAITING_ROOM** — todos se unen
   - **READ_HU** — lectura grupal de la HU
   - **CREATE_TASKS** — cada participante crea tareas de forma privada
   - **REVIEW** — revisión cruzada (cada uno revisa 2-3 tableros de otros)
   - **RESULTS** — dashboard con estadísticas y tablero consolidado
   - **REAL_COMPARISON** — comparar tareas propuestas vs ítems reales
   - **FINISHED** — preguntas de cierre y reflexión
4. El temporizador es compartido en tiempo real vía Supabase Realtime.

Duración sugerida: **35-45 minutos**.

## Instalación

```bash
git clone https://github.com/devflorez/hu-clinic.git
cd hu-clinic
npm install
```

## Variables de entorno

Crea un archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

## Setup de Supabase

1. Crea un proyecto en [Supabase](https://supabase.com).
2. Ve al SQL Editor y ejecuta el contenido de [`supabase/schema.sql`](./supabase/schema.sql).
3. Verifica que Realtime esté habilitado para las tablas `rooms`, `participants`, `tasks` y `reviews`.
4. Copia la URL y la anon key de tu proyecto a `.env.local`.

## Correr localmente

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Estructura del proyecto

```
src/
├── app/
│   ├── page.tsx          # Landing (crear/unirse)
│   ├── create/page.tsx   # Crear sala
│   ├── join/page.tsx     # Unirse a sala
│   └── room/[code]/page.tsx # Sala principal
├── components/
│   ├── facilitator-controls.tsx
│   ├── phases/
│   │   ├── waiting-room.tsx
│   │   ├── read-hu.tsx
│   │   ├── create-tasks.tsx
│   │   ├── review-phase.tsx
│   │   ├── results.tsx
│   │   ├── real-comparison.tsx
│   │   └── finished.tsx
│   └── ui/              # shadcn/ui components
├── hooks/
│   ├── use-room.ts      # Realtime subscription
│   └── use-timer.ts     # Countdown timer
├── lib/
│   ├── supabase.ts      # Supabase client
│   └── utils.ts         # cn utility
└── types/
    └── index.ts         # TypeScript types
```

## Base de datos

Tablas principales:

| Tabla | Descripción |
|-------|-------------|
| `rooms` | Salas con código, HU, fase actual y timer |
| `participants` | Participantes por sala |
| `tasks` | Tareas creadas por participantes |
| `reviews` | Revisiones cruzadas |
| `real_items` | Ítems reales para comparación |
| `real_item_matches` | Mapeo tarea → ítem real |

## Notas

- No usa autenticación. La identidad se maneja con `sessionStorage`.
- El facilitador controla las fases y el temporizador.
- El realtime usa canales filtrados por `room_id`.
- Las tareas son privadas durante la fase CREATE_TASKS.
