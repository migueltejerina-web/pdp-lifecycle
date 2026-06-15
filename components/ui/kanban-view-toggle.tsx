"use client";

import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

export type KanbanDisplayView = "board" | "list";

interface KanbanViewToggleProps {
  value: KanbanDisplayView;
  onChange: (value: KanbanDisplayView) => void;
  boardAriaLabel?: string;
  listAriaLabel?: string;
  className?: string;
}

export function KanbanViewToggle({
  value,
  onChange,
  boardAriaLabel = "Kanban board view",
  listAriaLabel = "List view",
  className,
}: KanbanViewToggleProps) {
  return (
    <div
      role="group"
      aria-label="View layout"
      className={cn(
        "inline-flex shrink-0 items-stretch rounded-full border border-[#E4E4E7] bg-background p-0.5 dark:border-[#3F3F46]",
        className
      )}
    >
      <button
        type="button"
        aria-pressed={value === "board"}
        aria-label={boardAriaLabel}
        onClick={() => onChange("board")}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
          value === "board"
            ? "bg-[#D0E8FF] text-foreground dark:bg-[#1e3a5f]"
            : "text-muted-foreground hover:bg-muted/60"
        )}
      >
        <LayoutGrid className="h-4 w-4" aria-hidden />
      </button>
      <div
        className="mx-0.5 w-px self-stretch bg-[#E4E4E7] dark:bg-[#3F3F46]"
        aria-hidden
      />
      <button
        type="button"
        aria-pressed={value === "list"}
        aria-label={listAriaLabel}
        onClick={() => onChange("list")}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
          value === "list"
            ? "bg-[#D0E8FF] text-foreground dark:bg-[#1e3a5f]"
            : "text-muted-foreground hover:bg-muted/60"
        )}
      >
        <List className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
