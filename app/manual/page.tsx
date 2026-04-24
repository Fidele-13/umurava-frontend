'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Upload,
  FileText,
  FileSpreadsheet,
  FileJson,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Eye,
  Trash2,
  Menu,
  LayoutDashboard,
  Settings,
  LogOut,
  BarChart3,
  FileStack,
  Database,
  CloudUpload,
  FolderOpen,
  TrendingUp,
  Users,
  Briefcase,
  Sparkles,
  Calendar,
  Clock,
} from 'lucide-react';
import clsx from 'clsx';
import { AppShell, useAppShell } from '@/app/components/app-shell';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// ============================================================================
// API CONFIGURATION
// ============================================================================

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || 'https://umurava-jaq4.onrender.com';

// ============================================================================
// TYPES (Based on Backend API)
// ============================================================================

type UploadHistoryItem = {
  id: string;
  type: 'candidates-json' | 'candidates-spreadsheet' | 'candidates-resume' | 'jobs-json' | 'jobs-spreadsheet' | 'reparse';
  fileName: string;
  fileSize: number;
  status: 'success' | 'failed';
  count: number;
  jobId: string | null;
  candidateId: string | null;
  message: string;
  createdAt: string;
  updatedAt: string;
};

type UploadStatsResponse = {
  totalUploads: number;
  successfulUploads: number;
  failedUploads: number;
  totalCandidatesAdded: number;
  totalJobsAdded: number;
  uploadsByType: Record<string, number>;
  uploadsOverTime: Array<{ date: string; count: number }>;
};

type Job = {
  _id: string;
  jobId: string;
  title: string;
  department: string;
  location: string;
  description?: string;
};

type Candidate = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
};

type UploadResult = {
  success: boolean;
  message: string;
  data?: any;
  count?: number;
};

// ============================================================================
// API CALL FUNCTIONS
// ============================================================================

// Get upload history from backend
async function getUploadHistory(): Promise<UploadHistoryItem[]> {
  const response = await fetch(`${API_BASE_URL}/upload-history`);
  if (!response.ok) {
    throw new Error(`Failed to fetch upload history: ${response.status}`);
  }
  return response.json();
}

// Get upload statistics from backend
async function getUploadStats(): Promise<UploadStatsResponse> {
  const response = await fetch(`${API_BASE_URL}/upload-stats`);
  if (!response.ok) {
    throw new Error(`Failed to fetch upload stats: ${response.status}`);
  }
  return response.json();
}

// Get all jobs for dropdown
async function getAllJobs(): Promise<Job[]> {
  const response = await fetch(`${API_BASE_URL}/jobs`);
  if (!response.ok) {
    throw new Error(`Failed to fetch jobs: ${response.status}`);
  }
  return response.json();
}

// Get all candidates for reparse dropdown
async function getAllCandidates(): Promise<Candidate[]> {
  const response = await fetch(`${API_BASE_URL}/candidates`);
  if (!response.ok) {
    throw new Error(`Failed to fetch candidates: ${response.status}`);
  }
  return response.json();
}

// ============================================================================
// UPLOAD ENDPOINTS (These now automatically create log records)
// ============================================================================

async function uploadCandidatesJSON(file: File, jobId?: string): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  if (jobId) formData.append('jobId', jobId);

  const response = await fetch(`${API_BASE_URL}/candidates/upload/json`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    return { success: false, message: `Upload failed: ${error}` };
  }

  const data = await response.json();
  return {
    success: true,
    message: `Successfully uploaded ${Array.isArray(data) ? data.length : 1} candidates`,
    data,
    count: Array.isArray(data) ? data.length : 1,
  };
}

async function uploadCandidatesSpreadsheet(file: File, jobId?: string): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  if (jobId) formData.append('jobId', jobId);

  const response = await fetch(`${API_BASE_URL}/candidates/upload/spreadsheet`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    return { success: false, message: `Upload failed: ${error}` };
  }

  const data = await response.json();
  return {
    success: true,
    message: `Successfully uploaded ${Array.isArray(data) ? data.length : 1} candidates from spreadsheet`,
    data,
    count: Array.isArray(data) ? data.length : 1,
  };
}

async function uploadResumeAndCreate(file: File, jobId?: string): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  if (jobId) formData.append('jobId', jobId);

  const response = await fetch(`${API_BASE_URL}/candidates/upload/resume`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    return { success: false, message: `Resume upload failed: ${error}` };
  }

  const data = await response.json();
  return {
    success: true,
    message: `Successfully parsed resume and created candidate: ${data.candidate?.firstName} ${data.candidate?.lastName}`,
    data,
  };
}

async function reparseCandidate(candidateId: string, file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}/reparse`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    return { success: false, message: `Reparse failed: ${error}` };
  }

  const data = await response.json();
  return {
    success: true,
    message: `Successfully reparsed candidate document`,
    data,
  };
}

async function uploadJobsJSON(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/jobs/upload/json`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    return { success: false, message: `Jobs upload failed: ${error}` };
  }

  const data = await response.json();
  return {
    success: true,
    message: `Successfully uploaded ${Array.isArray(data) ? data.length : 1} jobs`,
    data,
    count: Array.isArray(data) ? data.length : 1,
  };
}

async function uploadJobsSpreadsheet(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/jobs/upload/spreadsheet`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    return { success: false, message: `Jobs upload failed: ${error}` };
  }

  const data = await response.json();
  return {
    success: true,
    message: `Successfully uploaded ${Array.isArray(data) ? data.length : 1} jobs from spreadsheet`,
    data,
    count: Array.isArray(data) ? data.length : 1,
  };
}

// ============================================================================
// SIDEBAR COMPONENT
// ============================================================================

const Sidebar = ({ open, onClose, active }: { open: boolean; onClose: () => void; active: string }) => {
  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { key: 'applicants', label: 'Applicants', icon: Users, href: '/applicants' },
    { key: 'jobs', label: 'Jobs', icon: Briefcase, href: '/jobs' },
    { key: 'analysis', label: 'Analysis', icon: BarChart3, href: '/analysis' },
    { key: 'manual', label: 'Manual List', icon: FileStack, href: '/manual' },
    { key: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
  ];

  return (
    <>
      <div
        onClick={onClose}
        className={clsx(
          'fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-all duration-300 lg:hidden',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      />

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-80 overflow-y-auto transition-all duration-300 ease-out lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="absolute inset-0 bg-[url('/images/Sidebar.jpg')] bg-cover bg-center bg-no-repeat" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/95 via-indigo-950/90 to-slate-950/95" />

        <div className="relative flex h-full flex-col p-6">
          <div className="mb-8 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-lg font-bold text-white shadow-lg">
              HR
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">HR Dashboard</h1>
              <p className="text-xs text-blue-200/80">Manual Upload Suite</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.key === active;

              return (
                <a
                  key={item.key}
                  href={item.href}
                  className={clsx(
                    'group relative flex items-center gap-3 rounded-xl border px-4 py-3 text-sm backdrop-blur-sm transition-all duration-200',
                    isActive
                      ? 'border-cyan-400/40 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-white shadow-lg'
                      : 'border-white/10 bg-white/5 text-blue-50/80 hover:border-white/20 hover:bg-white/10 hover:text-white'
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 h-10 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-cyan-400 to-blue-500 shadow-lg" />
                  )}
                  <span className={clsx(
                    'flex h-10 w-10 items-center justify-center rounded-xl border transition-all',
                    isActive
                      ? 'border-cyan-400/40 bg-gradient-to-br from-cyan-500/30 to-blue-600/30'
                      : 'border-white/15 bg-blue-950/40'
                  )}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="font-semibold">{item.label}</span>
                </a>
              );
            })}
          </nav>

          <div className="mt-6 rounded-2xl border border-white/15 bg-gradient-to-br from-white/10 to-white/5 p-4 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-lg" />
              <p className="text-xs font-semibold text-emerald-300">Upload Ready</p>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-blue-100/80">
              Upload JSON, CSV, XLSX files for candidates or jobs. All history is persisted in backend.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

// ============================================================================
// UPLOAD CARD COMPONENT
// ============================================================================

const UploadCard = ({
  title,
  description,
  icon: Icon,
  acceptedFormats,
  onUpload,
  showJobSelect = false,
  showCandidateSelect = false,
  jobs = [],
  candidates = [],
  uploadType,
}: {
  title: string;
  description: string;
  icon: any;
  acceptedFormats: string;
  onUpload: (file: File, jobId?: string, candidateId?: string) => Promise<void>;
  showJobSelect?: boolean;
  showCandidateSelect?: boolean;
  jobs?: Job[];
  candidates?: Candidate[];
  uploadType?: string;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      await onUpload(file, selectedJobId || undefined, selectedCandidateId || undefined);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={clsx(
        'rounded-2xl border-2 border-dashed bg-white p-6 transition-all duration-200',
        isDragging
          ? 'border-blue-500 bg-blue-50 shadow-lg scale-[1.02]'
          : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-3 text-white shadow-md">
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
          <p className="mt-2 text-xs text-slate-400">Accepted: {acceptedFormats}</p>

          {showJobSelect && jobs.length > 0 && (
            <div className="mt-3">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Link to Job (Optional)
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
              >
                <option value="">-- No job link --</option>
                {jobs.map((job) => (
                  <option key={job._id} value={job.jobId}>
                    {job.title} - {job.department} ({job.location})
                  </option>
                ))}
              </select>
            </div>
          )}

          {showCandidateSelect && candidates.length > 0 && uploadType === 'reparse' && (
            <div className="mt-3">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Select Candidate to Reparse *
              </label>
              <select
                value={selectedCandidateId}
                onChange={(e) => setSelectedCandidateId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
              >
                <option value="">-- Select candidate --</option>
                {candidates.map((candidate) => (
                  <option key={candidate._id} value={candidate._id}>
                    {candidate.firstName} {candidate.lastName} - {candidate.email}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || (showCandidateSelect && !selectedCandidateId && uploadType === 'reparse')}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {uploading ? 'Uploading...' : 'Choose File'}
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50"
            >
              <FolderOpen className="h-4 w-4" />
              Browse
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFormats}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// RESULT MODAL COMPONENT
// ============================================================================

const ResultModal = ({
  result,
  onClose,
}: {
  result: UploadResult | null;
  onClose: () => void;
}) => {
  if (!result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2">
            {result.success ? (
              <CheckCircle className="h-6 w-6 text-emerald-500" />
            ) : (
              <AlertCircle className="h-6 w-6 text-red-500" />
            )}
            <h2 className="text-xl font-bold text-slate-800">
              {result.success ? 'Upload Successful' : 'Upload Failed'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className={clsx(
            'rounded-xl p-4',
            result.success ? 'bg-emerald-50' : 'bg-red-50'
          )}>
            <p className={clsx(
              'text-sm',
              result.success ? 'text-emerald-700' : 'text-red-700'
            )}>
              {result.message}
            </p>
          </div>

          {result.count !== undefined && (
            <div className="flex items-center justify-between rounded-xl bg-blue-50 p-4">
              <span className="text-sm font-medium text-blue-700">Records Imported:</span>
              <span className="text-2xl font-bold text-blue-600">{result.count}</span>
            </div>
          )}

          {result.data && (
            <details className="rounded-xl border border-slate-200">
              <summary className="cursor-pointer p-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
                View Response Data
              </summary>
              <pre className="overflow-x-auto rounded-b-xl bg-slate-900 p-4 text-xs text-slate-300 max-h-96">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </details>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:from-blue-700 hover:to-indigo-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// HISTORY ITEM COMPONENT
// ============================================================================

const getTypeConfig = (type: string) => {
  const configs: Record<string, { label: string; icon: any; color: string }> = {
    'candidates-json': { label: 'Candidates JSON', icon: FileJson, color: 'text-blue-600' },
    'candidates-spreadsheet': { label: 'Candidates Spreadsheet', icon: FileSpreadsheet, color: 'text-emerald-600' },
    'candidates-resume': { label: 'Resume Upload', icon: FileText, color: 'text-purple-600' },
    'jobs-json': { label: 'Jobs JSON', icon: FileJson, color: 'text-amber-600' },
    'jobs-spreadsheet': { label: 'Jobs Spreadsheet', icon: FileSpreadsheet, color: 'text-orange-600' },
    'reparse': { label: 'Reparse Candidate', icon: RefreshCw, color: 'text-cyan-600' },
  };
  return configs[type] || { label: type, icon: FileStack, color: 'text-slate-600' };
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const HistoryItem = ({ item }: { item: UploadHistoryItem }) => {
  const config = getTypeConfig(item.type);
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 transition-all hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className={clsx(
          'rounded-xl p-2',
          item.status === 'success' ? 'bg-emerald-100' : 'bg-red-100'
        )}>
          <Icon className={clsx('h-5 w-5', config.color)} />
        </div>
        <div>
          <p className="font-medium text-slate-800">{item.fileName}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-slate-500">{config.label}</span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">{formatFileSize(item.fileSize)}</span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">
              {new Date(item.createdAt).toLocaleString()}
            </span>
            {item.jobId && (
              <>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-blue-600">Job: {item.jobId}</span>
              </>
            )}
            {item.count > 0 && (
              <>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-emerald-600">{item.count} records</span>
              </>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">{item.message}</p>
        </div>
      </div>
      <div>
        <span className={clsx(
          'rounded-full px-2 py-1 text-xs font-medium',
          item.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
        )}>
          {item.status === 'success' ? 'Success' : 'Failed'}
        </span>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function ManualListPage() {
  const { openSidebar } = useAppShell();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [uploadHistory, setUploadHistory] = useState<UploadHistoryItem[]>([]);
  const [stats, setStats] = useState<UploadStatsResponse | null>(null);
  const [currentResult, setCurrentResult] = useState<UploadResult | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load all dashboard data from backend
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [jobsData, candidatesData, historyData, statsData] = await Promise.all([
        getAllJobs(),
        getAllCandidates(),
        getUploadHistory(),
        getUploadStats(),
      ]);

      setJobs(jobsData);
      setCandidates(candidatesData);
      setUploadHistory(historyData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh all data after upload
  const refreshAllData = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Upload handlers - each upload refreshes data on success
  const handleCandidatesJSONUpload = async (file: File, jobId?: string) => {
    try {
      const result = await uploadCandidatesJSON(file, jobId);
      setCurrentResult(result);
      setShowResultModal(true);
      if (result.success) {
        await refreshAllData();
      }
    } catch (err) {
      setCurrentResult({ success: false, message: err instanceof Error ? err.message : 'Upload failed' });
      setShowResultModal(true);
    }
  };

  const handleCandidatesSpreadsheetUpload = async (file: File, jobId?: string) => {
    try {
      const result = await uploadCandidatesSpreadsheet(file, jobId);
      setCurrentResult(result);
      setShowResultModal(true);
      if (result.success) {
        await refreshAllData();
      }
    } catch (err) {
      setCurrentResult({ success: false, message: err instanceof Error ? err.message : 'Upload failed' });
      setShowResultModal(true);
    }
  };

  const handleResumeUpload = async (file: File, jobId?: string) => {
    try {
      const result = await uploadResumeAndCreate(file, jobId);
      setCurrentResult(result);
      setShowResultModal(true);
      if (result.success) {
        await refreshAllData();
      }
    } catch (err) {
      setCurrentResult({ success: false, message: err instanceof Error ? err.message : 'Upload failed' });
      setShowResultModal(true);
    }
  };

  const handleReparseUpload = async (file: File, jobId?: string, candidateId?: string) => {
    if (!candidateId) {
      setCurrentResult({ success: false, message: 'Please select a candidate to reparse' });
      setShowResultModal(true);
      return;
    }

    try {
      const result = await reparseCandidate(candidateId, file);
      setCurrentResult(result);
      setShowResultModal(true);
      if (result.success) {
        await refreshAllData();
      }
    } catch (err) {
      setCurrentResult({ success: false, message: err instanceof Error ? err.message : 'Reparse failed' });
      setShowResultModal(true);
    }
  };

  const handleJobsJSONUpload = async (file: File) => {
    try {
      const result = await uploadJobsJSON(file);
      setCurrentResult(result);
      setShowResultModal(true);
      if (result.success) {
        await refreshAllData();
      }
    } catch (err) {
      setCurrentResult({ success: false, message: err instanceof Error ? err.message : 'Upload failed' });
      setShowResultModal(true);
    }
  };

  const handleJobsSpreadsheetUpload = async (file: File) => {
    try {
      const result = await uploadJobsSpreadsheet(file);
      setCurrentResult(result);
      setShowResultModal(true);
      if (result.success) {
        await refreshAllData();
      }
    } catch (err) {
      setCurrentResult({ success: false, message: err instanceof Error ? err.message : 'Upload failed' });
      setShowResultModal(true);
    }
  };

  // Chart data preparation
  const uploadsByTypeData = stats ? Object.entries(stats.uploadsByType).map(([name, value]) => ({
    name: getTypeConfig(name).label,
    value,
  })) : [];

  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

  if (loading) {
    return (
      <AppShell>
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            <p className="mt-4 text-sm text-slate-600">Loading dashboard data...</p>
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
                Manual List & Bulk Upload
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Upload JSON, CSV, XLSX files for candidates or jobs. All history is persisted in backend.
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
                onClick={refreshAllData}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 hover:shadow-md"
              >
                <RefreshCw className={clsx('h-4 w-4', refreshing && 'animate-spin')} />
                Refresh
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

          {/* Stats Cards - From Backend API */}
          {stats && (
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <div className="rounded-xl bg-white p-4 shadow-md">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                    <Database className="h-4 w-4" />
                  </div>
                  <span className="text-2xl font-bold text-slate-800">{stats.totalUploads}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">Total Uploads</p>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-md">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <span className="text-2xl font-bold text-slate-800">{stats.successfulUploads}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">Successful</p>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-md">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-red-100 p-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <span className="text-2xl font-bold text-slate-800">{stats.failedUploads}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">Failed</p>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-md">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-purple-100 p-2 text-purple-600">
                    <Users className="h-4 w-4" />
                  </div>
                  <span className="text-2xl font-bold text-slate-800">{stats.totalCandidatesAdded}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">Candidates Added</p>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-md">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <span className="text-2xl font-bold text-slate-800">{stats.totalJobsAdded}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">Jobs Added</p>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-md">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-cyan-100 p-2 text-cyan-600">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <span className="text-2xl font-bold text-slate-800">
                    {stats.totalUploads ? Math.round((stats.successfulUploads / stats.totalUploads) * 100) : 0}%
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">Success Rate</p>
              </div>
            </div>
          )}

          {/* Charts Row - From Backend API */}
          {stats && (
            <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Uploads Over Time Chart */}
              <div className="rounded-2xl bg-white p-5 shadow-md">
                <h3 className="mb-4 text-base font-semibold text-slate-800">Upload Activity (Last 7 Days)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={stats.uploadsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#93c5fd" name="Uploads" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Uploads by Type Chart */}
              <div className="rounded-2xl bg-white p-5 shadow-md">
                <h3 className="mb-4 text-base font-semibold text-slate-800">Uploads by Type</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={uploadsByTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(((percent ?? 0) * 100)).toFixed(0)}%`}
                    >
                      {uploadsByTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Upload Cards Grid */}
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-slate-800">Candidate Uploads</h2>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
              <UploadCard
                title="Candidates JSON"
                description="Upload JSON file with candidates array. Supports NDJSON, comments, trailing commas."
                icon={FileJson}
                acceptedFormats=".json"
                onUpload={handleCandidatesJSONUpload}
                showJobSelect={true}
                jobs={jobs}
              />
              <UploadCard
                title="Candidates Spreadsheet"
                description="Upload CSV, XLS, or XLSX. Columns: firstName, lastName, email, skills, etc."
                icon={FileSpreadsheet}
                acceptedFormats=".csv, .xls, .xlsx"
                onUpload={handleCandidatesSpreadsheetUpload}
                showJobSelect={true}
                jobs={jobs}
              />
              <UploadCard
                title="Resume Upload"
                description="Upload PDF, DOC, DOCX. AI parses and creates candidate profile automatically."
                icon={FileText}
                acceptedFormats=".pdf, .doc, .docx"
                onUpload={handleResumeUpload}
                showJobSelect={true}
                jobs={jobs}
              />
              <UploadCard
                title="Reparse Candidate"
                description="Upload new document for existing candidate to refresh parsed profile."
                icon={RefreshCw}
                acceptedFormats=".pdf, .doc, .docx"
                onUpload={handleReparseUpload}
                showCandidateSelect={true}
                candidates={candidates}
                uploadType="reparse"
              />
            </div>
          </div>

          {/* Jobs Upload Section */}
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-slate-800">Job Uploads</h2>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <UploadCard
                title="Jobs JSON"
                description="Upload JSON file with jobs array. Supports {jobs: []}, {jobProfiles: []}, or array root."
                icon={FileJson}
                acceptedFormats=".json"
                onUpload={handleJobsJSONUpload}
              />
              <UploadCard
                title="Jobs Spreadsheet"
                description="Upload CSV, XLS, or XLSX. Columns: title, department, location, description, requiredSkills."
                icon={FileSpreadsheet}
                acceptedFormats=".csv, .xls, .xlsx"
                onUpload={handleJobsSpreadsheetUpload}
              />
            </div>
          </div>

          {/* Upload History Section - From Backend API */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-800">Upload History</h2>
              <span className="text-sm text-slate-500">
                {uploadHistory.length} {uploadHistory.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            {uploadHistory.length === 0 ? (
              <div className="rounded-2xl bg-white p-12 text-center shadow-lg">
                <CloudUpload className="mx-auto h-16 w-16 text-slate-300" />
                <h3 className="mt-4 text-lg font-semibold text-slate-700">No Upload History</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Upload your first file using one of the cards above. All history is automatically saved.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {uploadHistory.map((item) => (
                  <HistoryItem key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>

          {/* Format Instructions */}
          <div className="mt-8 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-lg">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-white/20 p-3">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Supported Formats & Instructions</h3>
                <div className="mt-3 grid grid-cols-1 gap-4 text-sm text-blue-100 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="font-medium text-white">JSON Format (Candidates):</p>
                    <p className="text-xs mt-1 break-all">
                      {`{"candidates": [{"firstName": "John", "lastName": "Doe", "email": "john@example.com", "skills": [{"name": "React"}], "jobId": "JOB-001"}]}`}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-white">CSV Headers (Candidates):</p>
                    <p className="text-xs mt-1">
                      firstName, lastName, email, headline, location, skills, linkedin, github
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-white">JSON Format (Jobs):</p>
                    <p className="text-xs mt-1 break-all">
                      {`{"jobs": [{"title": "Software Engineer", "department": "Engineering", "location": "Remote", "requiredSkills": ["React", "Node.js"]}]}`}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-white">CSV Headers (Jobs):</p>
                    <p className="text-xs mt-1">
                      title, department, location, description, requiredSkills, minYearsExperience
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Result Modal */}
      {showResultModal && currentResult && (
        <ResultModal
          result={currentResult}
          onClose={() => {
            setShowResultModal(false);
            setCurrentResult(null);
          }}
        />
      )}
    </AppShell>
  );
}
