'use client';

import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
  BarChart3,
  Briefcase,
  FileStack,
  FileText,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Settings,
  Users,
  X,
} from 'lucide-react';

type AppShellContextValue = {
  closeSidebar: () => void;
  openSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
};

const AppShellContext = createContext<AppShellContextValue | null>(null);

const navigationItems = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  { key: 'jobs', label: 'Jobs', icon: Briefcase, href: '/jobs' },
  { key: 'applicants', label: 'Applicants', icon: Users, href: '/applicants' },
  { key: 'manual', label: 'Manual List', icon: FileStack, href: '/manual' },
  { key: 'analysis', label: 'Analysis', icon: BarChart3, href: '/analysis' },
  //{ key: 'shortlist', label: 'Shortlist', icon: ListChecks, href: '/shortlist' },
  //{ key: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
  //{ key: 'logout', label: 'Logout', icon: LogOut, href: '/logout' },
  
  { key: 'chat', label: 'Chat', icon: FileText, href: '/chat' },
];

type AppShellProps = {
  children: ReactNode;
  mainClassName?: string;
};

type AppShellProviderProps = {
  children: ReactNode;
};

export function AppShellProvider({ children }: AppShellProviderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const contextValue = useMemo<AppShellContextValue>(
    () => ({
      closeSidebar: () => setSidebarOpen(false),
      openSidebar: () => setSidebarOpen(true),
      setSidebarOpen,
      sidebarOpen,
      toggleSidebar: () => setSidebarOpen((open) => !open),
    }),
    [sidebarOpen],
  );

  return (
    <AppShellContext.Provider value={contextValue}>
      {children}
    </AppShellContext.Provider>
  );
}

export function AppShell({
  children,
  mainClassName = 'min-h-screen transition-all duration-300 lg:pl-80',
}: AppShellProps) {
  const pathname = usePathname();
  const { sidebarOpen, closeSidebar } = useAppShell();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      <div
        onClick={closeSidebar}
        className={clsx(
          'fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-[2px] transition-all duration-300 lg:hidden',
          sidebarOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0',
        )}
      />

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-80 overflow-hidden shadow-2xl transition-all duration-300 ease-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="absolute inset-0 bg-[url('/images/Sidebar.jpg')] bg-cover bg-center bg-no-repeat" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/95 via-indigo-950/90 to-slate-950/95" />

        <div className="relative flex h-full flex-col p-6">
          <div className="group mb-8 flex items-center justify-between rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md transition-all duration-300 hover:bg-white/15">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-content-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 text-lg font-bold text-white shadow-lg shadow-blue-900/40 ring-1 ring-white/30 transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
                Hrok
              </div>
              <div>
                <h1 className="text-base font-bold tracking-wide text-white">
                  Hrok Dashboard
                </h1>
                <p className="text-xs text-blue-200/80">
                  Intelligence Suite
                </p>
              </div>
            </div>
            <button
              onClick={closeSidebar}
              className="rounded-xl border border-white/20 bg-white/15 p-2 text-white/80 transition-all duration-200 hover:bg-white/25 hover:text-white lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              const itemClassName = clsx(
                'group relative flex w-full items-center gap-3 overflow-hidden rounded-xl border px-4 py-3 text-left text-sm backdrop-blur-sm transition-all duration-200',
                isActive
                  ? 'border-cyan-400/40 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-white shadow-lg shadow-cyan-900/30'
                  : 'border-white/10 bg-white/5 text-blue-50/80 hover:border-white/20 hover:bg-white/10 hover:text-white',
              );

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={closeSidebar}
                  className={itemClassName}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 h-12 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-cyan-400 to-blue-500 shadow-lg shadow-cyan-400/50" />
                  )}

                  <span
                    className={clsx(
                      'grid h-10 w-10 place-content-center rounded-xl border transition-all duration-200',
                      isActive
                        ? 'border-cyan-400/40 bg-gradient-to-br from-cyan-500/30 to-blue-600/30 text-white shadow-md'
                        : 'border-white/15 bg-blue-950/40 text-blue-100 group-hover:border-white/25 group-hover:bg-white/15',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>

                  <span className="flex flex-col leading-tight">
                    <span className="font-semibold">{item.label}</span>
                    <span className="text-[11px] text-blue-200/70">
                      {isActive ? 'Current section' : 'Open this section'}
                    </span>
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 rounded-2xl border border-white/15 bg-gradient-to-br from-white/10 to-white/5 p-4 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
              <p className="text-xs font-semibold text-emerald-300">
                AI Assistant Active
              </p>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-blue-100/80">
              Use Analysis and Shortlist to review live candidate rankings
              from the backend.
            </p>
          </div>
        </div>
      </aside>

      <main className={mainClassName}>{children}</main>
    </div>
  );
}

export function useAppShell() {
  const context = useContext(AppShellContext);

  if (!context) {
    throw new Error('useAppShell must be used within AppShell.');
  }

  return context;
}
