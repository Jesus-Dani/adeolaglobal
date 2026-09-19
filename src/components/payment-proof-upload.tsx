"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PaymentProofUpload({ orderId, existingUrl }: { orderId: string; existingUrl: string | null }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Shows immediately on a successful upload without waiting on a server
  // round-trip for a fresh signed URL — needed when this renders somewhere
  // with no server component to refresh (the checkout success view), and a
  // nicer instant reflection everywhere else too.
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  async function handleUpload(file: File) {
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`/api/account/orders/${orderId}/payment-proof`, {
      method: "POST",
      body: formData,
    });
    const body = await response.json();
    setUploading(false);

    if (!response.ok) {
      setError(body.error);
      return;
    }
    setLocalPreviewUrl(URL.createObjectURL(file));
    router.refresh();
  }

  const displayUrl = localPreviewUrl ?? existingUrl;

  if (displayUrl) {
    return (
      <div className="rounded-xl border border-border bg-white p-4">
        <div className="flex items-center gap-2 text-body-m font-medium text-charcoal">
          <CheckCircle2 className="size-5 text-plum" strokeWidth={1.5} />
          Payment proof uploaded
        </div>
        <div className="relative mt-3 aspect-video w-full max-w-xs overflow-hidden rounded-lg border border-border">
          <Image src={displayUrl} alt="Uploaded payment proof" fill sizes="320px" className="object-contain" unoptimized={!!localPreviewUrl} />
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="mt-3 text-body-s text-plum hover:underline disabled:opacity-40"
        >
          {uploading ? "Uploading..." : "Replace with a different photo"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
            e.target.value = "";
          }}
        />
        {error && (
          <p role="alert" className="mt-2 text-body-s text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <p className="text-body-m font-medium text-charcoal">Upload your payment proof</p>
      <p className="mt-1 text-body-s text-muted-foreground">
        A screenshot or photo of the transfer receipt helps us confirm your order faster.
      </p>

      {error && (
        <p role="alert" className="mt-2 text-body-s text-destructive">
          {error}
        </p>
      )}

      <Button
        type="button"
        variant="outline"
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
        className="mt-3 uppercase text-label tracking-wide"
      >
        <Upload className="size-4" strokeWidth={1.5} />
        {uploading ? "Uploading..." : "Upload Proof"}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
