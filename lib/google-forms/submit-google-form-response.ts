import "server-only";

export function extractGoogleFormId(formUrl: string): string | null {
  const match = formUrl.match(/\/forms\/d\/e\/([^/]+)\//);
  return match?.[1] ?? null;
}

/**
 * Submits a response to a public Google Form via its undocumented formResponse endpoint.
 * Used as a bridge while the investor sees the in-app branded form.
 */
export async function submitGoogleFormResponse(
  formUrl: string,
  fields: Record<string, string>
): Promise<void> {
  const formId = extractGoogleFormId(formUrl);
  if (!formId) {
    throw new Error("URL de Google Form no válida");
  }

  const body = new URLSearchParams();
  for (const [entryId, value] of Object.entries(fields)) {
    const trimmed = value?.trim();
    if (!trimmed) continue;
    body.set(entryId, trimmed);
  }

  const response = await fetch(
    `https://docs.google.com/forms/d/e/${formId}/formResponse`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      redirect: "manual",
    }
  );

  if (response.status !== 200 && response.status !== 302) {
    throw new Error("No se pudo enviar el formulario a Google");
  }
}
