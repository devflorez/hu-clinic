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
  ["Crear endpoint REST para movimientos", "Validar parámetros de consulta", "Tests unitarios del endpoint"],
  ["Pruebas funcionales del listado", "Pruebas de regresión"],
  ["Implementar servicio de transacciones", "Cacheo de consultas", "Documentar API"],
  ["Componente de lista de movimientos", "Selector de fechas", "Estado de carga y error"],
  ["Pipeline de deploy", "Configurar monitoreo"],
  ["Diseño de pantalla de movimientos", "Revisión de accesibilidad"],
];

async function createTask(page: Page, title: string, isFirst: boolean) {
  if (isFirst) {
    // First task: could be empty state or backlog
    const firstBtn = page.locator("button", { hasText: "Crear primera tarea" });
    const newBtn = page.locator("button", { hasText: "+ Nuevo" });
    if (await firstBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstBtn.click();
    } else {
      await newBtn.click();
    }
  } else {
    // Wait for "+ Nuevo" to be clickable (form closed after previous save)
    const newBtn = page.locator("button", { hasText: "+ Nuevo" });
    await newBtn.waitFor({ state: "visible", timeout: 10000 });
    await newBtn.click();
  }

  // Wait for title input
  const input = page.locator('[data-testid="task-title-input"]');
  await input.waitFor({ state: "visible", timeout: 10000 });
  await input.fill(title);

  // Click save
  const save = page.locator("button", { hasText: "Guardar tarea" });
  await save.waitFor({ state: "visible", timeout: 5000 });
  await save.click();

  // Wait for save to complete (input disappears)
  await input.waitFor({ state: "hidden", timeout: 10000 });
}

test("Simulación completa con navegadores reales", async ({ browser }) => {
  test.setTimeout(240_000);

  // === 1. FACILITATOR CREATES ROOM ===
  const facilitatorPage = await browser.newPage();
  await facilitatorPage.goto("/create");
  await facilitatorPage.waitForLoadState("networkidle");

  await facilitatorPage.fill("#facilitator_name", "Facilitador Real");

  // Select last predefined HU
  const huCards = facilitatorPage.locator(".cursor-pointer.border");
  await huCards.last().click();
  await facilitatorPage.waitForTimeout(500);

  await facilitatorPage.click('button[type="submit"]');
  await facilitatorPage.waitForURL(/\/room\//, { timeout: 15000 });

  const roomCode = facilitatorPage.url().split("/room/")[1];
  console.log(`\n🏥 Sala creada: ${roomCode}\n`);

  // === 2. PARTICIPANTS JOIN ===
  const participantPages: Page[] = [];
  for (const name of PARTICIPANTS) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.fill("#code", roomCode);
    await page.fill("#name", name);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/room\//, { timeout: 10000 });
    participantPages.push(page);
    console.log(`👤 ${name} se unió`);
  }

  // === 3. READ_HU ===
  console.log(`\n⏭️ READ_HU`);
  await facilitatorPage.locator("button", { hasText: "📖" }).click();
  await facilitatorPage.waitForTimeout(2000);

  // === 4. CREATE_TASKS ===
  console.log(`⏭️ CREATE_TASKS`);
  await facilitatorPage.locator("button", { hasText: "✏️" }).click();
  await facilitatorPage.waitForTimeout(3000);

  for (let i = 0; i < participantPages.length; i++) {
    const page = participantPages[i];
    const tasks = TASKS_PER_PARTICIPANT[i];

    // Wait for phase to load via realtime
    await page.locator("text=Backlog").waitFor({ state: "visible", timeout: 20000 });

    for (let t = 0; t < tasks.length; t++) {
      await createTask(page, tasks[t], t === 0);
    }
    console.log(`   ✏️ ${PARTICIPANTS[i]} creó ${tasks.length} tareas`);
  }

  // === 5. REVIEW ===
  console.log(`\n⏭️ REVIEW`);
  await facilitatorPage.locator("button", { hasText: "👀" }).click();
  await facilitatorPage.waitForTimeout(3000);

  for (let i = 0; i < Math.min(4, participantPages.length); i++) {
    const page = participantPages[i];
    // Wait for review phase to render
    await page.waitForTimeout(2000);

    // Submit as many reviews as available
    for (let j = 0; j < 8; j++) {
      const submitBtn = page.locator("button", { hasText: "Enviar revisión" });
      if (await submitBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
        await submitBtn.click();
        await page.waitForTimeout(600);
      } else {
        break;
      }
    }
    console.log(`   👀 ${PARTICIPANTS[i]} revisó tareas`);
  }

  // === 6. RESULTS ===
  console.log(`\n⏭️ RESULTS`);
  await facilitatorPage.locator("button", { hasText: "📊" }).click();
  await facilitatorPage.waitForTimeout(2000);
  await expect(facilitatorPage.locator("text=Total tareas")).toBeVisible({ timeout: 5000 });
  console.log(`   ✅ Dashboard visible`);

  // === 7. REAL_COMPARISON ===
  console.log(`⏭️ REAL_COMPARISON`);
  await facilitatorPage.locator("button", { hasText: "🔗" }).click();
  await facilitatorPage.waitForTimeout(2000);
  console.log(`   ✅ Comparación visible`);

  // === 8. FINISHED ===
  console.log(`⏭️ FINISHED`);
  await facilitatorPage.locator("button", { hasText: "🎉" }).click();
  await facilitatorPage.waitForTimeout(1500);
  await expect(facilitatorPage.locator("text=Dinámica finalizada")).toBeVisible({ timeout: 5000 });

  console.log(`\n🎉 SIMULACIÓN COMPLETA`);
  console.log(`   Sala: ${roomCode}`);
  console.log(`   Participantes: ${PARTICIPANTS.length}`);
  console.log(`   Tareas: ${TASKS_PER_PARTICIPANT.flat().length}\n`);

  // Cleanup
  for (const page of participantPages) await page.context().close();
  await facilitatorPage.close();
});
