import { Channel } from "../../models/channel";

type ThemeMode = "light" | "dark";

interface Props {
  channel: Channel;
  selected: boolean;
  onClick: () => void;
  theme: ThemeMode;
}

export default function ChannelCard({
  channel,
  selected,
  onClick,
  theme,
}: Props) {
  const isDark = theme === "dark";

  return (
    <div
      onClick={onClick}
      className={`
        flex
        cursor-pointer
        items-center
        gap-4
        border-b
        p-3
        transition

        ${isDark ? "border-zinc-800" : "border-slate-200"}

        ${
          selected
            ? isDark
              ? "bg-cyan-500/15"
              : "bg-sky-500/10"
            : isDark
              ? "hover:bg-zinc-900"
              : "hover:bg-slate-100"
        }
      `}
    >
      <img
        src={
          channel.logo ||
          "https://placehold.co/64x64?text=TV"
        }
        className={`h-12 w-12 rounded-lg object-contain ${
          isDark ? "bg-white" : "bg-slate-200"
        }`}
        onError={(e) => {
          e.currentTarget.src =
            "https://placehold.co/64x64?text=TV";
        }}
      />

      <div className="min-w-0 flex-1">
        <div className={`truncate font-semibold ${isDark ? "text-zinc-100" : "text-slate-900"}`}>
          {channel.name}
        </div>

        <div className={`text-sm ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
          {channel.group ?? "Unknown"}
        </div>
      </div>
    </div>
  );
}