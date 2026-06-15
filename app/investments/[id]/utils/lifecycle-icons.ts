import { Handshake, Link, Lock, PenLine, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  lock: Lock,
  link: Link,
  "pen-line": PenLine,
  wrench: Wrench,
  handshake: Handshake,
};

export function getStageIcon(icon: string): LucideIcon {
  return ICON_MAP[icon] ?? Lock;
}
