import { Heart, Leaf } from "lucide-react";

const MESSAGES = [
  { icon: Heart, text: "Made with love in Nigeria" },
  { icon: Leaf, text: "Quality. Nature. Creativity." },
];

export function AnnouncementBar() {
  return (
    <div className="bg-deep-plum text-white">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-center gap-8 px-4 sm:px-6 lg:px-8">
        {MESSAGES.map(({ icon: Icon, text }, i) => (
          <span
            key={text}
            className={
              i === 0
                ? "flex items-center gap-1.5 text-body-s"
                : "hidden items-center gap-1.5 text-body-s sm:flex"
            }
          >
            <Icon className="size-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
