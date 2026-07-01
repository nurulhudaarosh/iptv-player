import { useRef, useState } from "react";

import { FolderOpen, Link2, PencilLine, Play, Plus, Trash2 } from "lucide-react";
import clsx from "clsx";

import { useAppStore } from "../../stores/appStore";

function createFilePicker() {
  const input = document.createElement("input");

  input.type = "file";
  input.accept = ".m3u,.m3u8";
  input.multiple = true;

  return input;
}

export default function PlaylistPage() {
  const {
    isDark,
    playlists,
    activePlaylistId,
    setActivePlaylistId,
    importPlaylistFiles,
    importPlaylistFromUrl,
    renamePlaylist,
    deletePlaylist,
  } = useAppStore();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [playlistName, setPlaylistName] = useState("");
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [isUrlImporting, setIsUrlImporting] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  async function addPlaylists(files: File[]) {
    const imported = await importPlaylistFiles(files);

    if (imported.length > 0) {
      setActivePlaylistId(imported[0].id);
    }
  }

  function openFilePicker() {
    const input = inputRef.current ?? createFilePicker();

    inputRef.current = input;

    input.onchange = async () => {
      const files = Array.from(input.files ?? []);

      if (!files.length) {
        return;
      }

      await addPlaylists(files);
      input.value = "";
    };

    input.click();
  }

  async function addPlaylistFromUrl(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedUrl = playlistUrl.trim();

    if (!trimmedUrl) {
      setUrlError("Please enter a playlist URL.");
      return;
    }

    setIsUrlImporting(true);
    setUrlError(null);

    try {
      const imported = await importPlaylistFromUrl(playlistName, trimmedUrl);

      if (imported) {
        setActivePlaylistId(imported.id);
        setPlaylistName("");
        setPlaylistUrl("");
      } else {
        setUrlError("Invalid URL, unreachable source, or no channels found.");
      }
    } catch (error) {
      console.error(error);
      setUrlError("Failed to load playlist from URL.");
    } finally {
      setIsUrlImporting(false);
    }
  }

  function onRename(playlistId: string, currentName: string) {
    const nextName = window.prompt("Rename playlist", currentName)?.trim();

    if (!nextName) {
      return;
    }

    renamePlaylist(playlistId, nextName);
  }

  return (
    <div className={clsx("min-h-full p-4 lg:p-6", isDark ? "text-zinc-100" : "text-slate-900")}>
      <div className={clsx("mx-auto flex max-w-6xl flex-col gap-4 rounded-3xl border p-4 shadow-2xl", isDark ? "border-zinc-800 bg-zinc-950/70" : "border-slate-200 bg-white")}>
        <div className={clsx("flex flex-col gap-3 border-b pb-4 lg:flex-row lg:items-center lg:justify-between", isDark ? "border-zinc-800" : "border-slate-200")}>
          <div>
            <h1 className="text-2xl font-semibold">Playlist Manager</h1>
            <p className={clsx("text-sm", isDark ? "text-zinc-400" : "text-slate-600")}>
              Add, rename, delete, and activate playlists.
            </p>
          </div>

          <button
            type="button"
            onClick={openFilePicker}
            className={clsx(
              "inline-flex items-center gap-2 self-start rounded-full px-4 py-2 text-sm font-medium transition",
              isDark
                ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                : "bg-slate-900 text-white hover:bg-slate-800"
            )}
          >
            <FolderOpen size={18} />
            Add Playlist
          </button>
        </div>

        <div className={clsx("grid gap-4 rounded-3xl border p-4 lg:grid-cols-[1fr_1.2fr]", isDark ? "border-zinc-800 bg-zinc-900/40" : "border-slate-200 bg-slate-50")}>
          <button
            type="button"
            onClick={openFilePicker}
            className={clsx(
              "inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition",
              isDark
                ? "border-zinc-800 bg-zinc-950 text-zinc-100 hover:bg-zinc-900"
                : "border-slate-200 bg-white text-slate-900 hover:bg-slate-100"
            )}
          >
            <FolderOpen size={18} />
            Add From File
          </button>

          <form onSubmit={addPlaylistFromUrl} className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={clsx("mb-1 block text-xs uppercase tracking-[0.2em]", isDark ? "text-zinc-500" : "text-slate-500")}>
                  Playlist Name
                </label>
                <input
                  value={playlistName}
                  onChange={(event) => setPlaylistName(event.target.value)}
                  placeholder="My TV List"
                  className={clsx(
                    "w-full rounded-2xl border px-3 py-3 text-sm outline-none transition",
                    isDark
                      ? "border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-500"
                      : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
                  )}
                />
              </div>

              <div>
                <label className={clsx("mb-1 block text-xs uppercase tracking-[0.2em]", isDark ? "text-zinc-500" : "text-slate-500")}>
                  Source URL
                </label>
                <div className="relative">
                  <Link2 size={16} className={clsx("pointer-events-none absolute left-3 top-1/2 -translate-y-1/2", isDark ? "text-zinc-500" : "text-slate-400")} />
                  <input
                    value={playlistUrl}
                    onChange={(event) => setPlaylistUrl(event.target.value)}
                    placeholder="https://example.com/playlist.m3u"
                    className={clsx(
                      "w-full rounded-2xl border px-3 py-3 pl-10 text-sm outline-none transition",
                      isDark
                        ? "border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-500"
                        : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
                    )}
                  />
                </div>
              </div>
            </div>

            {urlError ? (
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-500">
                {urlError}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isUrlImporting}
              className={clsx(
                "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition disabled:opacity-60",
                isDark
                  ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              )}
            >
              <Plus size={18} />
              {isUrlImporting ? "Adding..." : "Add From URL"}
            </button>
          </form>
        </div>

        <div className="grid gap-3">
          {playlists.length === 0 ? (
            <div className={clsx("rounded-2xl border p-5 text-sm", isDark ? "border-zinc-800 bg-zinc-900/40 text-zinc-400" : "border-slate-200 bg-slate-50 text-slate-600")}>
              No playlists saved yet. Use Add Playlist to import one or more M3U files.
            </div>
          ) : (
            playlists.map((playlist) => {
              const active = playlist.id === activePlaylistId;

              return (
                <div
                  key={playlist.id}
                  className={clsx(
                    "flex flex-col gap-3 rounded-2xl border p-4 transition lg:flex-row lg:items-center lg:justify-between",
                    active
                      ? isDark
                        ? "border-cyan-400/40 bg-cyan-500/10"
                        : "border-sky-400/40 bg-sky-500/10"
                      : isDark
                        ? "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setActivePlaylistId(playlist.id)}
                    className="flex min-w-0 flex-1 items-start gap-3 text-left"
                  >
                    <div
                      className={clsx(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                        isDark ? "bg-zinc-900 text-zinc-100" : "bg-white text-slate-900"
                      )}
                    >
                      <Play size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="truncate text-base font-semibold">{playlist.name}</div>
                        {active ? (
                          <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-500">
                            Active
                          </span>
                        ) : null}
                      </div>

                      <div className={clsx("mt-1 text-sm", isDark ? "text-zinc-400" : "text-slate-600")}>
                        {playlist.channels.length} channels
                      </div>
                    </div>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onRename(playlist.id, playlist.name)}
                      className={clsx(
                        "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition",
                        isDark
                          ? "bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
                          : "bg-white text-slate-700 hover:bg-slate-100"
                      )}
                    >
                      <PencilLine size={14} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => deletePlaylist(playlist.id)}
                      className="inline-flex items-center gap-2 rounded-xl bg-rose-500/15 px-3 py-2 text-sm font-medium text-rose-500 transition hover:bg-rose-500/25"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <input ref={inputRef} type="file" accept=".m3u,.m3u8" multiple hidden />
      </div>
    </div>
  );
}
