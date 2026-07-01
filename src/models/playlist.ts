import { Channel } from "./channel";

export interface SavedPlaylist {
  id: string;
  name: string;
  sourceNames: string[];
  channels: Channel[];
  createdAt: number;
  updatedAt: number;
}