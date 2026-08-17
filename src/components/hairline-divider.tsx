import { cn } from "@/lib/utils";

/**
 * The signature element — UI-Design-Brief.md §4. A thin gold hairline with a
 * centered dot. Used to divide homepage sections and underline the active
 * nav item (pass a fixed width via className for the underline case).
 */
export function HairlineDivider({ className }: { className?: string }) {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={cn("flex items-center gap-3", className)}
    >
      <span className="h-px flex-1 bg-gold/60" />
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
      <span className="h-px flex-1 bg-gold/60" />
    </div>
  );
}
