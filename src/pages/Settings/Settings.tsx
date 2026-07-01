import clsx from "clsx";

import { useAppStore } from "../../stores/appStore";

export default function SettingsPage() {
  const { isDark } = useAppStore();

  return (
    <div className={clsx("min-h-full p-4 lg:p-6", isDark ? "text-zinc-100" : "text-slate-900")}>
      <div className={clsx("mx-auto max-w-4xl rounded-3xl border p-6", isDark ? "border-zinc-800 bg-zinc-950/70" : "border-slate-200 bg-white")}>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className={clsx("mt-2 text-sm", isDark ? "text-zinc-400" : "text-slate-600")}>
          Theme and playlist options are available from the top bar and the playlist manager.
        </p>
      </div>
    </div>
  );
}
