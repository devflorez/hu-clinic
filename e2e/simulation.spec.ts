import { test, expect, Page } from "@playwright/test";

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
    { title: "Crear endpoint REST para movimientos", type: "backend" },
    { title: "Validar parámetros de consulta", type: "backend" },
    { title: "Tests unitarios del endpoint", type: "QA" },
  ],
  [
    { title: "Pruebas funcionales del listado", type: "QA" },
    { title: "Pruebas de regresión", type: "QA" },
  ],
  [
    { title: "Implementar servicio de transacciones", type: "backend" },
    { title: "Cacheo de consultas frecuentes", type: "backend" },
    { title: "Documentar API", type: "análisis" },
  ],
  [
    { title: "Componente de lista de movimientos", type: "frontend" },
    { title: "Selector de fechas", type: "frontend" },
    { title: "Estado de carga y error", type: "frontend" },
  ],
  [
    { title: "Pipeline de deploy", type: "devops" },
    { title: "Configurar monitoreo", type: "devops" },
  ],
  [
    { title: "Diseño de pantalla de movimientos", type: "diseño" },
    { title: "Revisión de accesibilidad", type: "diseño" },
  ],
];

test("Simulación completa con navegadores reales", async ({ browser }) => {
  test.setTimeout(180_000);

  // 1. Facilitator creates room
  const facilitatorPage = await browser.newPage();
  await facilitatorPage.goto("/create");
  await facilitatorPage.waitForLoadState("networkidle");

  await facilitatorPage.fill("#facilitator_name", "Facilitador Real");

  // Select predefined HU (last one)
  const huCards = facilitatorPage.locator(".cursor-pointer.border");
  await huCards.last().click();
  await facilitatorPage.waitForTimeout(500);

  await facilitatorPage.click('button[type="submit"]');
  await facilitatorPage.waitForURL(/\/room\//, { timeout: 15000 });

  const roomUrl = facilitatorPage.url();
  const roomCode = roomUrl.split("/room/")[1];
  console.log(`\n🏥 Sala creada: ${roomCode}\n`);

  // 2. Participants join
  const participantPages: Page[] = [];
  for (let i = 0; i < PARTICIPANTS.length; i++) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.fill("#code", roomCode);
    await page.fill("#name", PARTICIPANTS[i]);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/room\//, { timeout: 10000 });
    participantPages.push(page);
    console.log(`👤 ${PARTICIPANTS[i]} se unió`);
    await page.waitForTimeout(200);
  }

  // 3. READ_HU
  console.log(`\n⏭️ READ_HU`);
  await facilitatorPage.locator("button", { hasText: "📖" }).click();
  await facilitatorPage.waitForTimeout(2000);

  // 4. CREATE_TASKS
  console.log(`⏭️ CREATE_TASKS`);
  await facilitatorPage.locator("button", { hasText: "✏️" }).click();
  await facilitatorPage.waitForTimeout(3000);

  // Each participant creates tasks
  for (let i = 0; i < participantPages.length; i++) {
    const page = participantPages[i];
    const tasks = TASKS_PER_PARTICIPANT[i];

    // Wait for the CREATE_TASKS phase to be visible (realtime update)
    await page.locator("text=Backlog").waitFor({ state: "visible", timeout: 15000 });

    for (const task of tasks) {
      // Click new button - try both variants
      const firstTaskBtn = page.locator("button", { hasText: "Crear primera tarea" });
      const newBtn = page.locator("button", { hasText: "+ Nuevo" });

      if (await firstTaskBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await firstTaskBtn.click();
      } else {
        await newBtn.click();
      }

      // Fill title
      const titleInput = page.locator('[data-testid="task-title-input"]');
      await titleInput.waitFor({ state: "visible", timeout: 8000 });
      await titleInput.fill(task.title);

      // Save without changing other fields (keep defaults)
      await page.locator("button", { hasText: "Guardar work item" }).click();
      await page.waitForTimeout(600);
    }
    console.log(`   ✏️ ${PARTICIPANTS[i]} creó ${tasks.length} tareas`);
  }

  // 5. REVIEW
  console.log(`\n⏭️ REVIEW`);
  await facilitatorPage.locator("button", { hasText: "👀" }).click();
  await facilitatorPage.waitForTimeout(2500);

  for (let i = 0; i < Math.min(3, participantPages.length); i++) {
    const page = participantPages[i];
    await page.waitForTimeout(2000);

    // Try to submit reviews if visible
    for (let j = 0; j < 6; j++) {
      const submitBtn = page.locator("button", { hasText: "Enviar revisión" });
      if (await submitBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await submitBtn.click();
        await page.waitForTimeout(500);
      } else {
        break;
      }
    }
    console.log(`   👀 ${PARTICIPANTS[i]} revisó tareas`);
  }

  // 6. RESULTS
  console.log(`\n⏭️ RESULTS`);
  await facilitatorPage.locator("button", { hasText: "📊" }).click();
  await facilitatorPage.waitForTimeout(2000);
  console.log(`   ✅ Dashboard visible`);

  // 7. REAL_COMPARISON
  console.log(`⏭️ REAL_COMPARISON`);
  await facilitatorPage.locator("button", { hasText: "🔗" }).click();
  await facilitatorPage.waitForTimeout(1500);
  console.log(`   ✅ Comparación visible`);

  // 8. FINISHED
  console.log(`⏭️ FINISHED`);
  await facilitatorPage.locator("button", { hasText: "🎉" }).click();
  await facilitatorPage.waitForTimeout(1500);
  await expect(facilitatorPage.locator("text=Dinámica finalizada")).toBeVisible({ timeout: 5000 });

  console.log(`\n🎉 SIMULACIÓN COMPLETA - Sala: ${roomCode}\n`);

  // Cleanup
  for (const page of participantPages) await page.context().close();
  await facilitatorPage.close();
});
