import { useEffect, useMemo, useState } from "react";

import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import clsx from "clsx";

import ChannelCard from "../../components/common/ChannelCard";
import VideoPlayer from "../../components/player/VideoPlayer.tsx";

import { Channel } from "../../models/channel";
import { useAppStore } from "../../stores/appStore";

export default function Home() {
  const { isDark, theme, activePlaylist, playlists } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [selectedChannelUrl, setSelectedChannelUrl] = useState<string | null>(null);

  function normalizeGroup(value?: string) {
    return value?.trim().toLowerCase() ?? "";
  }

  const groupOptions = useMemo(() => {
    if (!activePlaylist) {
      return [];
    }

    return Array.from(
      new Set(
        activePlaylist.channels
          .map((channel) => channel.group?.trim())
          .filter((group): group is string => Boolean(group))
      )
    ).sort((left, right) => left.localeCompare(right));
  }, [activePlaylist]);

  const visibleChannels = useMemo(() => {
    if (!activePlaylist) {
      return [] as Channel[];
    }

    const query = searchQuery.trim().toLowerCase();

    const filtered = activePlaylist.channels.filter((channel) => {
      const matchesGroup =
        groupFilter === "all"
          ? true
          : !!channel.group && normalizeGroup(channel.group) === normalizeGroup(groupFilter);

      const matchesSearch =
        !query ||
        channel.name.toLowerCase().includes(query) ||
        (channel.group ?? "").toLowerCase().includes(query);

      return matchesGroup && matchesSearch;
    });

    // Defensive deduplication. The root cause of duplicates is unknown,
    // but this prevents the UI from showing them.
    const seenUrls = new Set<string>();
    const uniqueFiltered = filtered.filter((channel) => {
      if (seenUrls.has(channel.url)) {
        return false;
      }
      seenUrls.add(channel.url);
      return true;
    });

    if (query) {
      return uniqueFiltered.sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        const aGroup = (a.group ?? "").toLowerCase();

        // Score: 3 for name startsWith, 2 for name includes, 1 for group includes
        const aScore = aName.startsWith(query) ? 3 : aName.includes(query) ? 2 : aGroup.includes(query) ? 1 : 0;
        const bScore = bName.startsWith(query) ? 3 : bName.includes(query) ? 2 : aGroup.includes(query) ? 1 : 0;

        if (aScore !== bScore) {
          return bScore - aScore; // Higher score first
        }

        return aName.localeCompare(bName); // Then alphabetical
      });
    }

    return uniqueFiltered;
  }, [activePlaylist, groupFilter, searchQuery]);

  const selectedChannel = useMemo(() => {
    return (
      activePlaylist?.channels.find((channel) => channel.url === selectedChannelUrl) ??
      activePlaylist?.channels[0] ??
      null
    );
  }, [activePlaylist, selectedChannelUrl]);

  useEffect(() => {
    if (!activePlaylist) {
      setGroupFilter("all");
      setSelectedChannelUrl(null);
      return;
    }

    if (groupFilter !== "all" && !groupOptions.includes(groupFilter)) {
      setGroupFilter("all");
    }
  }, [activePlaylist, groupFilter, groupOptions]);

  useEffect(() => {
    if (!activePlaylist) {
      return;
    }

    const selectedExistsInPlaylist = activePlaylist?.channels.some(
      (channel) => channel.url === selectedChannelUrl
    );

    if (!selectedExistsInPlaylist) {
      setSelectedChannelUrl(activePlaylist.channels[0]?.url ?? null);
    }
  }, [activePlaylist, selectedChannelUrl]);

  return (
    <div className={clsx("flex h-full min-h-0 flex-1 overflow-hidden", isDark ? "text-zinc-100" : "text-slate-900")}>
      <aside
        className={clsx(
          "home-sidebar flex w-full min-h-0 flex-col overflow-hidden border-r",
          isDark ? "border-zinc-800 bg-zinc-950" : "border-slate-200 bg-white"
        )}
      >
        <div className={clsx("border-b p-2.5", isDark ? "border-zinc-800" : "border-slate-200")}>
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className={clsx("text-[10px] uppercase tracking-[0.28em]", isDark ? "text-zinc-500" : "text-slate-500")}>
                Playlist
              </div>
              <div className="truncate text-sm font-medium">
                {activePlaylist?.name ?? "None selected"}
              </div>
            </div>

            <Link
              to="/playlists"
              className={clsx(
                "shrink-0 rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition",
                isDark
                  ? "bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              )}
            >
              Manage
            </Link>
          </div>

          <div className="mt-2 flex items-center gap-2 text-[11px]">
            <span className={clsx("rounded-full px-2 py-1", isDark ? "bg-zinc-900 text-zinc-400" : "bg-slate-100 text-slate-600")}>
              {activePlaylist?.channels.length ?? 0} total
            </span>
            <span className={clsx("rounded-full px-2 py-1", isDark ? "bg-zinc-900 text-zinc-400" : "bg-slate-100 text-slate-600")}>
              {visibleChannels.length} visible
            </span>
          </div>
        </div>

        <div className={clsx("border-b p-2.5", isDark ? "border-zinc-800" : "border-slate-200")}>
          <div className="grid grid-cols-[1.4fr_0.9fr] gap-2">
            <div className="relative">
              <Search size={14} className={clsx("pointer-events-none absolute left-3 top-1/2 -translate-y-1/2", isDark ? "text-zinc-500" : "text-slate-400")} />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search"
                className={clsx(
                  "w-full rounded-xl border py-2.5 pl-9 pr-3 text-sm outline-none transition",
                  isDark
                    ? "border-zinc-800 bg-zinc-900 text-zinc-100 placeholder:text-zinc-500"
                    : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
                )}
              />
            </div>

            <select
              value={groupFilter}
              onChange={(event) => setGroupFilter(event.target.value)}
              disabled={!activePlaylist}
              className={clsx(
                "w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition",
                isDark
                  ? "border-zinc-800 bg-zinc-900 text-zinc-100 disabled:text-zinc-500"
                  : "border-slate-200 bg-white text-slate-900 disabled:text-slate-400"
              )}
            >
              <option value="all">All</option>
              {groupOptions.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="sidebar-scrollbar min-h-0 flex-1 mx-2 overflow-y-auto overflow-x-hidden p-2">
          {visibleChannels.length === 0 ? (
            <div className={clsx("rounded-2xl border p-4 text-sm", isDark ? "border-zinc-800 bg-zinc-900/40 text-zinc-400" : "border-slate-200 bg-slate-50 text-slate-600")}>
              {playlists.length === 0
                ? "No playlists saved yet. Open the Playlist page to add one."
                : "No channels match the current search or group filter."}
            </div>
          ) : (
            visibleChannels.map((channel) => (
              <ChannelCard
                key={channel.url}
                channel={channel}
                selected={selectedChannelUrl === channel.url}
                onClick={() => setSelectedChannelUrl(channel.url)}
                theme={theme}
              />
            ))
          )}
        </div>
      </aside>

      <main className={clsx("min-w-0 min-h-0 flex-1 overflow-hidden p-1.5 lg:p-2", isDark ? "bg-zinc-950" : "bg-slate-100")}>
        <div className={clsx("flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border shadow-2xl", isDark ? "border-zinc-800 bg-zinc-900/60" : "border-slate-200 bg-white") }>
          

          <div className="min-h-0 flex-1 overflow-hidden bg-black px-1 py-1 lg:px-2 lg:py-2">
            {selectedChannel ? (
              <VideoPlayer url={selectedChannel.url} />
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-zinc-400">
                Select a channel to start playing.
              </div>
            )}
          </div>

          <div className={clsx("border-b px-3 py-2 text-center", isDark ? "border-zinc-800" : "border-slate-200")}>
            <h2 className="truncate text-sm font-semibold leading-tight">
              Now Playing : {selectedChannel?.name ?? "No Channel Selected"}
            </h2>
          </div>
          
        </div>
      </main>
    </div>
  );
}
