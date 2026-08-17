"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function HeaderSearch({ className }: { className?: string }) {
  const router = useRouter();
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(value ? `/shop?q=${encodeURIComponent(value)}` : "/shop");
  }

  return (
    <form onSubmit={handleSubmit} className={className} role="search">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          strokeWidth={1.5}
        />
        <Input
          type="search"
          name="q"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search products..."
          className="w-40 pl-9 lg:w-64"
          aria-label="Search products"
        />
      </div>
    </form>
  );
}

export function HeaderSearchTrigger() {
  const router = useRouter();
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Search"
      className="sm:hidden"
      onClick={() => router.push("/shop")}
    >
      <Search strokeWidth={1.5} />
    </Button>
  );
}
