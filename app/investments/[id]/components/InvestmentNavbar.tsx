"use client";

import Link from "next/link";
import { Bell, ChevronLeft, MessageCircleQuestionMark } from "lucide-react";
import type { PropertyMock } from "../mock/property.mock";
import { EMPTY_FIELD } from "../utils/format";

interface InvestmentNavbarProps {
  property: PropertyMock;
}

export function InvestmentNavbar({ property }: InvestmentNavbarProps) {
  const city = property?.city ?? EMPTY_FIELD;
  const address = property?.address ?? EMPTY_FIELD;
  const breadcrumb = `Descubrir / ${city} / ${address}`;

  return (
    <header className="sticky top-0 z-[var(--prophero-z-sticky)] border-b border-[var(--vistral-semantic-border-subtle)] bg-[color-mix(in_srgb,var(--vistral-semantic-bg-default)_80%,transparent)] backdrop-blur-[var(--vistral-blur-3)]">
      <div className="flex h-14 items-center justify-between gap-4 px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-[var(--vistral-semantic-icon-primary)] transition-colors hover:bg-[var(--vistral-semantic-bg-muted)]"
            aria-label="Volver"
          >
            <ChevronLeft className="size-5" strokeWidth={1.75} />
          </Link>
          <p className="truncate text-sm text-[var(--vistral-semantic-text-secondary)]">{breadcrumb}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label="Notificaciones"
            className="flex size-9 items-center justify-center rounded-full text-[var(--vistral-semantic-icon-secondary)] transition-colors hover:bg-[var(--vistral-semantic-bg-muted)]"
          >
            <Bell className="size-5" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            aria-label="Soporte"
            className="flex size-9 items-center justify-center rounded-full text-[var(--vistral-semantic-icon-secondary)] transition-colors hover:bg-[var(--vistral-semantic-bg-muted)]"
          >
            <MessageCircleQuestionMark className="size-5" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </header>
  );
}
