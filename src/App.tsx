import { HashRouter, Link, NavLink, Route, Routes } from "react-router-dom";

import { FolderOpen, House, Moon, Search, Settings, Sun } from "lucide-react";
import clsx from "clsx";

import Home from "./pages/Home/Home.tsx";
import FavoritesPage from "./pages/Favorites/Favorites.tsx";
import PlaylistPage from "./pages/Playlist/Playlist.tsx";
import SearchPage from "./pages/Search/Search.tsx";
import SettingsPage from "./pages/Settings/Settings.tsx";
import { Toaster } from "react-hot-toast";
import { AppProvider } from "./stores/AppProvider";
import { useAppStore } from "./stores/appStore";
import "./App.css";

function AppShell() {
  const { isDark, theme, toggleTheme } = useAppStore();

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    clsx(
      "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition",
      isDark
        ? isActive
          ? "bg-zinc-800 text-zinc-100"
          : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
        : isActive
          ? "bg-slate-900 text-white"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    );

  return (
    <div className={clsx("flex h-screen flex-col overflow-hidden", isDark ? "bg-zinc-950 text-zinc-100" : "bg-slate-100 text-slate-900")}>
      <Toaster position="bottom-center" toastOptions={{ theme: isDark ? "dark" : "light" }} />
      <header className={clsx("grid grid-cols-[1fr_auto_1fr] items-center border-b px-4 py-3 lg:px-6", isDark ? "border-zinc-800 bg-zinc-950/95" : "border-slate-200 bg-white/90")}>
        <div className="flex items-center gap-4 justify-self-start">
          <Link to="/" className="text-lg font-semibold tracking-wide">
            IPTV Player
          </Link>
        </div>


        <nav className="flex items-center justify-center gap-1 justify-self-center">
            <NavLink to="/" className={navItemClass} end>
              <House size={16} />
              Home
            </NavLink>
            <NavLink to="/playlists" className={navItemClass}>
              <FolderOpen size={16} />
              Playlists
            </NavLink>
            <NavLink to="/search" className={navItemClass}>
              <Search size={16} />
              Search
            </NavLink>
            <NavLink to="/settings" className={navItemClass}>
              <Settings size={16} />
              Settings
            </NavLink>
        </nav>

        <button
          type="button"
          onClick={toggleTheme}
          className={clsx(
            "inline-flex h-10 w-10 items-center justify-center rounded-full border transition justify-self-end",
            isDark
              ? "border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
              : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
          )}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      <main className="min-h-0 flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/playlists" element={<PlaylistPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <HashRouter>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </HashRouter>
  );
}

export default App;
