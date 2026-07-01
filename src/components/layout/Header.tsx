import { Bell } from "lucide-react";

export default function Header() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-8">

      <div>

        <h2 className="text-xl font-semibold">

          Dashboard

        </h2>

      </div>

      <Bell />

    </header>
  );
}