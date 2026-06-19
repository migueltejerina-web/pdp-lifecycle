import { buildGoogleFormPrefillUrl } from "./build-prefill-url";

/** Opens the Google Form in a new tab with all fields pre-filled (user clicks Enviar). */
export function openGoogleFormPrefillTab(
  formViewUrl: string,
  fields: Record<string, string>,
  existingWindow?: Window | null
): Window | null {
  const prefillUrl = buildGoogleFormPrefillUrl(formViewUrl, fields);

  if (existingWindow && !existingWindow.closed) {
    existingWindow.location.href = prefillUrl;
    existingWindow.focus();
    return existingWindow;
  }

  return window.open(prefillUrl, "_blank", "noopener,noreferrer");
}

/** Open synchronously on user click to avoid popup blockers; navigate after async work. */
export function openGoogleFormPrefillPlaceholder(): Window | null {
  return window.open("about:blank", "_blank");
}
