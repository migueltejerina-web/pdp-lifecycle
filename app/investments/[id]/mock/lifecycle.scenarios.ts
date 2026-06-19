import type { Lifecycle, Step, SummaryCard } from "@/types/lifecycle";

/** Change this key to preview a different lifecycle scenario locally. */
export const ACTIVE_LIFECYCLE_SCENARIO = "arras_reservado" as const;

export type LifecycleScenarioKey = keyof typeof LIFECYCLE_SCENARIOS;

export interface LifecycleScenario {
  label: string;
  lifecycle: Lifecycle;
  summaryCard: SummaryCard;
}

const ARRAS_STEPS_COMPLETED: Step[] = [
  { id: "reservado", status: "completed", date: "20 mayo 2026" },
  { id: "firma_contrato", status: "completed", date: "20 mayo 2026" },
  { id: "pagar_arras", status: "completed", dynamicValue: "18.000€" },
  { id: "pagar_fee_prophero", status: "completed", dynamicValue: "3.000€" },
];

function pendingArrasSteps(
  overrides: Partial<Record<Step["id"], Partial<Step>>> = {}
): Step[] {
  const base: Step[] = [
    { id: "reservado", status: "pending" },
    { id: "firma_contrato", status: "pending" },
    { id: "pagar_arras", status: "pending" },
    { id: "pagar_fee_prophero", status: "pending" },
  ];

  return base.map((step) => ({ ...step, ...overrides[step.id] }));
}

const ESCRITURAS_STEPS_COMPLETED: Step[] = [
  { id: "nota_simple", status: "completed" },
  {
    id: "poder_notarial",
    status: "completed",
    date: "30 mayo 2026",
    dynamicValue: "notaría@ejemplo.com",
  },
  { id: "tasacion", status: "completed", date: "2 junio 2026" },
  { id: "ficha_hipoteca", status: "completed", date: "5 junio 2026" },
  { id: "pago_reaf", status: "completed", date: "8 junio 2026", dynamicValue: "1.200€" },
  { id: "pago_provision_fondos", status: "completed", date: "10 junio 2026" },
  {
    id: "fecha_firma",
    status: "completed",
    date: "18 de junio de 2026",
    dynamicValue: "En notaría Notaría López",
  },
  { id: "pago_fee_escrituras", status: "completed", date: "15 junio 2026", dynamicValue: "2.400€" },
  { id: "pago_final_propiedad", status: "completed", date: "18 junio 2026", dynamicValue: "243.000€" },
];

const REFORMA_STEPS_COMPLETED: Step[] = [
  { id: "reforma_en_marcha", status: "completed", date: "30 junio 2026" },
  { id: "lista_para_alquilar", status: "completed", date: "5 julio 2026" },
];

function pendingEscriturasSteps(): Step[] {
  return [
    { id: "nota_simple", status: "pending" },
    { id: "poder_notarial", status: "pending" },
    { id: "tasacion", status: "pending" },
    { id: "ficha_hipoteca", status: "pending" },
    { id: "pago_reaf", status: "pending", dynamicValue: "TBD" },
    { id: "pago_provision_fondos", status: "pending" },
    { id: "fecha_firma", status: "pending" },
    { id: "pago_fee_escrituras", status: "pending", dynamicValue: "TBD" },
    { id: "pago_final_propiedad", status: "pending", dynamicValue: "243.000€" },
  ];
}

function pendingReformaSteps(): Step[] {
  return [
    { id: "reforma_en_marcha", status: "pending" },
    { id: "lista_para_alquilar", status: "pending" },
  ];
}

function pendingAlquilerSteps(): Step[] {
  return [
    { id: "busqueda_inquilino", status: "pending" },
    { id: "propiedad_alquilada", status: "pending" },
  ];
}

const BASE_SUMMARY: Pick<SummaryCard, "reservedDate" | "escriturasEstimadas"> = {};

export const LIFECYCLE_SCENARIOS = {
  arras_reservado: {
    label: "Arras · Reserva confirmada (step 1 in progress)",
    lifecycle: {
      currentStage: "arras",
      currentStep: "reservado",
      stages: [
        {
          id: "arras",
          status: "in_progress",
          steps: pendingArrasSteps({
            reservado: { status: "in_progress" },
          }),
        },
        { id: "escrituras", status: "pending", steps: pendingEscriturasSteps() },
        { id: "reforma", status: "pending", steps: pendingReformaSteps() },
        { id: "alquiler", status: "pending", steps: pendingAlquilerSteps() },
      ],
    },
    summaryCard: {
      ...BASE_SUMMARY,
      stageTitle: "Arras",
      proximaAccion: "Creando contrato de arras",
      proximaAccionSubtext: "Propiedad reservada",
    },
  },

  arras_firma_contrato: {
    label: "Arras · Firma contrato (step 2 in progress)",
    lifecycle: {
      currentStage: "arras",
      currentStep: "firma_contrato",
      stages: [
        {
          id: "arras",
          status: "in_progress",
          steps: pendingArrasSteps({
            reservado: { status: "completed", date: "20 mayo 2026" },
            firma_contrato: {
              status: "in_progress",
              countdownHours: 47,
              countdownMinutes: 37,
            },
          }),
        },
        { id: "escrituras", status: "pending", steps: pendingEscriturasSteps() },
        { id: "reforma", status: "pending", steps: pendingReformaSteps() },
        { id: "alquiler", status: "pending", steps: pendingAlquilerSteps() },
      ],
    },
    summaryCard: {
      ...BASE_SUMMARY,
      stageTitle: "Arras",
      proximaAccion: "Firmar contrato",
      proximaAccionSubtext: "Propiedad reservada",
      primaryCtaLabel: "Subir contrato firmado",
      primaryCtaAction: "upload_contract",
      countdownHours: 47,
      countdownMinutes: 37,
    },
  },

  arras_pagar_arras: {
    label: "Arras · Pago de arras (step 3 in progress)",
    lifecycle: {
      currentStage: "arras",
      currentStep: "pagar_arras",
      stages: [
        {
          id: "arras",
          status: "in_progress",
          steps: pendingArrasSteps({
            reservado: { status: "completed", date: "20 mayo 2026" },
            firma_contrato: { status: "completed", date: "20 mayo 2026" },
            pagar_arras: {
              status: "in_progress",
              dynamicValue: "18.000€",
              date: "26 de mayo",
            },
          }),
        },
        { id: "escrituras", status: "pending", steps: pendingEscriturasSteps() },
        { id: "reforma", status: "pending", steps: pendingReformaSteps() },
        { id: "alquiler", status: "pending", steps: pendingAlquilerSteps() },
      ],
    },
    summaryCard: {
      ...BASE_SUMMARY,
      stageTitle: "Arras",
      actionBoxTitle: "Próxima acción",
      actionBoxLinkLabel: "Ver detalles",
      actionBoxLinkAction: "view_details",
      proximaAccionAmount: "18.000€",
      proximaAccionSubtext: "Contrato de arras · vence el 26 mayo 2026",
      primaryCtaLabel: "Subir comprobante",
      primaryCtaAction: "upload_arras_receipt",
      bannerImporte: "18.000€",
      bannerVencimiento: "26 de mayo",
    },
  },

  arras_pagar_fee_prophero: {
    label: "Arras · Pago tarifa PropHero (step 4 in progress)",
    lifecycle: {
      currentStage: "arras",
      currentStep: "pagar_fee_prophero",
      stages: [
        {
          id: "arras",
          status: "in_progress",
          steps: pendingArrasSteps({
            reservado: { status: "completed", date: "20 mayo 2026" },
            firma_contrato: { status: "completed", date: "20 mayo 2026" },
            pagar_arras: { status: "completed", date: "20 mayo 2026", dynamicValue: "18.000€" },
            pagar_fee_prophero: {
              status: "in_progress",
              dynamicValue: "3.000€",
              date: "28 de mayo",
            },
          }),
        },
        { id: "escrituras", status: "pending", steps: pendingEscriturasSteps() },
        { id: "reforma", status: "pending", steps: pendingReformaSteps() },
        { id: "alquiler", status: "pending", steps: pendingAlquilerSteps() },
      ],
    },
    summaryCard: {
      ...BASE_SUMMARY,
      stageTitle: "Arras",
      actionBoxTitle: "Próxima acción",
      actionBoxLinkLabel: "Ver detalles",
      actionBoxLinkAction: "view_details",
      proximaAccionAmount: "3.000€",
      proximaAccionSubtext: "Tarifa PropHero · vence el 28 mayo 2026",
      primaryCtaLabel: "Subir comprobante",
      primaryCtaAction: "upload_exchange_fee_receipt",
      bannerImporte: "3.000€",
      bannerVencimiento: "28 de mayo",
    },
  },

  escrituras_nota_simple: {
    label: "Escritura · Nota simple (parallel — all steps open)",
    lifecycle: {
      currentStage: "escrituras",
      currentStep: "nota_simple",
      stages: [
        { id: "arras", status: "completed", steps: ARRAS_STEPS_COMPLETED },
        {
          id: "escrituras",
          status: "in_progress",
          steps: [
            { id: "nota_simple", status: "in_progress" },
            { id: "poder_notarial", status: "in_progress" },
            { id: "tasacion", status: "in_progress" },
            { id: "ficha_hipoteca", status: "in_progress" },
            { id: "pago_reaf", status: "in_progress", dynamicValue: "TBD" },
            { id: "pago_provision_fondos", status: "in_progress", dynamicValue: "TBD" },
            { id: "fecha_firma", status: "in_progress" },
            { id: "pago_fee_escrituras", status: "in_progress", dynamicValue: "TBD" },
            { id: "pago_final_propiedad", status: "in_progress", dynamicValue: "243.000€" },
          ],
        },
        { id: "reforma", status: "pending", steps: pendingReformaSteps() },
        { id: "alquiler", status: "pending", steps: pendingAlquilerSteps() },
      ],
    },
    summaryCard: {
      ...BASE_SUMMARY,
      stageTitle: "Escritura",
      proximaAccion: "Subiendo nota simple",
      proximaAccionSubtext:
        "En breves subiremos la nota simple actualizada, necesaria para solicitar el poder notarial",
    },
  },

  escrituras_poder_notarial: {
    label: "Escritura · Poder notarial (step 2 in progress)",
    lifecycle: {
      currentStage: "escrituras",
      currentStep: "poder_notarial",
      stages: [
        { id: "arras", status: "completed", steps: ARRAS_STEPS_COMPLETED },
        {
          id: "escrituras",
          status: "in_progress",
          steps: [
            { id: "nota_simple", status: "completed" },
            { id: "poder_notarial", status: "in_progress" },
            { id: "tasacion", status: "pending" },
            { id: "ficha_hipoteca", status: "pending" },
            { id: "pago_reaf", status: "pending", dynamicValue: "TBD" },
            { id: "pago_provision_fondos", status: "pending" },
            { id: "fecha_firma", status: "pending" },
            { id: "pago_fee_escrituras", status: "pending", dynamicValue: "TBD" },
            { id: "pago_final_propiedad", status: "pending", dynamicValue: "243.000€" },
          ],
        },
        { id: "reforma", status: "pending", steps: pendingReformaSteps() },
        { id: "alquiler", status: "pending", steps: pendingAlquilerSteps() },
      ],
    },
    summaryCard: {
      ...BASE_SUMMARY,
      stageTitle: "Escritura",
      proximaAccion: "Poder notarial",
      proximaAccionSubtext: "Autoriza a PropHero a gestionar tu compra.",
    },
  },

  escrituras_pago_final: {
    label: "Escritura · Pago final (step 9 in progress)",
    lifecycle: {
      currentStage: "escrituras",
      currentStep: "pago_final_propiedad",
      stages: [
        { id: "arras", status: "completed", steps: ARRAS_STEPS_COMPLETED },
        {
          id: "escrituras",
          status: "in_progress",
          steps: [
            { id: "nota_simple", status: "completed" },
            {
              id: "poder_notarial",
              status: "completed",
              date: "30 mayo 2026",
              dynamicValue: "notaría@ejemplo.com",
            },
            { id: "tasacion", status: "completed", date: "2 junio 2026" },
            { id: "ficha_hipoteca", status: "completed", date: "5 junio 2026" },
            { id: "pago_reaf", status: "completed", date: "8 junio 2026", dynamicValue: "1.200€" },
            { id: "pago_provision_fondos", status: "completed", date: "10 junio 2026" },
            {
              id: "fecha_firma",
              status: "completed",
              date: "18 de junio de 2026",
              dynamicValue: "En notaría Notaría López",
            },
            {
              id: "pago_fee_escrituras",
              status: "completed",
              date: "15 junio 2026",
              dynamicValue: "2.400€",
            },
            {
              id: "pago_final_propiedad",
              status: "in_progress",
              dynamicValue: "243.000€",
            },
          ],
        },
        { id: "reforma", status: "pending", steps: pendingReformaSteps() },
        { id: "alquiler", status: "pending", steps: pendingAlquilerSteps() },
      ],
    },
    summaryCard: {
      ...BASE_SUMMARY,
      stageTitle: "Escritura",
      proximaAccion: "Pago final de la propiedad",
      proximaAccionSubtext: "Esperando confirmación del pago",
    },
  },

  reforma_en_marcha: {
    label: "Reforma y mobiliario · Reforma en marcha (step 1 in progress)",
    lifecycle: {
      currentStage: "reforma",
      currentStep: "reforma_en_marcha",
      stages: [
        { id: "arras", status: "completed", steps: ARRAS_STEPS_COMPLETED },
        { id: "escrituras", status: "completed", steps: ESCRITURAS_STEPS_COMPLETED },
        {
          id: "reforma",
          status: "in_progress",
          steps: [
            { id: "reforma_en_marcha", status: "in_progress" },
            { id: "lista_para_alquilar", status: "pending" },
          ],
        },
        { id: "alquiler", status: "pending", steps: pendingAlquilerSteps() },
      ],
    },
    summaryCard: {
      ...BASE_SUMMARY,
      stageTitle: "Reforma y mobiliario",
      proximaAccion: "Reforma en marcha",
      proximaAccionSubtext: "Obra en curso",
    },
  },

  alquiler_busqueda: {
    label: "Alquiler · Búsqueda de inquilino (step 1 in progress)",
    lifecycle: {
      currentStage: "alquiler",
      currentStep: "busqueda_inquilino",
      stages: [
        { id: "arras", status: "completed", steps: ARRAS_STEPS_COMPLETED },
        { id: "escrituras", status: "completed", steps: ESCRITURAS_STEPS_COMPLETED },
        { id: "reforma", status: "completed", steps: REFORMA_STEPS_COMPLETED },
        {
          id: "alquiler",
          status: "in_progress",
          steps: [
            { id: "busqueda_inquilino", status: "in_progress" },
            { id: "propiedad_alquilada", status: "pending" },
          ],
        },
      ],
    },
    summaryCard: {
      ...BASE_SUMMARY,
      stageTitle: "Alquiler",
      proximaAccion: "Búsqueda de inquilino",
      proximaAccionSubtext: "Buscando inquilino",
    },
  },
} as const satisfies Record<string, LifecycleScenario>;

const activeScenario = LIFECYCLE_SCENARIOS[ACTIVE_LIFECYCLE_SCENARIO];

export const mockLifecycle: Lifecycle = activeScenario.lifecycle;
export const mockSummaryCard: SummaryCard = activeScenario.summaryCard;
