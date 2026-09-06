import Link from "next/link";

export function KpiCard({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="rounded-xl border border-border bg-white p-5 transition-shadow hover:shadow-md">
      <p className="text-body-s text-muted-foreground">{label}</p>
      <p className="mt-1 text-price font-bold tabular-nums text-plum">{value}</p>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
