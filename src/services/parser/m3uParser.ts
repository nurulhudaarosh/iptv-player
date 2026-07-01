import { Channel } from "../../models/channel";

export function parseM3U(content: string): Channel[] {
  const channels: Channel[] = [];

  const lines = content.split("\n");

  let current: Partial<Channel> = {};

  for (const line of lines) {
    const value = line.trim();

    if (value.startsWith("#EXTINF")) {
      current = {};

      current.name = value.split(",").pop() ?? "Unknown";

      current.logo = value.match(/tvg-logo="([^"]+)"/)?.[1];

      current.group = value.match(/group-title="([^"]+)"/)?.[1];

      current.tvgId = value.match(/tvg-id="([^"]+)"/)?.[1];
    }

    else if (value.startsWith("http")) {
      current.url = value;

      channels.push(current as Channel);
    }
  }

  return channels;
}