'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Briefcase,
  FileStack,
  FileText,
  ListChecks,
  Users,
  Menu,
  TrendingUp,
  Search,
  ArrowUpRight,
} from 'lucide-react';
import { AppShell, useAppShell } from '@/app/components/app-shell';

// ============================================================================
// REAL API TYPES & FUNCTIONS (preserved exactly as you provided)
// ============================================================================

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || 'https://umurava-jaq4.onrender.com';

export type Job = {
  _id: string;
  jobId: string;
  title: string;
  department: string;
  location: string;
  description: string;
  requiredSkills?: string[];
  preferredSkills?: string[];
  minYearsExperience?: number;
  createdAt?: string;
};

export type Candidate = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  source: 'manual' | 'resume-pdf' | 'csv' | 'xlsx' | 'external-api';
  skills?: Array<{ name: string }>;
  experience?: Array<{ role: string }>;
  createdAt?: string;
};

export type CandidateWithJobs = {
  candidate: Candidate;
  appliedJobIds: string[];
  applications: Array<{
    applicationId: string;
    jobId: string | null;
    mongoJobId: string;
    title: string | null;
    status: 'applied' | 'screened' | 'shortlisted' | 'rejected';
    source:
      | 'manual'
      | 'dummy-seed'
      | 'external-api'
      | 'csv-upload'
      | 'resume-upload';
  }>;
};

export type Screening = {
  _id: string;
  jobExternalId: string;
  rankedCandidates: Array<{
    candidateId: string;
    decision?: 'Selected' | 'Consider' | 'Reject';
    score?: number;
  }>;
  createdAt?: string;
};

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`API ${response.status} at ${path}`);
  }

  return response.json() as Promise<T>;
}

function getJobs() {
  return request<Job[]>('/jobs');
}

function getCandidatesWithJobs() {
  return request<CandidateWithJobs[]>('/candidates/with-jobs');
}

function getScreenings() {
  return request<Screening[]>('/ai/screenings');
}

// ============================================================================
// LOCAL TYPES FOR DASHBOARD
// ============================================================================

type JobOverviewRow = {
  jobRole: string;
  companyName: string;
  applicants: number;
  seniorityLevel: string;
};

type ApplicantRow = {
  applicants: string;
  jobRole: string;
  experience: string;
  skills: string;
};

const formatSource = (source: string) => {
  if (source === 'resume-pdf') return 'Resume PDF';
  if (source === 'external-api') return 'External API';
  if (source === 'csv') return 'CSV Upload';
  if (source === 'xlsx') return 'Excel Upload';
  return source.toUpperCase();
};

const getCandidateName = (item: CandidateWithJobs) =>
  `${item.candidate.firstName} ${item.candidate.lastName}`.trim();

// ============================================================================
// MAIN DASHBOARD COMPONENT (everything inlined)
// ============================================================================

export default function DashboardPage() {
  const { openSidebar } = useAppShell();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidatesWithJobs, setCandidatesWithJobs] = useState<
    CandidateWithJobs[]
  >([]);
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadDashboardData() {
      try {
        setLoading(true);
        setError(null);
        const [jobsData, candidatesData, screeningsData] = await Promise.all([
          getJobs(),
          getCandidatesWithJobs(),
          getScreenings(),
        ]);

        if (!active) return;

        setJobs(jobsData);
        setCandidatesWithJobs(candidatesData);
        setScreenings(screeningsData);
      } catch (err) {
        if (!active) return;
        setError('Failed to load dashboard data from backend API.');
        console.error(err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadDashboardData();

    return () => {
      active = false;
    };
  }, []);

  const jobOverviewData = useMemo<JobOverviewRow[]>(() => {
    const applicationsByJobId = new Map<string, number>();
    for (const item of candidatesWithJobs) {
      for (const application of item.applications) {
        if (!application.jobId) continue;
        const current = applicationsByJobId.get(application.jobId) ?? 0;
        applicationsByJobId.set(application.jobId, current + 1);
      }
    }

    return jobs.slice(0, 8).map((job) => ({
      jobRole: job.title,
      companyName: job.department,
      applicants: applicationsByJobId.get(job.jobId) ?? 0,
      seniorityLevel:
        typeof job.minYearsExperience === 'number' && job.minYearsExperience > 0
          ? `${job.minYearsExperience}+ years`
          : 'Not specified',
    }));
  }, [jobs, candidatesWithJobs]);

  const recentApplicantsData = useMemo<ApplicantRow[]>(() => {
    const sorted = [...candidatesWithJobs].sort((a, b) => {
      const first = Date.parse(a.candidate.createdAt ?? '');
      const second = Date.parse(b.candidate.createdAt ?? '');
      return (
        (Number.isNaN(second) ? 0 : second) - (Number.isNaN(first) ? 0 : first)
      );
    });

    return sorted.slice(0, 8).map((item) => {
      const firstApplication = item.applications[0];
      const latestRole =
        item.candidate.experience?.[0]?.role ?? 'Not specified';
      const topSkills =
        item.candidate.skills
          ?.slice(0, 2)
          .map((skill) => skill.name)
          .filter(Boolean)
          .join(', ') || 'Not specified';

      return {
        applicants: getCandidateName(item),
        jobRole: firstApplication?.title ?? 'Unassigned',
        experience: latestRole,
        skills: topSkills,
      };
    });
  }, [candidatesWithJobs]);

  const shortlistCandidates = useMemo(() => {
    const candidateById = new Map(
      candidatesWithJobs.map((item) => [item.candidate._id, item]),
    );

    const ranked = screenings
      .flatMap((screening) => screening.rankedCandidates)
      .filter((entry) => typeof entry.score === 'number')
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 5);

    return ranked.map((entry, rankIndex) => {
      const match = candidateById.get(entry.candidateId);
      const name = match ? getCandidateName(match) : 'Candidate';
      const role =
        match?.candidate.experience?.[0]?.role ?? 'Profile unavailable';
      const key = `${entry.candidateId || 'unknown'}-${rankIndex}`;

      return {
        key,
        name,
        role,
        percent: `${Math.round(entry.score ?? 0)}%`,
      };
    });
  }, [screenings, candidatesWithJobs]);

  const recentImports = useMemo(() => {
    const sorted = [...candidatesWithJobs].sort((a, b) => {
      const first = Date.parse(a.candidate.createdAt ?? '');
      const second = Date.parse(b.candidate.createdAt ?? '');
      return (
        (Number.isNaN(second) ? 0 : second) - (Number.isNaN(first) ? 0 : first)
      );
    });

    return sorted
      .filter((item) => item.candidate.source !== 'manual')
      .slice(0, 6)
      .map((item) => ({
        label: `${getCandidateName(item)} (${formatSource(item.candidate.source)})`,
      }));
  }, [candidatesWithJobs]);

  const totalShortlisted = useMemo(
    () =>
      screenings
        .flatMap((screening) => screening.rankedCandidates)
        .filter((entry) => entry.decision === 'Selected').length,
    [screenings],
  );

  const totalImports = useMemo(
    () =>
      candidatesWithJobs.filter((item) => item.candidate.source !== 'manual')
        .length,
    [candidatesWithJobs],
  );

  const metrics = useMemo(
    () => [
      {
        icon: Briefcase,
        value: String(jobs.length),
        label: 'Total Jobs',
        trend: 'live',
      },
      {
        icon: Users,
        value: String(candidatesWithJobs.length),
        label: 'Total Applicants',
        trend: 'live',
      },
      {
        icon: FileStack,
        value: String(totalImports),
        label: 'Imported Applicants',
        trend: 'live',
      },
      {
        icon: ListChecks,
        value: String(totalShortlisted),
        label: 'Selected by AI',
        trend: 'live',
      },
    ],
    [jobs.length, candidatesWithJobs.length, totalImports, totalShortlisted],
  );

  // Loading skeleton
  if (loading) {
    return (
      <AppShell>
        {/* Sidebar Skeleton */}
        <div className="min-h-screen">
          <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6">
            {/* Navbar Skeleton */}
            <div className="mb-6 h-24 animate-pulse rounded-2xl bg-white shadow-card" />

            {/* Metrics Skeleton */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-xl bg-white shadow-card"
                />
              ))}
            </div>

            {/* Tables Skeleton */}
            <div className="mt-6 grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-6">
                <div className="h-64 animate-pulse rounded-xl bg-white shadow-card" />
                <div className="h-64 animate-pulse rounded-xl bg-white shadow-card" />
              </div>
              <div className="space-y-6">
                <div className="h-80 animate-pulse rounded-xl bg-white shadow-card" />
                <div className="h-64 animate-pulse rounded-xl bg-white shadow-card" />
              </div>
            </div>

            {/* Loading Overlay */}
            <div className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
              <div className="rounded-2xl bg-white p-8 shadow-2xl">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
                <p className="mt-4 text-sm font-medium text-slate-700">
                  Loading dashboard data...
                </p>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
        <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6">
          {/* ============================================================================
            NAVBAR COMPONENT (INLINED)
          ============================================================================ */}
          <header className="group mb-6 flex flex-col gap-4 rounded-2xl bg-white/95 p-5 shadow-lg shadow-slate-200/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <button
                onClick={openSidebar}
                className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition-all duration-200 hover:bg-slate-50 hover:shadow-md lg:hidden"
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  HR Dashboard
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Welcome back, John Doe!
                </p>
              </div>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors duration-200 group-focus-within:text-blue-500" />
              <input
                type="text"
                placeholder="Search applicants, jobs..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none ring-blue-500 transition-all duration-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </header>

          {/* ============================================================================
            METRIC CARDS (INLINED)
          ============================================================================ */}
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric, idx) => {
              const Icon = metric.icon;
              return (
                <div
                  key={metric.label}
                  className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {/* Animated gradient border on hover */}
                  <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-blue-500/20 blur-xl" />
                  </div>

                  <div className="relative flex items-center justify-between">
                    <div className="grid h-12 w-12 place-content-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600 shadow-sm">
                      <ArrowUpRight className="h-3 w-3" />
                      {metric.trend}
                    </span>
                  </div>

                  <p className="relative mt-5 text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    {metric.value}
                  </p>
                  <p className="relative mt-1 text-sm font-medium text-slate-500">
                    {metric.label}
                  </p>
                </div>
              );
            })}
          </section>

          {/* Error Message */}
          {error && (
            <section className="mt-6 animate-shake rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 p-4 shadow-md">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-content-center rounded-full bg-red-100">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            </section>
          )}

          {/* ============================================================================
            MAIN GRID: TABLES + SIDEBAR CARDS
          ============================================================================ */}
          <section className="mt-6 grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1fr)_380px]">
            {/* Left Column: Tables */}
            <div className="space-y-6">
              {/* Job Overview Table (INLINED) */}
              <section className="group overflow-hidden rounded-2xl bg-white shadow-lg shadow-slate-200/50 transition-all duration-300 hover:shadow-xl">
                <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Job overview
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/50">
                        <th className="px-6 py-4 font-semibold text-slate-600">
                          Job Role
                        </th>
                        <th className="px-6 py-4 font-semibold text-slate-600">
                          Company name
                        </th>
                        <th className="px-6 py-4 font-semibold text-slate-600">
                          Applicants
                        </th>
                        <th className="px-6 py-4 font-semibold text-slate-600">
                          Seniority level
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobOverviewData.map((row, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-slate-100 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent"
                        >
                          <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-700">
                            {row.jobRole}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                            {row.companyName}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span className="inline-flex items-center justify-center rounded-full bg-blue-50 px-2.5 py-0.5 text-sm font-semibold text-blue-700">
                              {row.applicants}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                            {row.seniorityLevel}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Recent Applicants Table (INLINED) */}
              <section className="group overflow-hidden rounded-2xl bg-white shadow-lg shadow-slate-200/50 transition-all duration-300 hover:shadow-xl">
                <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Recent applicants
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/50">
                        <th className="px-6 py-4 font-semibold text-slate-600">
                          Applicants
                        </th>
                        <th className="px-6 py-4 font-semibold text-slate-600">
                          Job Role
                        </th>
                        <th className="px-6 py-4 font-semibold text-slate-600">
                          Experience
                        </th>
                        <th className="px-6 py-4 font-semibold text-slate-600">
                          Skills
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentApplicantsData.map((row, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-slate-100 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent"
                        >
                          <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-700">
                            {row.applicants}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                            {row.jobRole}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                            {row.experience}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                            {row.skills}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            {/* Right Column: AI Shortlist + Recent Manual List */}
            <aside className="space-y-6">
              {/* AI Shortlist Card (INLINED with CandidateCards) */}
              <section className="group overflow-hidden rounded-2xl bg-white shadow-lg shadow-slate-200/50 transition-all duration-300 hover:shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
                  <h3 className="text-lg font-semibold text-slate-800">
                    AI Shortlist
                  </h3>
                  <span className="inline-flex animate-pulse items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-3 py-1 text-xs font-semibold text-white shadow-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    Live
                  </span>
                </div>
                <div className="p-5 space-y-3">
                  {shortlistCandidates.length ? (
                    shortlistCandidates.map((candidate, idx) => {
                      const initials = candidate.name
                        .split(' ')
                        .map((part) => part[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase();

                      return (
                        <div
                          key={candidate.key}
                          className="group/card rounded-xl border border-blue-100 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                          style={{ animationDelay: `${idx * 100}ms` }}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="grid h-11 w-11 place-content-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-md transition-all duration-300 group-hover/card:scale-105">
                                {initials}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-800">
                                  {candidate.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {candidate.role}
                                </p>
                              </div>
                            </div>
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-600 shadow-sm transition-all duration-300 group-hover/card:bg-emerald-100">
                              <TrendingUp className="h-3.5 w-3.5" />
                              {candidate.percent}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-xl bg-slate-50 p-8 text-center">
                      <p className="text-sm text-slate-500">
                        No AI screening results available yet.
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* Recent Manual List Card */}
              <section className="group overflow-hidden rounded-2xl bg-white shadow-lg shadow-slate-200/50 transition-all duration-300 hover:shadow-xl">
                <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Recent manual list
                  </h3>
                </div>
                <div className="p-5 space-y-3">
                  {recentImports.length ? (
                    recentImports.map((entry, idx) => (
                      <div
                        key={entry.label}
                        className="group/item flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 text-left transition-all duration-200 hover:-translate-x-0.5 hover:border-blue-200 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent hover:shadow-md"
                        style={{ transitionDelay: `${idx * 50}ms` }}
                      >
                        <div className="grid h-9 w-9 place-content-center rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 transition-all duration-200 group-hover/item:scale-110">
                          <FileText className="h-4 w-4" />
                        </div>
                        <span className="flex-1 text-sm font-medium text-slate-700">
                          {entry.label}
                        </span>
                        <div className="opacity-0 transition-opacity duration-200 group-hover/item:opacity-100">
                          <button className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                            <Download className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl bg-slate-50 p-8 text-center">
                      <p className="text-sm text-slate-500">
                        No manual uploads yet.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </aside>
          </section>
        </div>
    </AppShell>
  );
}

// Add missing AlertCircle import at top
const AlertCircle = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const Download = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
