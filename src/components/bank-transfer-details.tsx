import { Landmark } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { formatNaira } from "@/lib/currency";

export function BankTransferDetails({ amount }: { amount?: number }) {
  const { bankName, accountName, accountNumber } = siteConfig.bankTransfer;

  return (
    <div className="rounded-xl border border-border bg-soft-lilac p-4">
      <div className="flex items-center gap-2">
        <Landmark className="size-5 shrink-0 text-plum" strokeWidth={1.5} />
        <p className="text-body-m font-medium text-charcoal">Pay by bank transfer</p>
      </div>
      <dl className="mt-3 space-y-1.5 text-body-m">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Bank</dt>
          <dd className="font-medium text-charcoal">{bankName}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Account name</dt>
          <dd className="font-medium text-charcoal">{accountName}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Account number</dt>
          <dd className="font-medium tabular-nums text-charcoal">{accountNumber}</dd>
        </div>
        {amount !== undefined && (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Amount</dt>
            <dd className="font-medium tabular-nums text-charcoal">{formatNaira(amount)}</dd>
          </div>
        )}
      </dl>
      <p className="mt-3 text-body-s text-muted-foreground">
        We&apos;ll confirm your order as soon as we see the transfer come in.
      </p>
    </div>
  );
}
