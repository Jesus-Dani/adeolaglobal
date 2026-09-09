import { Heart } from "lucide-react";

export function AnnouncementBar() {
  return (
    <div className="bg-deep-plum text-white">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-center gap-8 px-4 sm:px-6 lg:px-8">
        <span className="flex items-center gap-1.5 text-body-s">
          <Heart className="size-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
          Made with love in Nigeria
        </span>
      </div>
    </div>
  );
}
