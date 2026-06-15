"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface StickyScrollTableProps {
  children: React.ReactNode;
  className?: string;
  /**
   * When provided, the table is rendered inside a fixed-height viewport with a
   * single scroll container (both X + Y). This keeps the horizontal scrollbar
   * accessible without requiring the user to scroll to the bottom of the page.
   */
  maxHeight?: React.CSSProperties["height"];
  /**
   * When provided, this ref is set to the inner scrollable div so callers can
   * drive auto-scroll during pointer-drag operations.
   */
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Wraps a horizontally-scrollable table so the scrollbar stays fixed at the
 * bottom of the viewport. The real scrollbar is hidden; a thin phantom bar
 * pinned with `sticky bottom-0` stays visible while the user scrolls the page.
 *
 * Usage:
 *   <StickyScrollTable>
 *     <Table>…</Table>
 *   </StickyScrollTable>
 */
export function StickyScrollTable({ children, className, maxHeight, scrollContainerRef }: StickyScrollTableProps) {
  const tableScrollRef = useRef<HTMLDivElement>(null);

  // Stable callback ref that sets both the internal ref and the optional external one.
  // Using useCallback with no deps is safe because both refs have stable object identity.
  const setTableScrollRef = useCallback((el: HTMLDivElement | null) => {
    (tableScrollRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    if (scrollContainerRef) {
      (scrollContainerRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const stickyScrollRef = useRef<HTMLDivElement>(null);
  const [tableScrollWidth, setTableScrollWidth] = useState(0);
  const isSyncingScroll = useRef(false);

  const updateScrollWidth = useCallback(() => {
    const el = tableScrollRef.current;
    if (el) setTableScrollWidth(el.scrollWidth);
  }, []);

  useEffect(() => {
    if (maxHeight) return;
    updateScrollWidth();
    const el = tableScrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateScrollWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, [maxHeight, updateScrollWidth]);

  useEffect(() => {
    if (maxHeight) return;
    const tableEl = tableScrollRef.current;
    const stickyEl = stickyScrollRef.current;
    if (!tableEl || !stickyEl) return;
    const syncFromTable = () => {
      if (isSyncingScroll.current) return;
      isSyncingScroll.current = true;
      stickyEl.scrollLeft = tableEl.scrollLeft;
      requestAnimationFrame(() => { isSyncingScroll.current = false; });
    };
    const syncFromSticky = () => {
      if (isSyncingScroll.current) return;
      isSyncingScroll.current = true;
      tableEl.scrollLeft = stickyEl.scrollLeft;
      requestAnimationFrame(() => { isSyncingScroll.current = false; });
    };
    tableEl.addEventListener("scroll", syncFromTable);
    stickyEl.addEventListener("scroll", syncFromSticky);
    return () => {
      tableEl.removeEventListener("scroll", syncFromTable);
      stickyEl.removeEventListener("scroll", syncFromSticky);
    };
  }, [maxHeight]);

  if (maxHeight) {
    return (
      <div
        className="w-full flex flex-col gap-0 overflow-hidden rounded-lg border border-border"
        style={{ height: maxHeight, minHeight: 320 }}
      >
        <div
          ref={setTableScrollRef}
          className={cn(
            "flex-1 min-h-0 w-full overflow-auto",
            // Sticky header row: every <th> in <thead> stays pinned to the top while scrolling.
            // - `top-0` works alongside any existing `left-X` / `right-X` so corner cells become sticky on both axes.
            // - Header cells sit above sticky body cells; sticky corner headers get a higher layer
            //   so horizontally-scrolled column headers cannot cover the fixed label header.
            // Each <th> must define its own background so rows scrolling underneath stay hidden.
            "[&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:z-[60] [&_thead_th[data-sticky-corner='true']]:z-[80]",
            className
          )}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-0">
      <div
        ref={setTableScrollRef}
        className={cn(
          "w-full overflow-x-scroll overflow-y-visible [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          className
        )}
      >
        {children}
      </div>
      <div
        ref={stickyScrollRef}
        className="sticky bottom-0 left-0 right-0 z-10 h-3 overflow-x-scroll overflow-y-hidden bg-white dark:bg-[#1C1C1E] border-t border-border shrink-0 [direction:ltr]"
        style={{ width: "100%" }}
        aria-hidden
      >
        <div style={{ width: tableScrollWidth || "100%", height: 1, minWidth: "100%" }} />
      </div>
    </div>
  );
}
