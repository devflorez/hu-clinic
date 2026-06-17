import { PredefinedHU } from "@/types";

export const PREDEFINED_HUS: PredefinedHU[] = [
  {
    id: "59295",
    title: "[HAB] - Asociación de usuario con CBs y punto",
    description:
      "Al día de hoy ya tenemos CB vinculados, no está quedando la asociación del usuario con el CB o punto. Se requiere crear el modelo de datos (tablas) en correspondenteBanks y desde la habilitación crear el registro para la asociación del usuario.",
    acceptance_criteria: `- Solo crear el registro en correspondent_users cuando es un usuario dependiente, cuando es un usuario superadmin no es necesario.
- Al momento de habilitar un CB, debe quedar relacionado el usuario al punto, cuando sean multipunto.
- Se debe hacer un proceso de migración para relacionar los usuarios que actualmente ya tienen los CB. [No aplica dado que antes no había multipuntos]`,
    story_points: 3,
    assignee: "Luis Miguel Hamburger Meza",
    activated_at: "2025-11-14",
    closed_at: "2025-11-20",
    real_items: [
      {
        external_id: "59295",
        title: "[HAB] - Asociación de usuario con CBs y punto",
        description:
          "Crear modelo de datos y registro de asociación usuario-CB-punto en habilitación.",
        tasks: [
          { external_id: "69304", title: "Remover asociación de usuario principal a punto", description: "" },
          { external_id: "69305", title: "Solo asociar si es usuario dependiente", description: "" },
          { external_id: "69306", title: "Pruebas unitarias", description: "" },
          { external_id: "69307", title: "Pruebas funcionales", description: "" },
          { external_id: "69690", title: "Creación de PR y deploy", description: "" },
        ],
      },
    ],
  },
  {
    id: "69363",
    title: "[HU] - Modificar Linea de Atención Nequi",
    description:
      "Como usuario que realiza transacciones en Nequi, quiero que la línea de atención que aparece en el voucher sea la de banco, para que la información de contacto esté siempre correcta y alineada con los canales vigentes.",
    acceptance_criteria: `- El sistema debe permitir modificar el texto de la línea de atención con el siguiente número: 018000953344
- El cambio debe reflejarse en todos los vouchers generados después de la actualización.
- El formato del voucher no debe alterarse (mantener diseño y estructura).
- El voucher debe mostrar la nueva línea en transacciones de cualquier tipo (retiro o recarga)`,
    story_points: 1,
    assignee: "Juliana Celis Tovar",
    activated_at: "2025-12-04",
    closed_at: "2025-12-09",
    real_items: [
      {
        external_id: "69363",
        title: "[HU] - Modificar Linea de Atención Nequi",
        description:
          "Modificar la línea de atención en vouchers de transacciones Nequi.",
        tasks: [
          { external_id: "70987", title: "Pruebas QA", description: "" },
        ],
      },
    ],
  },
  {
    id: "70100",
    title: "[HAB] - Rediseño pantalla PINPAD",
    description:
      "Como Cliente del CB, quiero contar con un diseño práctico y claro en el pinpad al momento de ingresar mi PIN, para realizar las transacciones que lo requieran de manera rápida, segura y sin confusión.",
    acceptance_criteria: `- Se deben tener dos diseños, 1 con el logo de Wompi y el otro solo texto.
- El diseño debe ser intuitivo e indicar un mensaje claro para introducir el pin u OTP.
- La seguridad es prioritaria: nunca mostrar el PIN en texto plano.
- Debe mostrar el texto en español.
- Accesibilidad: considerar contraste, colores y soporte para usuarios con discapacidad visual.`,
    story_points: 2,
    assignee: "Julian Andres Gacharna Vargas",
    activated_at: "2025-11-28",
    closed_at: "2025-12-03",
    real_items: [
      {
        external_id: "70100",
        title: "[HAB] - Rediseño pantalla PINPAD",
        description:
          "Rediseñar la pantalla de PINPAD para mejorar UX y accesibilidad.",
        tasks: [
          { external_id: "70357", title: "Hacer propuestas de diseño", description: "" },
        ],
      },
    ],
  },
  {
    id: "77207",
    title: "[HU] - Visualización de movimientos [dashboard]",
    description:
      "Como usuario, quiero visualizar, filtrar y consultar el detalle de mis movimientos, para gestionar mis transacciones de manera eficiente.",
    acceptance_criteria: `- Se implementa el diseño definido en Figma.
- Se consume el microservicio ms-cb-transactions-reports.
- Se listan los movimientos correctamente.
- Se permite aplicar filtros por fecha, estado u otros criterios.
- Se puede acceder al detalle del movimiento.
- Se manejan estados de carga y error.
- Mínimo se debe mostrar la información del mes anterior y actual.
- Debe tener filtros por mes.`,
    story_points: 2,
    assignee: "Sergio Luis Vega Martinez",
    activated_at: "2026-04-22",
    closed_at: "2026-04-30",
    real_items: [
      {
        external_id: "77207",
        title: "[HU] - Visualización de movimientos [dashboard]",
        description:
          "Implementar visualización, filtrado y detalle de movimientos en el dashboard.",
        tasks: [
          { external_id: "82411", title: "No deben aparecer los movimientos automáticamente", description: "Agregar una opción para que el usuario consulte" },
          { external_id: "82791", title: "Pruebas funcionales (QA)", description: "" },
          { external_id: "82792", title: "Pruebas funcionales (Desarrollador)", description: "" },
          { external_id: "82793", title: "Revisión del PR (Desarrollador)", description: "" },
          { external_id: "82794", title: "Revisión del PR (Líder)", description: "" },
          { external_id: "82795", title: "Revisión del PR (DevOps)", description: "" },
          { external_id: "82797", title: "Revisión de comentarios del equipo", description: "" },
          { external_id: "82798", title: "Implementación de servicios de consumo de base", description: "" },
          { external_id: "82799", title: "Ajustes en la barra de navegación", description: "" },
          { external_id: "82800", title: "Ajustes en los microservicios para permitir mayor tiempo de espera según nuevos query params", description: "" },
          { external_id: "82803", title: "Creación del componente selector de fechas", description: "" },
          { external_id: "85366", title: "Movilización del ítem", description: "" },
          { external_id: "86061", title: "[Bug] Cierre de sesión usuario con saldos y movimientos en dashboard", description: "Bug - Comportamiento inusual en la disponibilidad de la sesión para usuarios de CB con saldos y movimientos" },
        ],
      },
    ],
  },
];
