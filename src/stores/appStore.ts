import { createContext, useContext } from "react";

import type { Dispatch, SetStateAction } from "react";

import type { SavedPlaylist } from "../models/playlist";

export type ThemeMode = "light" | "dark";

export const STORAGE_KEYS = {
  playlists: "iptv-player.playlists.v1",
  theme: "iptv-player.theme.v1",
  activePlaylistId: "iptv-player.active-playlist-id.v1",
  proxyUrl: "iptv-player.proxy-url.v1",
};

export interface AppStoreValue {
  theme: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  playlists: SavedPlaylist[];
  activePlaylistId: string | null;
  activePlaylist: SavedPlaylist | null;
  proxyUrl: string | null;
  serverPort: number | null;
  setProxyUrl: (url: string | null) => void;
  setActivePlaylistId: Dispatch<SetStateAction<string | null>>;
  importPlaylistFiles: (files: File[]) => Promise<SavedPlaylist[]>;
  importPlaylistFromUrl: (name:string, url: string) => Promise<SavedPlaylist | null>;
  renamePlaylist: (playlistId: string, nextName: string) => void;
  deletePlaylist: (playlistId: string) => void;
}

export const AppStoreContext = createContext<AppStoreValue | null>(null);

export function useAppStore() {
  const context = useContext(AppStoreContext);

  if (!context) {
    throw new Error("useAppStore must be used within AppProvider");
  }

  return context;
}

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);

  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage(key: string, value: unknown) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function stripExtension(name: string) {
  return name.replace(/\.[^.]+$/, "");
}

export function uniquePlaylistName(baseName: string, existingNames: string[]) {
  if (!existingNames.includes(baseName)) {
    return baseName;
  }

  let suffix = 2;

  while (existingNames.includes(`${baseName} (${suffix})`)) {
    suffix += 1;
  }

  return `${baseName} (${suffix})`;
}

export function normalizePlaylistName(
  name: string | undefined,
  fallback: string,
  existingNames: string[]
) {
  const baseName = name?.trim() || fallback;

  return uniquePlaylistName(baseName, existingNames);
}