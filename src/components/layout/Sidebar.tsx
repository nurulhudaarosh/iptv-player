import {
  House,
  FolderOpen,
  Heart,
  Search,
  Settings
} from "lucide-react";

const menus = [
  { name: "Home", icon: House },
  { name: "Playlist", icon: FolderOpen },
  { name: "Favorites", icon: Heart },
  { name: "Search", icon: Search },
  { name: "Settings", icon: Settings }
];

export default function Sidebar() {
  return (
    <aside className="w-72 bg-zinc-900 border-r border-zinc-800">

      <div className="p-8">

        <h1 className="text-3xl font-bold">

          IPTV

        </h1>

      </div>

      <nav className="px-3">

        {menus.map((item) => (

          <button
            key={item.name}
            className="flex w-full items-center gap-4 rounded-xl px-4 py-4 text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
          >
            <item.icon size={22} />

            {item.name}

          </button>

        ))}

      </nav>

    </aside>
  );
}