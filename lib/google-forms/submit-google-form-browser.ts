/**
 * Submits a Google Form from the browser (hidden iframe + no-cors fetch).
 * Also opens a pre-filled tab — the reliable path when Google requires a session.
 */

import { openGoogleFormPrefillTab } from "./open-google-form-prefill";

function normalizeViewFormUrl(formViewUrl: string): string {
  if (formViewUrl.includes("usp=")) return formViewUrl;
  const separator = formViewUrl.includes("?") ? "&" : "?";
  return `${formViewUrl}${separator}usp=pp_url`;
}

async function fetchFbzxFromBrowser(formViewUrl: string): Promise<string | null> {
  const url = normalizeViewFormUrl(formViewUrl);

  try {
    const response = await fetch(url, { credentials: "include" });
    if (!response.ok) return null;

    const html = await response.text();
    const match =
      html.match(/name="fbzx"\s+value="(-?\d+)"/) ??
      html.match(/"fbzx":"(-?\d+)"/) ??
      html.match(/FB_PUBLIC_LOAD_DATA_[^[]*\[\[\["(-?\d+)"/);

    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

function preloadGoogleFormInIframe(iframe: HTMLIFrameElement, formViewUrl: string): Promise<void> {
  return new Promise((resolve) => {
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      iframe.removeEventListener("load", onLoad);
      resolve();
    };

    const onLoad = () => {
      window.setTimeout(finish, 800);
    };

    iframe.addEventListener("load", onLoad);
    iframe.src = normalizeViewFormUrl(formViewUrl);
    window.setTimeout(finish, 5000);
  });
}

function buildSubmissionParams(
  fields: Record<string, string>,
  fbzx?: string | null
): URLSearchParams {
  const params = new URLSearchParams();

  if (fbzx?.trim()) {
    params.set("fbzx", fbzx.trim());
  }

  params.set("fvv", "1");
  params.set("pageHistory", "0");
  params.set("draftResponse", "[null,null,0]");
  // Note: do NOT add a hidden input named "submit" — it shadows HTMLFormElement.submit().

  for (const [entryId, value] of Object.entries(fields)) {
    const trimmed = value?.trim();
    if (!trimmed) continue;
    params.set(entryId, trimmed);
  }

  return params;
}

function postFormToIframe(
  iframeName: string,
  formActionUrl: string,
  params: URLSearchParams
): void {
  const gfForm = document.createElement("form");
  gfForm.method = "POST";
  gfForm.action = formActionUrl;
  gfForm.target = iframeName;
  gfForm.acceptCharset = "UTF-8";
  gfForm.style.display = "none";

  for (const [name, value] of params.entries()) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    gfForm.appendChild(input);
  }

  document.body.appendChild(gfForm);
  // Use prototype — a child input named "submit" would shadow gfForm.submit otherwise.
  HTMLFormElement.prototype.submit.call(gfForm);
  gfForm.remove();
}

async function submitViaNoCorsFetch(
  formActionUrl: string,
  params: URLSearchParams
): Promise<void> {
  await fetch(formActionUrl, {
    method: "POST",
    mode: "no-cors",
    credentials: "include",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
}

async function trySilentGoogleSubmit(
  formActionUrl: string,
  formViewUrl: string,
  fields: Record<string, string>,
  fbzx?: string | null
): Promise<void> {
  let token = fbzx;
  if (!token?.trim()) {
    token = await fetchFbzxFromBrowser(formViewUrl);
  }

  const iframeName = "poder-notarial-google-submit";
  let iframe = document.getElementById(iframeName) as HTMLIFrameElement | null;

  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.id = iframeName;
    iframe.name = iframeName;
    iframe.title = "Google Form submit";
    iframe.hidden = true;
    document.body.appendChild(iframe);
  }

  await preloadGoogleFormInIframe(iframe, formViewUrl);

  const params = buildSubmissionParams(fields, token);
  postFormToIframe(iframeName, formActionUrl, params);
  await submitViaNoCorsFetch(formActionUrl, params);
}

export interface SubmitGoogleFormOptions {
  formActionUrl: string;
  fields: Record<string, string>;
  formViewUrl: string;
  fbzx?: string | null;
  /** When true (default), opens a pre-filled Google Form tab for the user to click Enviar. */
  openPrefillTab?: boolean;
  /** Tab opened synchronously on user click — avoids popup blockers. */
  prefillWindow?: Window | null;
}

export async function submitGoogleFormFromBrowser(
  options: SubmitGoogleFormOptions
): Promise<{ prefillTabOpened: boolean }> {
  const { formActionUrl, fields, formViewUrl, openPrefillTab = true, prefillWindow, fbzx } =
    options;

  let prefillTabOpened = false;
  if (openPrefillTab) {
    const tab = openGoogleFormPrefillTab(formViewUrl, fields, prefillWindow);
    prefillTabOpened = tab !== null;
  }

  try {
    await trySilentGoogleSubmit(formActionUrl, formViewUrl, fields, fbzx);
  } catch (error) {
    console.warn("[submitGoogleFormFromBrowser] silent submit failed", error);
  }

  return { prefillTabOpened };
}
