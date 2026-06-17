# 🎯 Guía del Facilitador — TaskSplit

## Resumen

TaskSplit es una dinámica colaborativa de **35-45 minutos** donde el equipo descompone una Historia de Usuario en tareas de forma individual, revisa el trabajo de los demás y reflexiona sobre la calidad de la descomposición.

**Objetivo:** Evaluar qué tan bien el equipo entiende y descompone una HU en tareas accionables.

---

## Antes de iniciar

### Preparación (5 min antes)

1. Abre `/create` en tu navegador.
2. Selecciona la HU predefinida o ingresa una manualmente.
3. Verifica que la HU tenga:
   - Título claro
   - Descripción completa
   - Criterios de aceptación definidos
4. Haz click en **"Crear sala"**.
5. Comparte el **código de sala** con el equipo (proyectar en pantalla o enviar por chat).

### Lo que necesitas

- Proyector o pantalla compartida (para mostrar resultados al final)
- Cada participante con su laptop/celular
- Conexión a internet estable

---

## Fases de la dinámica

---

### 1. SALA DE ESPERA (⏳) — 2-3 min

**Qué haces:**
- Espera a que todos se unan. El código se muestra en pantalla grande.
- Verifica que todos aparezcan en la lista de participantes.

**Qué dices:**
> "Entren a la app, ingresen el código y su nombre. Cuando todos estén, arrancamos."

**Qué ves:**
- Lista de participantes con sus nombres.

**Cuándo avanzar:** Cuando todos estén conectados.

---

### 2. LECTURA DE HU (📖) — 3-5 min

**Qué haces:**
- Activa un timer de **3 o 5 minutos**.
- Lee la HU en voz alta o pide que la lean en silencio.

**Qué dices:**
> "Lean la Historia de Usuario con atención. Fíjense en la descripción y los criterios de aceptación. Si tienen dudas, es parte del ejercicio — no las resuelvan todavía."

**Qué ven los participantes:**
- Título de la HU
- Descripción
- Criterios de aceptación
- Puntos de historia y fechas (si aplica)

**Cuándo avanzar:** Cuando todos marquen "Listo" o se agote el timer.

---

### 3. CREAR TAREAS (✏️) — 10-15 min

**Qué haces:**
- Activa un timer de **10 o 15 minutos**.
- **No respondas preguntas sobre la HU.** La ambigüedad es parte del ejercicio.

**Qué dices:**
> "Ahora cada uno va a descomponer la HU en tareas de trabajo. Creen todas las tareas que consideren necesarias. Nadie ve las tareas de los demás. Incluyan título, tipo y criterio de terminado."

**Qué ven los participantes:**
- Panel estilo backlog (izquierda) + formulario de tarea (derecha)
- Pueden consultar la HU desplegando el panel superior
- Botón "Marcar como listo" cuando terminen

**Qué ves como facilitador:**
- Barra de progreso: quién ya marcó listo
- Puedes avanzar cuando todos estén listos o cuando se acabe el tiempo

**Importante:** Las tareas son privadas. Nadie ve las de los demás.

**Cuándo avanzar:** Cuando todos marquen "Listo" o se agote el timer.

---

### 4. REVISIÓN CRUZADA (👀) — 8-12 min

**Qué haces:**
- Activa un timer de **8 o 10 minutos**.
- Explica el proceso de revisión.

**Qué dices:**
> "Ahora van a revisar las tareas de otros tableros. Les tocan 2-3 tableros anónimos. Por cada tarea califiquen: claridad (1-5), si es necesaria (sí/no), detalle (1-5), y opcionalmente cómo la harían diferente."

**Qué ven los participantes:**
- Botones "Tablero 1", "Tablero 2", "Tablero 3" (anónimos)
- Cada tarea con su detalle
- Formulario de revisión por tarea

**Qué ves como facilitador:**
- Contador de reviews completadas
- Barra de progreso de quién terminó

**Nota:** Los tableros son anónimos para evitar sesgo. Hay tareas reales mezcladas que nadie sabe que son reales.

**Cuándo avanzar:** Cuando todos marquen "Listo" o se agote el timer.

---

### 5. RESULTADOS (📊) — 5 min

**Qué haces:**
- **Proyecta esta pantalla** para que todos vean.
- Comenta los resultados en voz alta.

**Qué dices:**
> "Veamos los resultados. Miren cuántas tareas creó cada uno, cuáles fueron las mejor y peor calificadas, y el tablero consolidado."

**Qué se ve:**
- Total de tareas y reviews
- Promedio de claridad y detalle
- Top 5 mejor calificadas
- Top 5 peor calificadas
- Tareas con más comentarios
- Tablero consolidado por tipo (estilo Azure DevOps)

**Puntos de discusión:**
- ¿Por qué hay diferencias en la cantidad de tareas?
- ¿Las mejor calificadas tienen algo en común?
- ¿Las peor calificadas qué les falta?

**Cuándo avanzar:** Después de 3-5 min de discusión.

---

### 6. COMPARACIÓN REAL (🔗) — 5-8 min

**Qué haces:**
- **Proyecta esta pantalla.**
- Revela las tareas reales y cómo fueron calificadas.
- Si eres facilitador, puedes mapear tareas propuestas vs ítems reales.

**Qué dices:**
> "Ahora vamos a comparar con las tareas reales del proyecto. Estas tareas existieron de verdad y estaban mezcladas en la revisión sin que lo supieran."

**Qué se ve:**
- Resumen de cobertura (cubiertos, parciales, no identificados)
- Ítems reales con sus tasks originales
- **🎭 Revelación:** Tareas que eran reales + sus calificaciones
- Preguntas de reflexión

**Puntos de discusión:**
- ¿Las tareas reales fueron bien calificadas?
- ¿Qué tareas reales nadie propuso?
- ¿Hubo tareas propuestas mejores que las reales?

**Cuándo avanzar:** Después de la discusión.

---

### 7. CIERRE (🎉) — 5 min

**Qué haces:**
- Lee las preguntas de cierre una por una.
- Da espacio para que el equipo responda.

**Preguntas:**
1. ¿Qué faltó en la HU para que todos llegáramos a tareas similares?
2. ¿Qué criterios de aceptación estaban ambiguos?
3. ¿Qué tareas aparecieron tarde?
4. ¿Qué tarea fue la más clara y por qué?
5. ¿Qué tarea fue la más débil y por qué?
6. ¿Qué deberíamos mejorar al crear ítems en próximas HU?

**Qué dices para cerrar:**
> "El objetivo no era hacerlo perfecto, sino ver qué tan alineados estamos al descomponer trabajo. Usen estos aprendizajes en el próximo sprint."

---

## Cronograma sugerido (40 min)

| Fase | Duración | Timer |
|------|----------|-------|
| Sala de espera | 2 min | — |
| Lectura de HU | 3 min | 3 min |
| Crear tareas | 12 min | 10-15 min |
| Revisión cruzada | 10 min | 8-10 min |
| Resultados | 5 min | — |
| Comparación real | 5 min | — |
| Cierre | 3 min | — |

---

## Tips para el facilitador

- **No respondas preguntas sobre la HU** durante la fase de creación. La ambigüedad es el punto.
- **Usa el timer** para mantener el ritmo. No dejes que una fase se extienda demasiado.
- **Avanza aunque no todos estén listos** si el tiempo se agota. Puedes decir "vamos a avanzar, lo que tienen está bien."
- **Proyecta los resultados** — la discusión grupal es donde está el valor real.
- **No juzgues** las tareas de nadie. El objetivo es aprender, no evaluar.
- **Las tareas reales mezcladas** son el truco — genera una conversación muy rica al revelarlas.

---

## Después de la sesión

- La sala queda disponible con todos los datos.
- Puedes volver a `/room/CÓDIGO` para revisar resultados.
- Elimina la sala cuando ya no la necesites (botón "Eliminar" en el header).
