import { parseM3U } from "../../services/parser/m3uParser";

import { Channel } from "../../models/channel";

export async function loadPlaylistFromUrl(
  url: string
): Promise<Channel[]> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to load playlist");
  }

  const text = await response.text();

  return parseM3U(text);
}