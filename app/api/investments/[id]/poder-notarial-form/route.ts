import { NextResponse } from "next/server";

import { isHubSpotConfigured } from "@/lib/hubspot/client";
import { uploadContractSimpleCopyForDeal } from "@/lib/hubspot/escrituras-upload";
import { markPoaFormSubmittedForDeal } from "@/lib/hubspot/poder-notarial-decline";
import { getInvestmentHubSpotRefs } from "@/lib/hubspot/investment-registry";
import { getBuyerTypeSelectOptions } from "@/lib/hubspot/buyer-type";
import { getPoderNotarialPrefillValues } from "@/lib/hubspot/poder-notarial-prefill";
import { getNotaSimpleAvailabilityForDeal } from "@/lib/hubspot/nota-simple";
import { getPoderNotarialFormConfig } from "@/lib/google-forms/poder-notarial-form.config";
import { mockProperty } from "@/app/investments/[id]/mock/property.mock";
import { poderNotarialFormSchema } from "@/lib/poder-notarial/poder-notarial-form.schema";
import { mapPoderNotarialSubmissionToGoogleEntries } from "@/lib/google-forms/map-poder-notarial-submission";
import { buildGoogleFormPrefillUrl } from "@/lib/google-forms/build-prefill-url";
import {
  fetchGoogleFormFbzx,
  getGoogleFormResponseUrl,
} from "@/lib/google-forms/google-form-submit";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const refs = getInvestmentHubSpotRefs(id);

  if (!refs) {
    return NextResponse.json({ error: "Investment not found" }, { status: 404 });
  }

  const formConfig = getPoderNotarialFormConfig();
  if (!formConfig) {
    return NextResponse.json(
      {
        configured: false,
        error:
          "Google Form no configurado. Añade GOOGLE_FORM_PODER_NOTARIAL_URL y GOOGLE_FORM_PODER_NOTARIAL_ENTRY_MAP en .env.local",
      },
      { status: 503 }
    );
  }

  if (!isHubSpotConfigured() || !refs.hubspotDealId) {
    return NextResponse.json({ error: "HubSpot is not configured" }, { status: 503 });
  }

  try {
    const [values, buyerTypeOptions, notaSimple] = await Promise.all([
      getPoderNotarialPrefillValues(refs.hubspotDealId, refs.hubspotListingId),
      Promise.resolve(getBuyerTypeSelectOptions()),
      getNotaSimpleAvailabilityForDeal(refs.hubspotDealId, {
        listingId: refs.hubspotListingId,
        investmentId: id,
      }),
    ]);

    if (!values) {
      return NextResponse.json(
        { configured: true, error: "No hay datos suficientes en HubSpot para pre-rellenar" },
        { status: 404 }
      );
    }

    const notaSimpleLabel =
      notaSimple.documentCount > 1
        ? `Nota simple (${notaSimple.documentCount} documentos)`
        : "Nota simple";

    return NextResponse.json({
      configured: true,
      values: {
        fullName: values.fullName ?? "",
        nif: values.nif ?? "",
        email: values.email ?? "",
        phone: values.phone ?? "",
        contactAddress: values.contactAddress ?? "",
        profession: values.profession ?? "",
        buyerType: values.buyerType ?? "",
        taxlandNumber: values.taxlandNumber ?? "",
        maritalStatus: "Soltero/a",
        economicRegime: "Sociedad de gananciales",
        economicRegimeOther: "",
        buyingAlone: undefined,
        ownershipPercentage: "",
        essentialCompanyAsset: undefined,
        notaSimpleFromHubSpot: notaSimple.available,
      },
      existingNotaSimple: {
        available: notaSimple.available,
        label: notaSimpleLabel,
        viewUrl: notaSimple.viewUrls[0] ?? null,
        documentCount: notaSimple.documentCount,
        viewUrls: notaSimple.viewUrls,
      },
      buyerTypeOptions,
      dealId: refs.hubspotDealId,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo cargar el formulario de poder notarial";
    console.error("[api/investments/poder-notarial-form]", message);
    return NextResponse.json({ configured: true, error: message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const investmentId = id?.trim() || mockProperty.id;
  const refs = getInvestmentHubSpotRefs(investmentId);

  if (!refs) {
    return NextResponse.json({ error: "Investment not found" }, { status: 404 });
  }

  const formConfig = getPoderNotarialFormConfig();
  if (!formConfig) {
    return NextResponse.json({ configured: false, error: "Google Form no configurado" }, { status: 503 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  let payload: unknown;
  let notaSimpleFile: File | null = null;

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const rawPayload = formData.get("payload");

    if (typeof rawPayload !== "string") {
      return NextResponse.json({ error: "Payload del formulario no válido" }, { status: 400 });
    }

    payload = JSON.parse(rawPayload);
    const file = formData.get("notaSimpleFile");
    notaSimpleFile = file instanceof File && file.size > 0 ? file : null;
  } else {
    payload = await request.json().catch(() => null);
  }

  const parsed = poderNotarialFormSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos del formulario no válidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const hasExistingNotaSimple =
    isHubSpotConfigured() && refs.hubspotDealId
      ? (
          await getNotaSimpleAvailabilityForDeal(refs.hubspotDealId, {
            listingId: refs.hubspotListingId,
          })
        ).available
      : false;

  if (!notaSimpleFile && !hasExistingNotaSimple) {
    return NextResponse.json(
      { error: "Debes subir la nota simple para continuar" },
      { status: 400 }
    );
  }

  try {
    if (notaSimpleFile && isHubSpotConfigured() && refs.hubspotDealId) {
      await uploadContractSimpleCopyForDeal(
        refs.hubspotDealId,
        notaSimpleFile,
        notaSimpleFile.name,
        notaSimpleFile.type || "application/pdf"
      );
    }

    if (isHubSpotConfigured() && refs.hubspotDealId) {
      await markPoaFormSubmittedForDeal(refs.hubspotDealId);
    }

    const googleEntries = mapPoderNotarialSubmissionToGoogleEntries(formConfig, parsed.data);
    const fbzx = await fetchGoogleFormFbzx(formConfig.formUrl);
    const googlePrefillUrl = buildGoogleFormPrefillUrl(formConfig.formUrl, googleEntries);

    return NextResponse.json({
      ok: true,
      message: "Solicitud de poder notarial enviada correctamente",
      formUrl: formConfig.formUrl,
      formActionUrl: getGoogleFormResponseUrl(formConfig.formUrl),
      googlePrefillUrl,
      fbzx,
      googleEntries,
      googleEntryCount: Object.keys(googleEntries).length,
      usedExistingNotaSimple: hasExistingNotaSimple && !notaSimpleFile,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo enviar el poder notarial";
    console.error("[api/investments/poder-notarial-form POST]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
