'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Brain,
  TrendingUp,
  Users,
  Briefcase,
  Clock,
  Calendar,
  ChevronRight,
  Plus,
  RefreshCw,
  Search,
  X,
  AlertCircle,
  Loader2,
  Star,
  CheckCircle,
  XCircle,
  Eye,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Zap,
  Sparkles,
  Award,
  Target,
  FileText,
  Menu,
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronDown,
  Filter,
  Download,
  Share2,
  MoreVertical,
  Bell,
  Home,
  FileStack,
  ListChecks,
  Globe,
  Cpu,
  Cloud,
  Wifi,
  Battery,
  Volume2,
  Mic,
  Camera,
  Video,
  Music,
  Gamepad,
  Book,
  Coffee,
  Gift,
  Sun,
  Moon,
  CloudRain,
  Wind,
  Thermometer,
  Droplet,
  Compass,
  Map,
  Flag,
  Anchor,
  Umbrella,
  Snowflake,
  Flame,
  Leaf,
  Heart,
  Smile,
  Frown,
  Meh,
} from 'lucide-react';
import clsx from 'clsx';
import { AppShell, useAppShell } from '@/app/components/app-shell';
import {
  LineChart as ReLineChart,
  Line,
  BarChart as ReBarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  Scatter,
} from 'recharts';

// ============================================================================
// API CONFIGURATION
// ============================================================================

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || 'https://umurava-jaq4.onrender.com';

// ============================================================================
// TYPES (Based on AI Documentation)
// ============================================================================

type Job = {
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

type RankedCandidate = {
  candidateId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    headline?: string;
    skills?: Array<{ name: string }>;
  };
  rank: number;
  score: number;
  decision: 'Selected' | 'Consider' | 'Reject';
  explanation: string;
  strengths: string[];
  concerns: string[];
  weaknesses: string[];
  missingRequirements: string[];
  confidence: number;
  scores: {
    skillScore: number;
    experienceScore: number;
    educationScore: number;
    projectScore: number;
    overallScore: number;
  };
};

type ScreeningResult = {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    department: string;
    jobId: string;
  };
  jobExternalId: string;
  topN: number;
  customPrompt?: string;
  rankedCandidates: RankedCandidate[];
  usedGemini: boolean;
  rawModelOutput?: string;
  createdAt: string;
  updatedAt: string;
};

// ============================================================================
// API CALL FUNCTIONS
// ============================================================================

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.text().catch(() => 'Unknown error');
    throw new Error(`API Error ${response.status}: ${error}`);
  }

  return response.json() as Promise<T>;
}

// Get all jobs
async function getAllJobs(): Promise<Job[]> {
  return request<Job[]>('/jobs');
}

// Get all screenings (AI analyses)
async function getAllScreenings(): Promise<ScreeningResult[]> {
  return request<ScreeningResult[]>('/ai/screenings');
}

// Trigger new AI analysis
async function triggerAIRanking(jobId: string, topN?: number, customPrompt?: string): Promise<ScreeningResult> {
  return request<ScreeningResult>('/ai/rank', {
    method: 'POST',
    body: JSON.stringify({
      jobId,
      topN: topN || 10,
      customPrompt: customPrompt || '',
    }),
  });
}

// ============================================================================
// SIDEBAR COMPONENT (STANDARDIZED)
// ============================================================================

const SidebarComponent = ({ sidebarOpen, setSidebarOpen }: { sidebarOpen: boolean; setSidebarOpen: (open: boolean) => void }) => {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      <div
        onClick={() => setSidebarOpen(false)}
        className={clsx(
          'fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-[2px] transition-all duration-300 lg:hidden',
          sidebarOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none',
        )}
      />

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-80 overflow-hidden shadow-2xl transition-all duration-300 ease-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Background Image */}
        <div className="absolute inset-0 bg-[url('/images/Sidebar.jpg')] bg-cover bg-center bg-no-repeat" />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/95 via-indigo-950/90 to-slate-950/95" />

        {/* Sidebar Content */}
        <div className="relative flex h-full flex-col p-6">
          {/* Logo & Brand */}
          <div className="group mb-8 flex items-center justify-between rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md transition-all duration-300 hover:bg-white/15">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-content-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 text-lg font-bold text-white shadow-lg shadow-blue-900/40 ring-1 ring-white/30 transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
                HR
              </div>
              <div>
                <h1 className="text-base font-bold tracking-wide text-white">
                  HR Dashboard
                </h1>
                <p className="text-xs text-blue-200/80">
                  Intelligence Suite
                </p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-xl border border-white/20 bg-white/15 p-2 text-white/80 transition-all duration-200 hover:bg-white/25 hover:text-white lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {[
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
              { key: 'shortlist', label: 'Shortlist', icon: ListChecks, href: '/shortlist' },
              { key: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
              { key: 'logout', label: 'Logout', icon: LogOut, href: '/logout' },
              { key: 'chat', label: 'Chat', icon: FileText, href: '/chat' }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = item.href
                ? pathname === item.href || pathname.startsWith(`${item.href}/`)
                : false;

              const itemClassName = clsx(
                'group relative flex w-full items-center gap-3 overflow-hidden rounded-xl border px-4 py-3 text-left text-sm backdrop-blur-sm transition-all duration-200',
                isActive
                  ? 'border-cyan-400/40 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-white shadow-lg shadow-cyan-900/30'
                  : 'border-white/10 bg-white/5 text-blue-50/80 hover:border-white/20 hover:bg-white/10 hover:text-white',
              );

              const itemContent = (
                <>
                  {/* Arc-shaped active indicator */}
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
                </>
              );

              if (item.href) {
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={itemClassName}
                  >
                    {itemContent}
                  </Link>
                );
              }

              return (
                <button
                  key={item.key}
                  type="button"
                  className={itemClassName}
                >
                  {itemContent}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="mt-6 rounded-2xl border border-white/15 bg-gradient-to-br from-white/10 to-white/5 p-4 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
              <p className="text-xs font-semibold text-emerald-300">
                AI Assistant Active
              </p>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-blue-100/80">
              Use Analysis and Shortlist to review live candidate rankings from
              the backend.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

const StatusBadge = ({ usedGemini }: { usedGemini: boolean }) => {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
      usedGemini
        ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md'
        : 'bg-amber-100 text-amber-700 border border-amber-200'
    )}>
      {usedGemini ? (
        <>
          <Brain className="h-3 w-3" />
          AI Powered
        </>
      ) : (
        <>
          <Cpu className="h-3 w-3" />
          Fallback Mode
        </>
      )}
    </span>
  );
};

const DecisionBadge = ({ decision }: { decision: string }) => {
  const config: Record<string, { label: string; color: string; bg: string }> = {
    Selected: { label: 'Selected', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    Consider: { label: 'Consider', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    Reject: { label: 'Reject', color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  };

  const { label, color, bg } = config[decision] || config.Consider;

  return (
    <span className={clsx('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium', bg, color)}>
      {label}
    </span>
  );
};

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function AnalysisPage() {
  const router = useRouter();
  const { openSidebar } = useAppShell();
  const [screenings, setScreenings] = useState<ScreeningResult[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showNewAnalysisModal, setShowNewAnalysisModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [topN, setTopN] = useState<number>(10);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScreening, setSelectedScreening] = useState<ScreeningResult | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Load data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [screeningsData, jobsData] = await Promise.all([
        getAllScreenings(),
        getAllJobs(),
      ]);
      setScreenings(screeningsData);
      setJobs(jobsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analysis data');
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle new analysis - PROPER REDIRECT
  const handleRunAIShortlist = async () => {
    if (!selectedJobId) {
      setError('Please select a job to analyze');
      return;
    }

    setAnalysisLoading(true);
    try {
      // Find the selected job to pass context
      const selectedJob = jobs.find(job => job.jobId === selectedJobId);
      
      if (!selectedJob) {
        throw new Error('Selected job not found');
      }

      // Store job in sessionStorage for the analysis page
      sessionStorage.setItem('selectedJob', JSON.stringify({
        jobId: selectedJob.jobId,
        title: selectedJob.title,
        department: selectedJob.department,
        location: selectedJob.location,
      }));
      
      sessionStorage.setItem('analysisTopN', topN.toString());
      sessionStorage.setItem('analysisCustomPrompt', customPrompt);

      // Redirect to the analysis chat page with jobId
      window.location.href = `/analyse?jobId=${selectedJobId}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start analysis');
      setAnalysisLoading(false);
    }
  };

  // View existing screening details
  const viewScreeningDetails = (screening: ScreeningResult) => {
    setSelectedScreening(screening);
    setShowDetailsModal(true);
  };

  // Navigate to existing analysis chat
  const continueAnalysis = (screening: ScreeningResult) => {
    const jobId = typeof screening.jobId === 'object' ? screening.jobId.jobId : screening.jobExternalId;
    sessionStorage.setItem('selectedJob', JSON.stringify({
      jobId: jobId,
      title: typeof screening.jobId === 'object' ? screening.jobId.title : 'Unknown Job',
      department: typeof screening.jobId === 'object' ? screening.jobId.department : 'Unknown',
    }));
    sessionStorage.setItem('screeningId', screening._id);
    window.location.href = `/analyse?jobId=${jobId}&screeningId=${screening._id}`;
  };

  // Filter screenings
  const filteredScreenings = screenings.filter((s) => {
    const jobTitle = typeof s.jobId === 'object' ? s.jobId.title : 'Unknown Job';
    const jobDept = typeof s.jobId === 'object' ? s.jobId.department : 'Unknown';
    return jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jobDept.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Analytics Data for Charts
  const screeningsOverTime = screenings.map(s => ({
    date: new Date(s.createdAt).toLocaleDateString(),
    candidates: s.rankedCandidates.length,
    usedGemini: s.usedGemini ? 'AI' : 'Fallback',
  })).reverse();

  const decisionDistribution = [
    { name: 'Selected', value: screenings.reduce((acc, s) => acc + s.rankedCandidates.filter(c => c.decision === 'Selected').length, 0) },
    { name: 'Consider', value: screenings.reduce((acc, s) => acc + s.rankedCandidates.filter(c => c.decision === 'Consider').length, 0) },
    { name: 'Reject', value: screenings.reduce((acc, s) => acc + s.rankedCandidates.filter(c => c.decision === 'Reject').length, 0) },
  ];

  const geminiUsage = [
    { name: 'AI Powered', value: screenings.filter(s => s.usedGemini).length, color: '#10b981' },
    { name: 'Fallback Mode', value: screenings.filter(s => !s.usedGemini).length, color: '#f59e0b' },
  ];

  const topJobsByCandidates = screenings
    .map(s => ({
      name: typeof s.jobId === 'object' ? s.jobId.title : 'Unknown',
      candidates: s.rankedCandidates.length,
      selected: s.rankedCandidates.filter(c => c.decision === 'Selected').length,
    }))
    .sort((a, b) => b.candidates - a.candidates)
    .slice(0, 5);

  const averageScores = screenings.map(s => ({
    name: typeof s.jobId === 'object' ? s.jobId.title.substring(0, 20) : 'Unknown',
    score: s.rankedCandidates.reduce((acc, c) => acc + c.score, 0) / (s.rankedCandidates.length || 1),
  })).slice(0, 6);

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

  // Statistics
  const totalAnalyses = screenings.length;
  const totalCandidatesAnalyzed = screenings.reduce((acc, s) => acc + s.rankedCandidates.length, 0);
  const totalSelected = screenings.reduce((acc, s) => acc + s.rankedCandidates.filter(c => c.decision === 'Selected').length, 0);
  const totalConsider = screenings.reduce((acc, s) => acc + s.rankedCandidates.filter(c => c.decision === 'Consider').length, 0);
  const totalRejected = screenings.reduce((acc, s) => acc + s.rankedCandidates.filter(c => c.decision === 'Reject').length, 0);
  const aiUsageRate = screenings.filter(s => s.usedGemini).length;
  const averageConfidence = screenings.reduce((acc, s) => 
    acc + s.rankedCandidates.reduce((a, c) => a + (c.confidence || 0), 0) / (s.rankedCandidates.length || 1), 0
  ) / (screenings.length || 1);

  if (loading && screenings.length === 0) {
    return (
      <AppShell>
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            <p className="mt-4 text-sm text-slate-600">Loading analysis data...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
        <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-white/95 p-5 shadow-lg backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                AI Analysis Dashboard
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Review AI-powered candidate screenings and analytics
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={openSidebar}
                className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-50 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>

              <button
                onClick={refreshData}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 hover:shadow-md"
              >
                <RefreshCw className={clsx('h-4 w-4', refreshing && 'animate-spin')} />
                Refresh
              </button>

              <button
                onClick={() => setShowNewAnalysisModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg"
              >
                <Brain className="h-4 w-4" />
                New Analysis
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
              <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Stats Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            <div className="rounded-xl bg-white p-4 shadow-md transition-all hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <span className="text-xl font-bold text-slate-800">{totalAnalyses}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">Total Analyses</p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-md transition-all hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
                  <Users className="h-4 w-4" />
                </div>
                <span className="text-xl font-bold text-slate-800">{totalCandidatesAnalyzed}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">Candidates Analyzed</p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-md transition-all hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <span className="text-xl font-bold text-slate-800">{totalSelected}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">Selected</p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-md transition-all hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
                  <Clock className="h-4 w-4" />
                </div>
                <span className="text-xl font-bold text-slate-800">{totalConsider}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">Consider</p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-md transition-all hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-purple-100 p-2 text-purple-600">
                  <Brain className="h-4 w-4" />
                </div>
                <span className="text-xl font-bold text-slate-800">{aiUsageRate}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">AI Analyses</p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-md transition-all hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600">
                  <Target className="h-4 w-4" />
                </div>
                <span className="text-xl font-bold text-slate-800">{Math.round(averageConfidence)}%</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">Avg Confidence</p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Screening Over Time */}
            <div className="rounded-2xl bg-white p-5 shadow-md">
              <h3 className="mb-4 text-base font-semibold text-slate-800">Screening Activity Over Time</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={screeningsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="candidates" stroke="#3b82f6" fill="#93c5fd" name="Candidates" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Decision Distribution */}
            <div className="rounded-2xl bg-white p-5 shadow-md">
              <h3 className="mb-4 text-base font-semibold text-slate-800">Decision Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <RePieChart>
                  <Pie
                    data={decisionDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(((percent ?? 0) * 100)).toFixed(0)}%`}
                  >
                    {decisionDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RePieChart>
              </ResponsiveContainer>
            </div>

            {/* Gemini Usage */}
            <div className="rounded-2xl bg-white p-5 shadow-md">
              <h3 className="mb-4 text-base font-semibold text-slate-800">AI vs Fallback Usage</h3>
              <ResponsiveContainer width="100%" height={250}>
                <RePieChart>
                  <Pie
                    data={geminiUsage}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(((percent ?? 0) * 100)).toFixed(0)}%`}
                  >
                    {geminiUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RePieChart>
              </ResponsiveContainer>
            </div>

            {/* Top Jobs by Candidates */}
            <div className="rounded-2xl bg-white p-5 shadow-md">
              <h3 className="mb-4 text-base font-semibold text-slate-800">Top Jobs by Candidates</h3>
              <ResponsiveContainer width="100%" height={250}>
                <ReBarChart data={topJobsByCandidates}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="candidates" fill="#3b82f6" name="Total Candidates" />
                  <Bar dataKey="selected" fill="#10b981" name="Selected" />
                </ReBarChart>
              </ResponsiveContainer>
            </div>

            {/* Average Scores */}
            <div className="rounded-2xl bg-white p-5 shadow-md lg:col-span-2">
              <h3 className="mb-4 text-base font-semibold text-slate-800">Average Match Scores by Job</h3>
              <ResponsiveContainer width="100%" height={300}>
                <ReBarChart data={averageScores} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" width={150} />
                  <Tooltip formatter={(value) => `${Math.round(value as number)}%`} />
                  <Bar dataKey="score" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search analyses by job title or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Screenings List */}
          <div className="space-y-4">
            {filteredScreenings.length === 0 ? (
              <div className="rounded-2xl bg-white p-12 text-center shadow-lg">
                <Brain className="mx-auto h-16 w-16 text-slate-300" />
                <h3 className="mt-4 text-lg font-semibold text-slate-700">No Analyses Yet</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Click "New Analysis" to start screening candidates with AI
                </p>
                <button
                  onClick={() => setShowNewAnalysisModal(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700"
                >
                  <Plus className="h-4 w-4" />
                  Start Your First Analysis
                </button>
              </div>
            ) : (
              filteredScreenings.map((screening) => {
                const jobTitle = typeof screening.jobId === 'object' ? screening.jobId.title : 'Unknown Job';
                const jobDept = typeof screening.jobId === 'object' ? screening.jobId.department : 'Unknown';
                const selected = screening.rankedCandidates.filter(c => c.decision === 'Selected').length;
                const consider = screening.rankedCandidates.filter(c => c.decision === 'Consider').length;
                const rejected = screening.rankedCandidates.filter(c => c.decision === 'Reject').length;
                const avgScore = screening.rankedCandidates.reduce((acc, c) => acc + c.score, 0) / (screening.rankedCandidates.length || 1);

                return (
                  <div
                    key={screening._id}
                    className="group cursor-pointer rounded-2xl bg-white p-5 shadow-md transition-all hover:shadow-xl"
                    onClick={() => viewScreeningDetails(screening)}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                            <Briefcase className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-800">{jobTitle}</h3>
                            <p className="text-sm text-slate-500">{jobDept}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        <div className="text-center">
                          <p className="text-xl font-bold text-slate-800">{screening.rankedCandidates.length}</p>
                          <p className="text-xs text-slate-500">Candidates</p>
                        </div>

                        <div className="text-center">
                          <p className="text-xl font-bold text-emerald-600">{selected}</p>
                          <p className="text-xs text-slate-500">Selected</p>
                        </div>

                        <div className="text-center">
                          <p className="text-xl font-bold text-amber-600">{consider}</p>
                          <p className="text-xs text-slate-500">Consider</p>
                        </div>

                        <div className="text-center">
                          <p className="text-xl font-bold text-blue-600">{Math.round(avgScore)}%</p>
                          <p className="text-xs text-slate-500">Match</p>
                        </div>

                        <StatusBadge usedGemini={screening.usedGemini} />

                        <div className="flex items-center gap-1 text-slate-400">
                          <Calendar className="h-4 w-4" />
                          <span className="text-xs">
                            {new Date(screening.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            continueAnalysis(screening);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          Continue
                        </button>

                        <ChevronRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4">
                      <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="bg-emerald-500 transition-all"
                          style={{ width: `${(selected / screening.rankedCandidates.length) * 100}%` }}
                        />
                        <div
                          className="bg-amber-500 transition-all"
                          style={{ width: `${(consider / screening.rankedCandidates.length) * 100}%` }}
                        />
                        <div
                          className="bg-red-500 transition-all"
                          style={{ width: `${(rejected / screening.rankedCandidates.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* AI Insights Section */}
          {screenings.length > 0 && (
            <div className="mt-8 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">AI Insights</h3>
                  </div>
                  <p className="mt-2 text-sm text-blue-100">
                    Based on {totalAnalyses} analyses across {new Set(screenings.map(s => typeof s.jobId === 'object' ? s.jobId._id : s.jobExternalId)).size} jobs,
                    you've identified {totalSelected} top candidates with an average match score of {Math.round(averageConfidence)}%.
                  </p>
                  <p className="mt-1 text-sm text-blue-100">
                    AI was used for {aiUsageRate} out of {totalAnalyses} analyses ({Math.round((aiUsageRate / totalAnalyses) * 100)}% success rate).
                  </p>
                </div>
                <Zap className="h-8 w-8 text-blue-200" />
              </div>
            </div>
          )}
        </div>

      {/* ============================================================================
        NEW ANALYSIS MODAL
      ============================================================================ */}
      {showNewAnalysisModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-bold text-slate-800">New AI Analysis</h2>
              </div>
              <button
                onClick={() => {
                  setShowNewAnalysisModal(false);
                  setSelectedJobId('');
                  setCustomPrompt('');
                  setTopN(10);
                }}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Job to Analyze *
                </label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                >
                  <option value="">-- Choose a job --</option>
                  {jobs.map((job) => (
                    <option key={job._id} value={job.jobId}>
                      {job.title} - {job.department} ({job.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Top N Candidates (1-20)
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={topN}
                  onChange={(e) => setTopN(parseInt(e.target.value) || 10)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Custom Prompt (Optional)
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={3}
                  placeholder="E.g., Focus on candidates with strong leadership skills and experience in fintech..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                />
              </div>

              <div className="rounded-xl bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">What happens next?</p>
                    <ul className="mt-2 space-y-1 text-xs text-blue-700">
                      <li>• AI reviews all candidates linked to this job</li>
                      <li>• Matches skills and experience with job requirements</li>
                      <li>• Generates ranked list with Selected/Consider/Reject decisions</li>
                      <li>• Provides detailed reasoning for each candidate</li>
                      <li>• You can continue the conversation in chat</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowNewAnalysisModal(false);
                    setSelectedJobId('');
                    setCustomPrompt('');
                    setTopN(10);
                  }}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRunAIShortlist}
                  disabled={analysisLoading || !selectedJobId}
                  className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
                >
                  {analysisLoading ? (
                    <>
                      <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 inline h-4 w-4" />
                      Start Analysis
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================
        SCREENING DETAILS MODAL
      ============================================================================ */}
      {showDetailsModal && selectedScreening && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white p-5">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {typeof selectedScreening.jobId === 'object' ? selectedScreening.jobId.title : 'Job Analysis'}
                </h2>
                <p className="text-sm text-slate-500">
                  {typeof selectedScreening.jobId === 'object' ? selectedScreening.jobId.department : ''}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge usedGemini={selectedScreening.usedGemini} />
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-xl bg-slate-50">
                  <p className="text-2xl font-bold text-slate-800">{selectedScreening.rankedCandidates.length}</p>
                  <p className="text-xs text-slate-500">Total Candidates</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-emerald-50">
                  <p className="text-2xl font-bold text-emerald-600">
                    {selectedScreening.rankedCandidates.filter(c => c.decision === 'Selected').length}
                  </p>
                  <p className="text-xs text-slate-500">Selected</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-amber-50">
                  <p className="text-2xl font-bold text-amber-600">
                    {selectedScreening.rankedCandidates.filter(c => c.decision === 'Consider').length}
                  </p>
                  <p className="text-xs text-slate-500">Consider</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-red-50">
                  <p className="text-2xl font-bold text-red-600">
                    {selectedScreening.rankedCandidates.filter(c => c.decision === 'Reject').length}
                  </p>
                  <p className="text-xs text-slate-500">Rejected</p>
                </div>
              </div>

              {/* Ranked Candidates Table */}
              <div>
                <h3 className="mb-3 text-lg font-semibold text-slate-800">Ranked Candidates</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="px-3 py-2 text-left">Rank</th>
                        <th className="px-3 py-2 text-left">Candidate</th>
                        <th className="px-3 py-2 text-left">Score</th>
                        <th className="px-3 py-2 text-left">Decision</th>
                        <th className="px-3 py-2 text-left">Confidence</th>
                        <th className="px-3 py-2 text-left">Skills</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedScreening.rankedCandidates.slice(0, 10).map((candidate, idx) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-3 py-3 font-medium">{idx + 1}</td>
                          <td className="px-3 py-3">
                            <div>
                              <p className="font-medium">
                                {candidate.candidateId.firstName} {candidate.candidateId.lastName}
                              </p>
                              <p className="text-xs text-slate-500">{candidate.candidateId.email}</p>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <span className="font-semibold text-blue-600">{Math.round(candidate.score)}%</span>
                          </td>
                          <td className="px-3 py-3">
                            <DecisionBadge decision={candidate.decision} />
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-slate-600">{Math.round(candidate.confidence * 100)}%</span>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex flex-wrap gap-1">
                              {candidate.strengths.slice(0, 2).map((s, i) => (
                                <span key={i} className="rounded-full bg-green-100 px-1.5 py-0.5 text-xs text-green-700">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Continue Button */}
              <div className="flex justify-end pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    continueAnalysis(selectedScreening);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:from-blue-700 hover:to-indigo-700"
                >
                  <MessageSquare className="h-4 w-4" />
                  Continue Analysis in Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

// Missing MessageSquare icon
const MessageSquare = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
