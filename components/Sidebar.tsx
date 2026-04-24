'use client';

import {
  BarChart3,
  Briefcase,
  FileStack,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Settings,
  Users,
  X,
} from 'lucide-react';
import clsx from 'clsx';

type SidebarProps = {
  open: boolean;
  onClose: () => void;
  active: string;
};

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'jobs', label: 'Jobs', icon: Briefcase },
  { key: 'applicants', label: 'Applicants', icon: Users },
  { key: 'manual', label: 'Manual List', icon: FileStack },
  { key: 'analysis', label: 'Analysis', icon: BarChart3 },
  { key: 'shortlist', label: 'Shortlist', icon: ListChecks },
  { key: 'settings', label: 'Settings', icon: Settings },
  { key: 'logout', label: 'Logout', icon: LogOut },
] as const;

export default function Sidebar({ open, onClose, active }: SidebarProps) {
  return (
    <>
      <div
        onClick={onClose}
        className={clsx(
          'fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-[2px] transition-opacity lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-72 overflow-hidden border-r border-white/10 text-slate-50 shadow-[0_24px_80px_rgba(2,6,23,0.45)] transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="absolute inset-0 bg-[url('/images/Sidebar.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/90 via-blue-900/80 to-slate-950/95" />

        <div className="relative flex h-full flex-col p-5">
          <div className="mb-8 flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 p-3 shadow-lg shadow-blue-950/20 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-content-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-900/40 ring-1 ring-white/20">
                H
              </div>
              <div>
                <h1 className="text-base font-semibold tracking-wide text-white">
                  Hork
                </h1>
                <p className="text-xs text-blue-100/80">
                  HR Intelligence Suite
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl border border-white/15 bg-white/10 p-2 text-blue-100 transition hover:bg-white/20 lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.key === active;

              return (
                <button
                  key={item.key}
                  type="button"
                  className={clsx(
                    'group flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm backdrop-blur-sm transition-all duration-200',
                    isActive
                      ? 'border-white/20 bg-white/20 text-white shadow-lg shadow-blue-950/20'
                      : 'border-white/10 bg-white/5 text-blue-50/90 hover:border-white/20 hover:bg-white/10 hover:text-white',
                  )}
                >
                  <span
                    className={clsx(
                      'grid h-10 w-10 place-content-center rounded-xl border transition',
                      isActive
                        ? 'border-white/20 bg-white/20 text-white'
                        : 'border-white/10 bg-blue-950/30 text-blue-100',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex flex-col leading-tight">
                    <span className="font-semibold">{item.label}</span>
                    <span className="text-[11px] text-blue-100/70">
                      {isActive ? 'Current section' : 'Open this section'}
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="mt-5 rounded-3xl border border-white/10 bg-white/10 p-4 text-xs text-blue-50/90 shadow-lg shadow-slate-950/15 backdrop-blur-md">
            <p className="text-sm font-semibold text-white">
              AI Assistant Ready
            </p>
            <p className="mt-1 leading-5 text-blue-100/80">
              Use Analysis and Shortlist to review live candidate rankings from
              the backend.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
