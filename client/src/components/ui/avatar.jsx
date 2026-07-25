import { cn } from "@/lib/utils";

function Avatar({ username, avatarUrl, className }) {
  const initial = username?.[0]?.toUpperCase() || "?";

  return (
    <div
      data-slot="avatar"
      className={cn(
        "flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-700 text-sm font-semibold text-white",
        className
      )}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt={username} className="size-full object-cover" />
      ) : (
        initial
      )}
    </div>
  );
}

export { Avatar };
