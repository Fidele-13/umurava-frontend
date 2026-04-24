import { Menu, Search } from 'lucide-react';

type NavbarProps = {
  onMenuClick: () => void;
};

export default function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <header className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            HR Dashboard
          </h2>
          <p className="mt-1 text-sm text-slate-500">Welcome back, John Doe!</p>
        </div>
      </div>

      <div className="relative w-full sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          placeholder="Search applicants, jobs..."
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none ring-blue-500 transition focus:ring-2"
        />
      </div>
    </header>
  );
}
