import { useEffect, useMemo, useState } from "react";

import type { ReactNode } from "react";

import { parseM3U } from "../services/parser/m3uParser";
import { loadPlaylistFromUrl } from "../pages/Playlist/playlistService";
import type { SavedPlaylist } from "../models/playlist";
import {
  AppStoreContext,
  STORAGE_KEYS,
  makeId,
  normalizePlaylistName,
  readStorage,
  stripExtension,
  writeStorage,
} from "./appStore";
import type { ThemeMode } from "./appStore";

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>(() =>
    readStorage<ThemeMode>(STORAGE_KEYS.theme, "dark")
  );
  const [playlists, setPlaylists] = useState<SavedPlaylist[]>(() =>
    readStorage<SavedPlaylist[]>(STORAGE_KEYS.playlists, [])
  );
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(() =>
    readStorage<string | null>(STORAGE_KEYS.activePlaylistId, null)
  );

  const isDark = theme === "dark";

  useEffect(() => {
    writeStorage(STORAGE_KEYS.theme, theme);
  }, [theme]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.playlists, playlists);
  }, [playlists]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.activePlaylistId, activePlaylistId);
  }, [activePlaylistId]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.body.style.backgroundColor = isDark ? "#020617" : "#f8fafc";
    document.body.style.color = isDark ? "#e2e8f0" : "#0f172a";
    document.documentElement.style.backgroundColor = isDark ? "#020617" : "#f8fafc";
  }, [isDark]);

  useEffect(() => {
    if (!playlists.length) {
      if (activePlaylistId !== null) {
        setActivePlaylistId(null);
      }

      return;
    }

    const hasActivePlaylist = playlists.some(
      (playlist) => playlist.id === activePlaylistId
    );

    if (!activePlaylistId || !hasActivePlaylist) {
      setActivePlaylistId(playlists[0].id);
    }
  }, [playlists, activePlaylistId]);

  const activePlaylist = useMemo(
    () => playlists.find((playlist) => playlist.id === activePlaylistId) ?? null,
    [playlists, activePlaylistId]
  );

  async function importPlaylistFiles(files: File[]) {
    const existingNames = playlists.map((playlist) => playlist.name);
    const importedPlaylists: SavedPlaylist[] = [];

    for (const file of files) {
      const parsed = parseM3U(await file.text());

      if (!parsed.length) {
        continue;
      }

      const playlistName = normalizePlaylistName(stripExtension(file.name), "Playlist", [
        ...existingNames,
        ...importedPlaylists.map((playlist) => playlist.name),
      ]);

      importedPlaylists.push({
        id: makeId(),
        name: playlistName,
        sourceNames: [file.name],
        channels: parsed,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    if (!importedPlaylists.length) {
      return [];
    }

    setPlaylists((current) => [...current, ...importedPlaylists]);

    if (!activePlaylistId) {
      setActivePlaylistId(importedPlaylists[0].id);
    }

    return importedPlaylists;
  }

  async function importPlaylistFromUrl(name: string, url: string) {
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      return null;
    }

    let playlistUrl: URL;

    try {
      playlistUrl = new URL(trimmedUrl);
    } catch {
      return null;
    }

    if (playlistUrl.protocol !== "http:" && playlistUrl.protocol !== "https:") {
      return null;
    }

    let channels = [] as SavedPlaylist["channels"];

    try {
      channels = await loadPlaylistFromUrl(playlistUrl.toString());
    } catch (error) {
      console.error(error);
      return null;
    }

    if (!channels.length) {
      return null;
    }

    const existingNames = playlists.map((playlist) => playlist.name);
    const playlistName = normalizePlaylistName(
      name,
      playlistUrl.hostname || "Playlist",
      existingNames
    );

    const importedPlaylist: SavedPlaylist = {
      id: makeId(),
      name: playlistName,
      sourceNames: [trimmedUrl],
      channels,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setPlaylists((current) => [...current, importedPlaylist]);

    if (!activePlaylistId) {
      setActivePlaylistId(importedPlaylist.id);
    }

    return importedPlaylist;
  }

  function renamePlaylist(playlistId: string, nextName: string) {
    const trimmedName = nextName.trim();

    if (!trimmedName) {
      return;
    }

    setPlaylists((current) =>
      current.map((playlist) =>
        playlist.id === playlistId
          ? { ...playlist, name: trimmedName, updatedAt: Date.now() }
          : playlist
      )
    );
  }

  function deletePlaylist(playlistId: string) {
    setPlaylists((current) => current.filter((playlist) => playlist.id !== playlistId));
  }

  const value = useMemo(
    () => ({
      theme,
      isDark,
      toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark")),
      playlists,
      activePlaylistId,
      activePlaylist,
      setActivePlaylistId,
      importPlaylistFiles,
      importPlaylistFromUrl,
      renamePlaylist,
      deletePlaylist,
    }),
    [theme, isDark, playlists, activePlaylistId, activePlaylist]
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}