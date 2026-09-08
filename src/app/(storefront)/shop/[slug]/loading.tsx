import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full" />

        <div className="flex flex-col gap-5">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      </div>

      <div className="mt-12 max-w-2xl">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="mt-4 h-24 w-full" />
      </div>
    </div>
  );
}
