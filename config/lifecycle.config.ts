import type { StageConfig } from "@/types/lifecycle";

export const LIFECYCLE_CONFIG: StageConfig[] = [
  {
    id: "arras",
    title: "Arras",
    description: "Pago de una señal para comprometerte formalmente con la compra",
    icon: "link",
    steps: [
      {
        id: "reservado",
        title: "Reserva confirmada",
        inProgressCopy: "Preparando tu contrato, puede tardar minutos",
        doneCopy: "Reserva completada",
        countdown: false,
      },
      {
        id: "firma_contrato",
        title: "Firma contrato de arras",
        inProgressCopy:
          "Deberías haber recibido un correo electrónico de DocuSign para proceder con la firma del contrato.",
        inProgressCTAs: [{ label: "Abrir mi mail", action: "open_mail" }],
        doneCTAs: [{ label: "Ver contrato", action: "open_document" }],
        countdown: true,
        countdownLabel: "Completar antes de",
      },
      {
        id: "pagar_arras",
        title: "Pago de arras",
        inProgressCopy: "Importe: {dynamicValue} · Vence el {date}",
        doneCopy: "Importe: {dynamicValue}",
        doneCTAs: [{ label: "Ver comprobante", action: "view_file" }],
      },
      {
        id: "pagar_fee_prophero",
        title: "Pago tarifa PropHero",
        inProgressCopy: "Importe: {dynamicValue}",
        doneCopy: "Importe: {dynamicValue}",
        doneCTAs: [{ label: "Ver comprobante", action: "view_file" }],
      },
    ],
  },
  {
    id: "escrituras",
    title: "Escritura",
    description: "Firmas ante notario y la propiedad pasa a ser tuya oficialmente",
    icon: "pen-line",
    steps: [
      {
        id: "nota_simple",
        title: "Nota simple",
        owner: "prophero",
        inProgressCopy:
          "En breves subiremos la nota simple actualizada, necesaria para solicitar el poder notarial",
        doneCTAs: [{ label: "Ver nota simple", action: "view_file" }],
      },
      {
        id: "poder_notarial",
        title: "Poder notarial online",
        owner: "investor",
        inProgressCopy:
          'Autoriza a PropHero para gestionar la compra en tu nombre. Si prefieres hacerlo tú en persona, haz click en "Marcar como completado".',
        inProgressCTAs: [
          {
            label: "No estoy interesado en poder notarial",
            action: "decline_poa",
            variant: "title_link",
          },
          { label: "Solicitar poder notarial", action: "start_notarial", variant: "primary" },
          { label: "Subir poder notarial", action: "upload_company_deed", variant: "secondary", icon: "upload" },
          { label: "Enviar por SIGNO", action: "send_signo", variant: "secondary", icon: "send" },
        ],
        doneCopy: "Poder enviado a la notaría {dynamicValue}",
        doneCTAs: [{ label: "Ver poder", action: "view_file" }],
      },
      {
        id: "tasacion",
        title: "Tasación",
        owner: "prophero",
        doneCTAs: [{ label: "Ver tasación", action: "view_file" }],
      },
      {
        id: "ficha_hipoteca",
        title: "Ficha de hipoteca (FEIN)",
        owner: "investor",
        inProgressCTAs: [
          {
            label: "Subir FEIN",
            action: "upload_fein_signature_doc",
            variant: "primary",
            icon: "upload",
          },
        ],
        doneCTAs: [{ label: "Ver FEIN", action: "view_file" }],
      },
      {
        id: "pago_reaf",
        title: "Pago de honorarios de agencia (REAF)",
        owner: "investor",
        inProgressCopy: "Importe a pagar: {dynamicValue}",
        inProgressCTAs: [{ label: "Ir al pago", action: "view_payment" }],
        doneCTAs: [{ label: "Ver comprobante", action: "view_file" }],
      },
      {
        id: "pago_provision_fondos",
        title: "Pago de provisión de fondos",
        owner: "investor",
        inProgressCopy:
          "Importe: {dynamicValue} · Tu banco gestiona el pago; puedes adjuntar el comprobante cuando lo tengas",
        inProgressCTAs: [{ label: "Ir al pago", action: "view_payment" }],
        doneCTAs: [{ label: "Ver comprobante", action: "view_file" }],
      },
      {
        id: "fecha_firma",
        title: "Fecha final de firma",
        owner: "prophero",
        inProgressCopy:
          "PropHero está coordinando la fecha con todas las partes. Te avisaremos en cuanto esté confirmada.",
        doneCopy: "{dynamicValue}",
      },
      {
        id: "pago_fee_escrituras",
        title: "Pago tarifa PropHero escrituras",
        owner: "investor",
        inProgressCopy: "Importe a pagar: {dynamicValue}",
        inProgressCTAs: [{ label: "Ir al pago", action: "view_payment" }],
        doneCTAs: [{ label: "Ver comprobante", action: "view_file" }],
      },
      {
        id: "pago_final_propiedad",
        title: "Pago final de escritura de propiedad",
        owner: "investor",
        inProgressCopy: "{dynamicValue} - a pagar en notaría",
        doneCTAs: [{ label: "Ver comprobante", action: "view_file" }],
      },
    ],
  },
  {
    id: "reforma",
    title: "Reforma y mobiliario",
    description: "Acondicionamos el inmueble para que esté listo para alquilar",
    icon: "wrench",
    steps: [
      {
        id: "reforma_en_marcha",
        title: "Reforma en marcha",
        inProgressCopy:
          "Para actualizaciones sobre la obra, contacta a nuestro equipo de postventa por email",
        doneCopy: "Terminada",
      },
      {
        id: "lista_para_alquilar",
        title: "Lista para alquilar",
        inProgressCopy: "",
        doneCopy: "",
      },
    ],
  },
  {
    id: "alquiler",
    title: "Alquiler",
    description: "Buscamos inquilino y nos encargamos de toda la gestión",
    icon: "handshake",
    steps: [
      {
        id: "busqueda_inquilino",
        title: "Búsqueda de inquilino",
        inProgressCopy: "",
        doneCopy: "",
      },
      {
        id: "propiedad_alquilada",
        title: "Propiedad alquilada",
        inProgressCopy: "",
        doneCopy: "",
      },
    ],
  },
];
