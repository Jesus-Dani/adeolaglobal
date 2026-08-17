import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Line-icon + copy + CTA — UI-Design-Brief.md s11. No illustrations/mascots. */
export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
      <Icon className="size-10 text-plum/40" strokeWidth={1.5} aria-hidden="true" />
      <div className="space-y-1">
        <p className="text-body-l text-charcoal">{title}</p>
        <p className="text-body-m text-muted-foreground">{body}</p>
      </div>
      {action ? (
        <Link href={action.href} className={cn(buttonVariants(), "uppercase text-label tracking-wide")}>
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
