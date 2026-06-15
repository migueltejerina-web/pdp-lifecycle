import type { StepCTA, StepCTAAction } from "@/types/lifecycle";

export function openMailInbox() {
  const isMac = /Mac/i.test(navigator.userAgent);

  if (isMac) {
    window.location.href = "message://";
    return;
  }

  window.open("https://mail.google.com/mail/u/0/#inbox", "_blank", "noopener,noreferrer");
}

export function handleLifecycleCtaClick(cta: Pick<StepCTA, "action" | "url">) {
  if (cta.url) {
    window.open(cta.url, "_blank", "noopener,noreferrer");
    return;
  }
  if (cta.action === "open_mail") {
    openMailInbox();
  }
}

export function handleLifecycleCtaAction(action: StepCTAAction, url?: string) {
  handleLifecycleCtaClick({ action, url });
}
