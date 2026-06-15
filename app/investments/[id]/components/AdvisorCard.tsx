import type { AdvisorMock } from "../mock/property.mock";

interface AdvisorCardProps {
  advisor: AdvisorMock;
}

export function AdvisorCard({ advisor }: AdvisorCardProps) {
  const initials = advisor.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="rounded-[var(--vistral-radius-6)] border border-[var(--vistral-semantic-border-muted)] bg-[var(--vistral-semantic-bg-default)] p-6 shadow-[var(--vistral-shadow-level-1)]">
      <h3 className="text-xl font-medium text-[var(--vistral-semantic-text-primary)]">
        Contacta con tu asesor
      </h3>

      <div className="mt-5 rounded-[var(--vistral-radius-4)] bg-[var(--vistral-semantic-bg-subtle)] p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-[var(--vistral-radius-2)] bg-[var(--vistral-semantic-bg-muted)]">
            {advisor.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={advisor.photoUrl}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <span
                className="text-sm font-semibold text-[var(--vistral-semantic-text-secondary)]"
                aria-hidden
              >
                {initials}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--vistral-semantic-text-primary)]">
              {advisor.name}
            </p>
            <p className="text-sm text-[var(--vistral-semantic-text-secondary)]">
              {advisor.role}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="mt-4 h-8 w-full rounded-full bg-[#D9E7FF] text-sm font-medium text-[#162EB7] transition-opacity hover:opacity-90"
        >
          Agendar llamada
        </button>
      </div>
    </section>
  );
}
