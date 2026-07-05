import { invoke } from "@tauri-apps/api/core";
import { parseM3U } from "../../services/parser/m3uParser";

import { Channel } from "../../models/channel";

export async function loadPlaylistFromUrl(
  url: string,
  proxyUrl: string | null
): Promise<Channel[]> {
  const text = await invoke<string>("fetch_playlist", { url, proxyUrl });

  return parseM3U(text);
}