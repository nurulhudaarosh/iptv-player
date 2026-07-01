import clsx from "clsx";

import { useAppStore } from "../../stores/appStore";

export default function SearchPage() {
  const { isDark, activePlaylist } = useAppStore();

  return (
    <div className={clsx("min-h-full p-4 lg:p-6", isDark ? "text-zinc-100" : "text-slate-900")}>
      <div className={clsx("mx-auto max-w-4xl rounded-3xl border p-6", isDark ? "border-zinc-800 bg-zinc-950/70" : "border-slate-200 bg-white")}>
        <h1 className="text-2xl font-semibold">Search</h1>
        <p className={clsx("mt-2 text-sm", isDark ? "text-zinc-400" : "text-slate-600")}>
          Use the search box on the Home screen to filter channels in the active playlist.
        </p>

        <div className={clsx("mt-6 rounded-2xl border p-4", isDark ? "border-zinc-800 bg-zinc-900/40" : "border-slate-200 bg-slate-50")}>
          <div className={clsx("text-sm", isDark ? "text-zinc-400" : "text-slate-600")}>
            Active playlist
          </div>
          <div className="mt-1 text-lg font-semibold">{activePlaylist?.name ?? "None"}</div>
        </div>
      </div>
    </div>
  );
}
