import type { SummaryCard } from "@/types/lifecycle";

interface NavPaymentBannerProps {
  summaryCard: SummaryCard;
}

export function NavPaymentBanner({ summaryCard }: NavPaymentBannerProps) {
  if (!summaryCard.bannerImporte || !summaryCard.bannerVencimiento) {
    return null;
  }

  return (
    <div className="border-b border-[var(--vistral-semantic-border-subtle)] bg-[#EEF4FF] px-6 py-2.5">
      <p className="text-sm leading-5 text-[var(--vistral-semantic-text-secondary)]">
        Importe:{" "}
        <strong className="font-semibold text-[var(--vistral-semantic-text-primary)]">
          {summaryCard.bannerImporte}
        </strong>
        <span className="text-[var(--vistral-semantic-text-secondary)]">
          {" "}
          · Vence el {summaryCard.bannerVencimiento}
        </span>
      </p>
    </div>
  );
}
