'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Briefcase,
  LayoutDashboard,
  Users,
  FileStack,
  BarChart3,
  ListChecks,
  Settings,
  LogOut,
  X,
  Menu,
  Search,
  MapPin,
  Calendar,
  Sparkles,
  Eye,
  UserCheck,
  Award,
  Code,
  Building2,
  GraduationCap,
  Loader2,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  Star,
  Trophy,
  Brain,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Download,
  Filter,
  Clock,
  Target,
  Shield,
  Zap,
  BarChart,
  PieChart,
  Activity,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';
import clsx from 'clsx';
import { AppShell, useAppShell } from '@/app/components/app-shell';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || 'https://umurava-jaq4.onrender.com';

// ============================================================================
// API TYPES
// ============================================================================

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
  isOpen: boolean;
  createdAt?: string;
};

export type Candidate = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  headline?: string;
  skills?: Array<{ name: string; level?: string; yearsOfExperience?: number }>;
  experience?: Array<{
    company: string;
    role: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
  }>;
};

export type RankedCandidate = {
  candidateId: Candidate | string;
  rank: number;
  score: number;
  explanation: string;
  strengths: string[];
  concerns: string[];
  weaknesses: string[];
  missingRequirements: string[];
  decision: 'Selected' | 'Consider' | 'Reject';
  confidence: number;
  scores?: {
    skillScore: number;
    experienceScore: number;
    educationScore: number;
    projectScore: number;
    overallScore: number;
  };
};

export type ScreeningResult = {
  _id: string;
  jobId: string;
  jobExternalId: string;
  topN: number;
  customPrompt?: string;
  rankedCandidates: RankedCandidate[];
  usedGemini: boolean;
  rawModelOutput?: string;
  createdAt: string;
  updatedAt: string;
};

function getCandidateIdValue(candidate: RankedCandidate): string | null {
  if (typeof candidate.candidateId === 'string' && candidate.candidateId.trim()) {
    return candidate.candidateId;
  }

  if (
    typeof candidate.candidateId === 'object' &&
    candidate.candidateId !== null &&
    '_id' in candidate.candidateId &&
    typeof candidate.candidateId._id === 'string'
  ) {
    return candidate.candidateId._id;
  }

  return null;
}

function getCandidateFromRankedCandidate(
  candidate: RankedCandidate,
  candidateLookup: Record<string, Candidate>
): Candidate | null {
  const embeddedCandidate =
    typeof candidate.candidateId === 'object' && candidate.candidateId !== null
      ? (candidate.candidateId as Candidate)
      : null;

  const candidateId = getCandidateIdValue(candidate);
  const lookupCandidate = candidateId ? candidateLookup[candidateId] : undefined;

  if (!embeddedCandidate) return lookupCandidate || null;

  const hasIdentity =
    Boolean(embeddedCandidate.firstName?.trim()) ||
    Boolean(embeddedCandidate.lastName?.trim()) ||
    Boolean(embeddedCandidate.email?.trim());

  if (hasIdentity) return embeddedCandidate;

  return lookupCandidate || embeddedCandidate;
}

function getCandidateLabel(
  candidate: RankedCandidate,
  index: number,
  candidateLookup: Record<string, Candidate>
): string {
  const candidateData = getCandidateFromRankedCandidate(candidate, candidateLookup);
  const fullName = [candidateData?.firstName?.trim(), candidateData?.lastName?.trim()]
    .filter(Boolean)
    .join(' ')
    .trim();

  if (fullName) return fullName;
  if (candidateData?.email) return candidateData.email;
  if (typeof candidate.candidateId === 'string' && candidate.candidateId.trim()) return `Candidate ${index + 1}`;
  return `Candidate ${index + 1}`;
}

function getRankedCandidateKey(
  candidate: RankedCandidate,
  index: number,
  candidateLookup: Record<string, Candidate>
): string {
  const candidateData = getCandidateFromRankedCandidate(candidate, candidateLookup);
  const uniquePart =
    candidateData?._id ??
    candidateData?.email ??
    getCandidateIdValue(candidate) ??
    'candidate';
  return `${uniquePart}-${candidate.rank}-${index}`;
}

function hydrateScreeningCandidates(
  screening: ScreeningResult,
  candidateLookup: Record<string, Candidate>
): ScreeningResult {
  return {
    ...screening,
    rankedCandidates: screening.rankedCandidates.map((candidate) => {
      const resolvedCandidate = getCandidateFromRankedCandidate(candidate, candidateLookup);
      return resolvedCandidate
        ? { ...candidate, candidateId: resolvedCandidate }
        : candidate;
    }),
  };
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API ${response.status} at ${path}`);
  }

  return response.json() as Promise<T>;
}

function getJobById(jobId: string) {
  return request<Job>(`/jobs/${jobId}`);
}

function getAIScreenings() {
  return request<ScreeningResult[]>(`/ai/screenings`);
}

function getCandidates() {
  return request<Candidate[]>(`/candidates`);
}

function runAIRank(payload: {
  jobId: string;
  topN?: number;
  customPrompt?: string;
  candidateIds?: string[];
}) {
  return request<ScreeningResult>(`/ai/rank`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ============================================================================
// RANKED CANDIDATE CARD COMPONENT
// ============================================================================

interface RankedCandidateCardProps {
  candidate: RankedCandidate;
  index: number;
  candidateLookup: Record<string, Candidate>;
}

function RankedCandidateCard({ candidate, index, candidateLookup }: RankedCandidateCardProps) {
  const [expanded, setExpanded] = useState(false);
  const candidateData = getCandidateFromRankedCandidate(candidate, candidateLookup);
  
  const decisionColors = {
    Selected: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Consider: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    Reject: 'bg-red-50 text-red-700 border-red-200',
  };

  const decisionIcons = {
    Selected: CheckCircle,
    Consider: HelpCircle,
    Reject: XCircle,
  };

  const DecisionIcon = decisionIcons[candidate.decision];
  const medalColors = ['from-yellow-500 to-amber-600', 'from-gray-400 to-gray-500', 'from-amber-600 to-orange-600'];

  return (
    <div className="group rounded-xl border border-slate-200 bg-white transition-all duration-300 hover:shadow-lg">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {/* Rank Badge */}
            <div className="relative">
              <div className={clsx(
                'grid h-12 w-12 place-content-center rounded-full bg-gradient-to-br text-base font-bold text-white shadow-md',
                medalColors[index] || 'from-blue-500 to-indigo-600'
              )}>
                #{candidate.rank}
              </div>
              {index === 0 && (
                <Trophy className="absolute -right-1 -top-1 h-5 w-5 text-yellow-500" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-800">
                  {candidateData?.firstName} {candidateData?.lastName}
                </h3>
                <span className={clsx(
                  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
                  decisionColors[candidate.decision]
                )}>
                  <DecisionIcon className="h-3 w-3" />
                  {candidate.decision}
                </span>
              </div>
              <p className="text-sm text-slate-500">{candidateData?.email}</p>
              {candidateData?.location && (
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                  <MapPin className="h-3 w-3" />
                  {candidateData.location}
                </p>
              )}
            </div>
          </div>

          {/* Score Circle */}
          <div className="text-center">
            <div className="relative">
              <svg className="h-16 w-16">
                <circle
                  className="text-slate-100"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="transparent"
                  r="28"
                  cx="32"
                  cy="32"
                />
                <circle
                  className="text-emerald-500"
                  strokeWidth="4"
                  strokeDasharray={`${(candidate.score / 100) * 175.9} 175.9`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="28"
                  cx="32"
                  cy="32"
                  transform="rotate(-90 32 32)"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-slate-700">
                {candidate.score}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Score</p>
          </div>
        </div>

        {/* Explanation */}
        <p className="mt-3 text-sm text-slate-600">{candidate.explanation}</p>

        {/* Strengths & Concerns */}
        <div className="mt-3 flex flex-wrap gap-3">
          {candidate.strengths.slice(0, 2).map((strength, idx) => (
            <span key={idx} className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
              <ThumbsUp className="h-3 w-3" />
              {strength}
            </span>
          ))}
          {candidate.concerns.slice(0, 2).map((concern, idx) => (
            <span key={idx} className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-700">
              <ThumbsDown className="h-3 w-3" />
              {concern}
            </span>
          ))}
        </div>

        {/* Expand Button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-slate-200 py-1.5 text-xs text-slate-500 transition-all hover:bg-slate-50"
        >
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {expanded ? 'Show Less' : 'Show Details'}
        </button>

        {/* Expanded Details */}
        {expanded && (
          <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
            {/* Detailed Scores */}
            {candidate.scores && (
              <div>
                <h4 className="mb-2 text-xs font-semibold text-slate-700">Detailed Scores</h4>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {Object.entries(candidate.scores).map(([key, value]) => (
                    <div key={key} className="rounded-lg bg-slate-50 p-2 text-center">
                      <p className="text-xs text-slate-500 capitalize">{key.replace('Score', '')}</p>
                      <p className="text-lg font-bold text-slate-700">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Strengths */}
            {candidate.strengths.length > 0 && (
              <div>
                <h4 className="mb-1 text-xs font-semibold text-emerald-700">Strengths</h4>
                <ul className="list-inside list-disc space-y-0.5 text-sm text-slate-600">
                  {candidate.strengths.map((strength, idx) => (
                    <li key={idx}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Weaknesses */}
            {candidate.weaknesses.length > 0 && (
              <div>
                <h4 className="mb-1 text-xs font-semibold text-red-700">Areas for Improvement</h4>
                <ul className="list-inside list-disc space-y-0.5 text-sm text-slate-600">
                  {candidate.weaknesses.map((weakness, idx) => (
                    <li key={idx}>{weakness}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Missing Requirements */}
            {candidate.missingRequirements.length > 0 && (
              <div>
                <h4 className="mb-1 text-xs font-semibold text-orange-700">Missing Requirements</h4>
                <ul className="list-inside list-disc space-y-0.5 text-sm text-slate-600">
                  {candidate.missingRequirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Confidence */}
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-2">
              <Brain className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-blue-700">
                AI Confidence: {(candidate.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// RUN AI SCREENING MODAL
// ============================================================================

interface RunAIScreeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: ScreeningResult) => void;
  jobId: string;
  jobTitle: string;
}

function RunAIScreeningModal({ isOpen, onClose, onSuccess, jobId, jobTitle }: RunAIScreeningModalProps) {
  const [topN, setTopN] = useState(5);
  const [customPrompt, setCustomPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await runAIRank({
        jobId,
        topN,
        customPrompt: customPrompt || undefined,
      });
      onSuccess(result);
      onClose();
    } catch (err) {
      setError('Failed to run AI screening. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-content-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
              <Brain className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Run AI Screening</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Job: <span className="font-semibold">{jobTitle}</span>
            </label>
            <p className="text-xs text-slate-500">AI will rank candidates based on job requirements</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Number of candidates to rank (Top N)
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={topN}
              onChange={(e) => setTopN(parseInt(e.target.value) || 5)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Custom Prompt (Optional)
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={3}
              placeholder="e.g., Prioritize candidates with strong backend architecture experience and cloud certifications..."
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-md hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Run Screening'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN ANALYSIS PAGE
// ============================================================================

export default function AnalysisPage() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');
  const { openSidebar } = useAppShell();
  const [job, setJob] = useState<Job | null>(null);
  const [screenings, setScreenings] = useState<ScreeningResult[]>([]);
  const [candidateLookup, setCandidateLookup] = useState<Record<string, Candidate>>({});
  const [currentScreening, setCurrentScreening] = useState<ScreeningResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRunModal, setShowRunModal] = useState(false);
  const [runningScreening, setRunningScreening] = useState(false);

  useEffect(() => {
    if (jobId) {
      loadData();
    } else {
      setError('No job ID provided');
      setLoading(false);
    }
  }, [jobId]);

  async function loadData() {
    if (!jobId) return;
    
    try {
      setLoading(true);
      setError(null);
      const [jobData, screeningsData, candidatesData] = await Promise.all([
        getJobById(jobId),
        getAIScreenings(),
        getCandidates(),
      ]);

      const nextLookup = candidatesData.reduce<Record<string, Candidate>>((acc, candidate) => {
        acc[candidate._id] = candidate;
        return acc;
      }, {});

      const hydratedScreenings = screeningsData.map((screening) =>
        hydrateScreeningCandidates(screening, nextLookup)
      );

      setJob(jobData);
      setCandidateLookup(nextLookup);
      setScreenings(hydratedScreenings);
      
      // Find screening for this job
      const jobScreening = hydratedScreenings.find(s => s.jobExternalId === jobId);
      setCurrentScreening(jobScreening || null);
    } catch (err) {
      setError('Failed to load analysis data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleRunScreening = async (result: ScreeningResult) => {
    const hydratedResult = hydrateScreeningCandidates(result, candidateLookup);
    setCurrentScreening(hydratedResult);
    setScreenings(prev => [hydratedResult, ...prev]);
    setRunningScreening(true);
    setTimeout(() => setRunningScreening(false), 1000);
  };

  // Prepare chart data
  const decisionData = currentScreening ? [
    { name: 'Selected', value: currentScreening.rankedCandidates.filter(c => c.decision === 'Selected').length, color: '#10b981' },
    { name: 'Consider', value: currentScreening.rankedCandidates.filter(c => c.decision === 'Consider').length, color: '#f59e0b' },
    { name: 'Reject', value: currentScreening.rankedCandidates.filter(c => c.decision === 'Reject').length, color: '#ef4444' },
  ] : [];

  const scoreDistribution = currentScreening?.rankedCandidates.map(c => ({
    name: getCandidateLabel(c, c.rank - 1, candidateLookup).split(' ')[0] || `Candidate ${c.rank}`,
    score: c.score,
  })).slice(0, 10) || [];

  const strengthsFrequency = currentScreening?.rankedCandidates
    .flatMap(c => c.strengths)
    .reduce((acc, strength) => {
      acc[strength] = (acc[strength] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const topStrengths = Object.entries(strengthsFrequency || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const concernsFrequency = currentScreening?.rankedCandidates
    .flatMap(c => c.concerns)
    .reduce((acc, concern) => {
      acc[concern] = (acc[concern] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const topConcerns = Object.entries(concernsFrequency || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-screen">
          <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6">
            <div className="mb-6 h-32 animate-pulse rounded-2xl bg-white shadow-card" />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 animate-pulse rounded-xl bg-white shadow-card" />
                <div className="h-96 animate-pulse rounded-xl bg-white shadow-card" />
              </div>
              <div className="space-y-6">
                <div className="h-80 animate-pulse rounded-xl bg-white shadow-card" />
                <div className="h-80 animate-pulse rounded-xl bg-white shadow-card" />
              </div>
            </div>
          </div>
        </div>
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="rounded-2xl bg-white p-8 shadow-2xl">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
            <p className="mt-4 text-sm font-medium text-slate-700">Loading analysis data...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error || !job) {
    return (
      <AppShell>
          <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-center p-4 sm:p-6">
            <div className="rounded-2xl bg-white p-8 text-center shadow-xl">
              <AlertCircle className="mx-auto h-16 w-16 text-red-400" />
              <h2 className="mt-4 text-xl font-bold text-slate-800">Error Loading Page</h2>
              <p className="mt-2 text-slate-600">{error || 'Job not found'}</p>
              <Link
                href="/jobs"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-white hover:from-blue-700 hover:to-indigo-700"
              >
                Back to Jobs
              </Link>
            </div>
          </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
        <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6">
          {/* Header */}
          <header className="group mb-6 flex flex-col gap-4 rounded-2xl bg-white/95 p-5 shadow-lg backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <button onClick={openSidebar} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 lg:hidden">
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    AI Analysis
                  </h1>
                  {currentScreening?.usedGemini && (
                    <span className="flex items-center gap-1 rounded-full bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-700">
                      <Sparkles className="h-3 w-3" />
                      Gemini AI
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {job.title} - AI-powered candidate ranking and insights
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRunModal(true)}
                disabled={runningScreening}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-md hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50"
              >
                {runningScreening ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4" />
                )}
                Run New Screening
              </button>
              <button
                onClick={() => loadData()}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </header>

          {!currentScreening ? (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center">
              <Brain className="h-16 w-16 text-slate-300" />
              <h3 className="mt-4 text-lg font-semibold text-slate-700">No AI Screening Results</h3>
              <p className="mt-1 text-sm text-slate-500">
                Run AI screening to rank candidates for this job
              </p>
              <button
                onClick={() => setShowRunModal(true)}
                className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white"
              >
                <Brain className="h-4 w-4" />
                Run AI Screening
              </button>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
                <div className="rounded-xl bg-white p-4 text-center shadow-md">
                  <p className="text-2xl font-bold text-slate-800">{currentScreening.rankedCandidates.length}</p>
                  <p className="text-xs text-slate-500">Total Ranked</p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-4 text-center shadow-md">
                  <p className="text-2xl font-bold text-emerald-600">
                    {currentScreening.rankedCandidates.filter(c => c.decision === 'Selected').length}
                  </p>
                  <p className="text-xs text-emerald-600">Selected</p>
                </div>
                <div className="rounded-xl bg-yellow-50 p-4 text-center shadow-md">
                  <p className="text-2xl font-bold text-yellow-600">
                    {currentScreening.rankedCandidates.filter(c => c.decision === 'Consider').length}
                  </p>
                  <p className="text-xs text-yellow-600">Consider</p>
                </div>
                <div className="rounded-xl bg-red-50 p-4 text-center shadow-md">
                  <p className="text-2xl font-bold text-red-600">
                    {currentScreening.rankedCandidates.filter(c => c.decision === 'Reject').length}
                  </p>
                  <p className="text-xs text-red-600">Rejected</p>
                </div>
                <div className="rounded-xl bg-purple-50 p-4 text-center shadow-md">
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.round(currentScreening.rankedCandidates.reduce((acc, c) => acc + c.confidence, 0) / currentScreening.rankedCandidates.length * 100)}%
                  </p>
                  <p className="text-xs text-purple-600">Avg Confidence</p>
                </div>
              </div>

              {/* Charts Row */}
              <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Decision Distribution Pie Chart */}
                <div className="rounded-xl bg-white p-5 shadow-md">
                  <h3 className="mb-4 text-sm font-semibold text-slate-700">Decision Distribution</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsPieChart>
                      <Pie
                        data={decisionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? 'Unknown'}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {decisionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>

                {/* Score Distribution Bar Chart */}
                <div className="rounded-xl bg-white p-5 shadow-md">
                  <h3 className="mb-4 text-sm font-semibold text-slate-700">Top Candidate Scores</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsBarChart data={scoreDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="score" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Strengths & Concerns */}
              <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-xl bg-white p-5 shadow-md">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-700">
                    <ThumbsUp className="h-4 w-4" />
                    Top Strengths
                  </h3>
                  <div className="space-y-2">
                    {topStrengths.map(([strength, count]) => (
                      <div key={strength} className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">{strength}</span>
                        <span className="text-sm font-semibold text-emerald-600">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl bg-white p-5 shadow-md">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-red-700">
                    <ThumbsDown className="h-4 w-4" />
                    Top Concerns
                  </h3>
                  <div className="space-y-2">
                    {topConcerns.map(([concern, count]) => (
                      <div key={concern} className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">{concern}</span>
                        <span className="text-sm font-semibold text-red-600">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Custom Prompt if exists */}
              {currentScreening.customPrompt && (
                <div className="mb-6 rounded-xl bg-blue-50 p-4">
                  <h3 className="mb-1 text-sm font-semibold text-blue-700">Custom Screening Criteria</h3>
                  <p className="text-sm text-blue-600">{currentScreening.customPrompt}</p>
                </div>
              )}

              {/* Ranked Candidates List */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-800">Ranked Candidates</h2>
                {currentScreening.rankedCandidates.map((candidate, idx) => (
                  <RankedCandidateCard
                    key={getRankedCandidateKey(candidate, idx, candidateLookup)}
                    candidate={candidate}
                    index={idx}
                    candidateLookup={candidateLookup}
                  />
                ))}
              </div>
            </>
          )}
        </div>

      {/* Run Screening Modal */}
      {showRunModal && (
        <RunAIScreeningModal
          isOpen={showRunModal}
          onClose={() => setShowRunModal(false)}
          onSuccess={handleRunScreening}
          jobId={jobId!}
          jobTitle={job.title}
        />
      )}
    </AppShell>
  );
}
