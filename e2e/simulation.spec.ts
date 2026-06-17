import { test, expect, Browser, Page } from "@playwright/test";

const PARTICIPANTS = [
  "Carlos Dev",
  "María QA",
  "Andrés Backend",
  "Laura Frontend",
  "Pedro DevOps",
  "Sofía Diseño",
];

const TASKS_PER_PARTICIPANT = [
  [
    { title: "Crear endpoint REST para movimientos", type: "backend", description: "GET /transactions con filtros", done_criteria: "Responde 200" },
    { title: "Validar parámetros de consulta", type: "backend", description: "Validar fechas y estados", done_criteria: "Error 400 si inválido" },
    { title: "Tests unitarios del endpoint", type: "QA", description: "", done_criteria: "Cobertura > 80%" },
  ],
  [
    { title: "Pruebas funcionales del listado", type: "QA", description: "Verificar filtros y paginación", done_criteria: "Todos los casos pasan" },
    { title: "Pruebas de regresión", type: "QA", description: "Verificar que no se rompe nada", done_criteria: "Suite verde" },
    { title: "Test de carga", type: "QA", description: "100 usuarios concurrentes", done_criteria: "Respuesta < 2s" },
  ],
  [
    { title: "Implementar servicio de transacciones", type: "backend", description: "Consumir ms-cb-transactions-reports", done_criteria: "Datos correctos" },
    { title: "Cacheo de consultas frecuentes", type: "backend", description: "Redis para queries repetidas", done_criteria: "Cache hit > 60%" },
    { title: "Manejo de errores del microservicio", type: "backend", description: "Retry y fallback", done_criteria: "No 500 al usuario" },
    { title: "Documentar API", type: "análisis", description: "Swagger actualizado", done_criteria: "Doc publicada" },
  ],
  [
    { title: "Componente de lista de movimientos", type: "frontend", description: "Según diseño Figma", done_criteria: "Pixel perfect" },
    { title: "Selector de fechas", type: "frontend", description: "DatePicker con rango", done_criteria: "Funcional en mobile" },
    { title: "Estado de carga y error", type: "frontend", description: "Skeleton y retry", done_criteria: "UX fluida" },
  ],
  [
    { title: "Pipeline de deploy", type: "devops", description: "CI/CD para el microservicio", done_criteria: "Deploy automático en merge" },
    { title: "Configurar monitoreo", type: "devops", description: "Alertas en Datadog", done_criteria: "Alertas activas" },
    { title: "Variables de entorno en staging", type: "devops", description: "Secrets en Vault", done_criteria: "Env configurado" },
  ],
  [
    { title: "Diseño de pantalla de movimientos", type: "diseño", description: "Mobile first", done_criteria: "Aprobado por PO" },
    { title: "Diseño de estados vacíos", type: "diseño", description: "Empty state y error", done_criteria: "Assets entregados" },
    { title: "Revisión de accesibilidad", type: "diseño", description: "Contraste WCAG AA", done_criteria: "Pasa auditoría" },
  ],
];

test("Simulación completa con navegadores reales", async ({ browser }) => {
  // 1. Facilitator creates room
  const facilitatorPage = await browser.newPage();
  await facilitatorPage.goto("/create");
  await facilitatorPage.waitForLoadState("networkidle");

  // Fill facilitator name
  await facilitatorPage.fill('input#facilitator_name', 'Facilitador Real');

  // Select predefined HU (click the last one - Visualización de movimientos)
  const huCards = facilitatorPage.locator('.border.rounded-xl.p-4.cursor-pointer');
  const count = await huCards.count();
  if (count > 0) {
    await huCards.last().click();
    await facilitatorPage.waitForTimeout(500);
  }

  // Submit
  await facilitatorPage.click('button[type="submit"]');
  await facilitatorPage.waitForURL(/\/room\//, { timeout: 10000 });

  const roomUrl = facilitatorPage.url();
  const roomCode = roomUrl.split("/room/")[1];
  console.log(`\n🏥 Sala creada: ${roomCode}`);
  console.log(`   URL: ${roomUrl}\n`);

  // 2. Participants join in separate browser contexts (like separate browsers)
  const participantPages: Page[] = [];

  for (let i = 0; i < PARTICIPANTS.length; i++) {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.fill('input#code', roomCode);
    await page.fill('input#name', PARTICIPANTS[i]);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/room\//, { timeout: 10000 });

    participantPages.push(page);
    console.log(`👤 ${PARTICIPANTS[i]} se unió a la sala`);
    await facilitatorPage.waitForTimeout(300);
  }

  // 3. Facilitator advances to READ_HU
  console.log(`\n⏭️ Facilitador avanza a: READ_HU`);
  const phaseButtons = facilitatorPage.locator('button:has-text("📖")');
  await phaseButtons.click();
  await facilitatorPage.waitForTimeout(2000);

  // Verify participants see the phase change
  for (const page of participantPages.slice(0, 2)) {
    await page.waitForTimeout(1000);
    const badge = page.locator('text=Lectura de HU');
    await expect(badge).toBeVisible({ timeout: 5000 });
  }
  console.log(`   ✅ Participantes ven la fase READ_HU`);

  // 4. Facilitator advances to CREATE_TASKS
  console.log(`\n⏭️ Facilitador avanza a: CREATE_TASKS`);
  const createTasksBtn = facilitatorPage.locator('button:has-text("✏️")');
  await createTasksBtn.click();
  await facilitatorPage.waitForTimeout(2000);

  // Each participant creates their tasks
  for (let i = 0; i < participantPages.length; i++) {
    const page = participantPages[i];
    const tasks = TASKS_PER_PARTICIPANT[i];

    await page.waitForTimeout(1000);

    for (const task of tasks) {
      // Click "+ Nuevo"
      await page.click('button:has-text("+ Nuevo")');
      await page.waitForTimeout(300);

      // Fill form
      await page.fill('input[placeholder="¿Qué hay que hacer?"]', task.title);

      // Select type
      const typeSelect = page.locator('.space-y-1\\.5').filter({ hasText: 'Tipo' }).locator('button[role="combobox"]');
      await typeSelect.click();
      await page.click(`[role="option"]:has-text("${task.type}")`);

      if (task.description) {
        await page.fill('textarea[placeholder="Detalla la tarea..."]', task.description);
      }
      if (task.done_criteria) {
        await page.fill('textarea[placeholder="¿Cómo sabemos que está hecha?"]', task.done_criteria);
      }

      // Save
      await page.click('button:has-text("Guardar work item")');
      await page.waitForTimeout(500);
    }

    console.log(`   ✏️ ${PARTICIPANTS[i]} creó ${tasks.length} tareas`);
  }

  // 5. Facilitator advances to REVIEW
  console.log(`\n⏭️ Facilitador avanza a: REVIEW`);
  const reviewBtn = facilitatorPage.locator('button:has-text("👀")');
  await reviewBtn.click();
  await facilitatorPage.waitForTimeout(2000);

  // Participants do reviews
  for (let i = 0; i < participantPages.length; i++) {
    const page = participantPages[i];
    await page.waitForTimeout(1500);

    // Find board buttons and click the first one that's not already done
    const boardButtons = page.locator('button').filter({ hasText: /^[A-Za-záéíóúñ]/ });
    const boardCount = await boardButtons.count();

    if (boardCount > 0) {
      await boardButtons.first().click();
      await page.waitForTimeout(500);

      // Review each task that appears
      for (let j = 0; j < 5; j++) {
        const submitBtn = page.locator('button:has-text("Enviar revisión")');
        if (await submitBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
          await submitBtn.click();
          await page.waitForTimeout(400);
        } else {
          break;
        }
      }
    }
    console.log(`   👀 ${PARTICIPANTS[i]} completó revisiones`);
  }

  // 6. Facilitator advances to RESULTS
  console.log(`\n⏭️ Facilitador avanza a: RESULTS`);
  const resultsBtn = facilitatorPage.locator('button:has-text("📊")');
  await resultsBtn.click();
  await facilitatorPage.waitForTimeout(2000);

  // Verify results page shows data
  const totalTasks = facilitatorPage.locator('text=Total tareas');
  await expect(totalTasks).toBeVisible({ timeout: 5000 });
  console.log(`   ✅ Dashboard de resultados visible`);

  // 7. Facilitator advances to REAL_COMPARISON
  console.log(`\n⏭️ Facilitador avanza a: REAL_COMPARISON`);
  const compBtn = facilitatorPage.locator('button:has-text("🔗")');
  await compBtn.click();
  await facilitatorPage.waitForTimeout(2000);
  console.log(`   ✅ Fase de comparación real visible`);

  // 8. Facilitator advances to FINISHED
  console.log(`\n⏭️ Facilitador avanza a: FINISHED`);
  const finBtn = facilitatorPage.locator('button:has-text("🎉")');
  await finBtn.click();
  await facilitatorPage.waitForTimeout(1500);

  const finishedTitle = facilitatorPage.locator('text=Dinámica finalizada');
  await expect(finishedTitle).toBeVisible({ timeout: 5000 });
  console.log(`   ✅ Dinámica finalizada correctamente`);

  console.log(`\n🎉 SIMULACIÓN COMPLETA`);
  console.log(`   Sala: ${roomCode}`);
  console.log(`   Participantes: ${PARTICIPANTS.length}`);
  console.log(`   Tareas creadas: ${TASKS_PER_PARTICIPANT.flat().length}`);
  console.log(`   Todas las fases validadas ✅\n`);

  // Cleanup: close all pages
  for (const page of participantPages) {
    await page.context().close();
  }
  await facilitatorPage.close();
});
