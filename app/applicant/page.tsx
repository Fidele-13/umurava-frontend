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
  Filter,
  Plus,
  RefreshCw,
  Mail,
  Phone,
  Link as LinkIcon,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserPlus,
  ExternalLink,
  TrendingUp,
  Download,
  Upload,
} from 'lucide-react';
import clsx from 'clsx';
import { AppShell, useAppShell } from '@/app/components/app-shell';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || 'http://localhost:3000';

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
  bio?: string;
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
    startYear?: number;
    endYear?: number;
  }>;
  availability?: {
    status: string;
    type: string;
  };
  socialLinks?: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  createdAt?: string;
};

export type Application = {
  _id: string;
  jobId: string | Job;
  candidateId: string | Candidate;
  status: 'applied' | 'screened' | 'shortlisted' | 'rejected';
  source: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CandidateWithJobs = {
  candidate: Candidate;
  appliedJobIds: string[];
  applications: Array<{
    applicationId: string;
    jobId: string | null;
    mongoJobId: string;
    title: string | null;
    status: string;
    source: string;
  }>;
};

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

function getApplicationsForJob(jobId: string) {
  return request<Application[]>(`/applications/job/${jobId}`);
}

function createApplication(jobId: string, candidateId: string, source: string = 'manual') {
  return request<Application>('/applications', {
    method: 'POST',
    body: JSON.stringify({ jobId, candidateId, source }),
  });
}

function getAllCandidates() {
  return request<Candidate[]>('/candidates');
}

function getCandidatesWithJobs() {
  return request<CandidateWithJobs[]>('/candidates/with-jobs');
}

function updateApplicationStatus(applicationId: string, status: string) {
  return request<Application>(`/applications/${applicationId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// ============================================================================
// LINK APPLICANT MODAL
// ============================================================================

interface LinkApplicantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  jobId: string;
  existingCandidateIds: Set<string>;
}

function LinkApplicantModal({ isOpen, onClose, onSuccess, jobId, existingCandidateIds }: LinkApplicantModalProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadCandidates();
    }
  }, [isOpen]);

  async function loadCandidates() {
    try {
      setLoading(true);
      const allCandidates = await getAllCandidates();
      // Filter out candidates already linked to this job
      const availableCandidates = allCandidates.filter(
        c => !existingCandidateIds.has(c._id)
      );
      setCandidates(availableCandidates);
    } catch (err) {
      console.error('Failed to load candidates:', err);
      setError('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  }

  const filteredCandidates = candidates.filter(candidate => {
    const fullName = `${candidate.firstName} ${candidate.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSubmit = async () => {
    if (!selectedCandidateId) {
      setError('Please select a candidate');
      return;
    }

    try {
      setSubmitting(true);
      await createApplication(jobId, selectedCandidateId, 'manual');
      onSuccess();
      onClose();
      setSelectedCandidateId('');
      setSearchTerm('');
    } catch (err) {
      setError('Failed to link candidate. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-content-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <UserPlus className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Link Existing Applicant</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidates by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none ring-blue-500 transition-all focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Candidates List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <div className="rounded-xl bg-red-50 p-4 text-center text-sm text-red-600">
              {error}
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="rounded-xl bg-slate-50 p-8 text-center">
              <Users className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">
                {searchTerm ? 'No matching candidates found' : 'No available candidates to link'}
              </p>
              {!searchTerm && (
                <Link
                  href="/manual"
                  className="mt-3 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Create new candidate
                </Link>
              )}
            </div>
          ) : (
            <div className="max-h-96 space-y-2 overflow-y-auto rounded-xl border border-slate-100">
              {filteredCandidates.map((candidate) => {
                const isSelected = selectedCandidateId === candidate._id;
                const fullName = `${candidate.firstName} ${candidate.lastName}`;
                const topSkill = candidate.skills?.[0]?.name;

                return (
                  <button
                    key={candidate._id}
                    onClick={() => setSelectedCandidateId(candidate._id)}
                    className={clsx(
                      'w-full p-4 text-left transition-all hover:bg-slate-50',
                      isSelected && 'bg-blue-50/50 ring-1 ring-blue-200',
                      'border-b border-slate-100 last:border-b-0'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="grid h-8 w-8 place-content-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
                            {candidate.firstName[0]}{candidate.lastName[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{fullName}</p>
                            <p className="text-xs text-slate-500">{candidate.email}</p>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          {candidate.location && (
                            <span className="flex items-center gap-1 text-slate-500">
                              <MapPin className="h-3 w-3" />
                              {candidate.location}
                            </span>
                          )}
                          {topSkill && (
                            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">
                              {topSkill}
                            </span>
                          )}
                          {candidate.experience?.[0]?.role && (
                            <span className="text-slate-500">
                              {candidate.experience[0].role}
                            </span>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedCandidateId || submitting}
              className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-md hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Link Applicant'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// UPDATE STATUS MODAL
// ============================================================================

interface UpdateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  application: Application | null;
}

function UpdateStatusModal({ isOpen, onClose, onSuccess, application }: UpdateStatusModalProps) {
  const [status, setStatus] = useState(application?.status || 'applied');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (application) {
      setStatus(application.status);
    }
  }, [application]);

  if (!isOpen || !application) return null;

  const statusOptions = [
    { value: 'applied', label: 'Applied', color: 'blue', icon: Clock },
    { value: 'screened', label: 'Screened', color: 'purple', icon: Eye },
    { value: 'shortlisted', label: 'Shortlisted', color: 'emerald', icon: Star },
    { value: 'rejected', label: 'Rejected', color: 'red', icon: XCircle },
  ];

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await updateApplicationStatus(application._id, status);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (color: string) => {
    switch (color) {
      case 'blue': return 'border-blue-200 bg-blue-50 text-blue-700';
      case 'purple': return 'border-purple-200 bg-purple-50 text-purple-700';
      case 'emerald': return 'border-emerald-200 bg-emerald-50 text-emerald-700';
      case 'red': return 'border-red-200 bg-red-50 text-red-700';
      default: return 'border-slate-200 bg-slate-50 text-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-800">Update Application Status</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            {statusOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = status === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setStatus(option.value as 'applied' | 'screened' | 'shortlisted' | 'rejected')}
                  className={clsx(
                    'flex w-full items-center gap-3 rounded-xl border p-3 transition-all',
                    isSelected
                      ? getStatusColor(option.color)
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="flex-1 text-left font-medium">{option.label}</span>
                  {isSelected && <CheckCircle className="h-5 w-5" />}
                </button>
              );
            })}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-md hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Update Status'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// APPLICANT CARD COMPONENT
// ============================================================================

interface ApplicantCardProps {
  application: Application;
  onUpdateStatus: (application: Application) => void;
}

function ApplicantCard({ application, onUpdateStatus }: ApplicantCardProps) {
  const candidate = application.candidateId as Candidate;
  const statusColors = {
    applied: 'bg-blue-50 text-blue-700 border-blue-200',
    screened: 'bg-purple-50 text-purple-700 border-purple-200',
    shortlisted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
  };

  const statusIcons = {
    applied: Clock,
    screened: Eye,
    shortlisted: Star,
    rejected: XCircle,
  };

  const StatusIcon = statusIcons[application.status as keyof typeof statusIcons] || Clock;
  const fullName = `${candidate.firstName} ${candidate.lastName}`;
  const topSkills = candidate.skills?.slice(0, 3).map(s => s.name) || [];

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'resume-upload': return 'Resume Upload';
      case 'csv-upload': return 'CSV Upload';
      case 'external-api': return 'External API';
      default: return source;
    }
  };

  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 place-content-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-base font-bold text-white shadow-md">
            {candidate.firstName[0]}{candidate.lastName[0]}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">{fullName}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {candidate.email}
              </span>
              {candidate.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {candidate.phone}
                </span>
              )}
              {candidate.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {candidate.location}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={clsx('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium', statusColors[application.status as keyof typeof statusColors])}>
            <StatusIcon className="h-3 w-3" />
            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
          </span>
          <button
            onClick={() => onUpdateStatus(application)}
            className="rounded-lg p-1.5 text-slate-400 opacity-0 transition-all hover:bg-slate-100 group-hover:opacity-100"
            title="Update status"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Headline/Bio */}
      {candidate.headline && (
        <p className="mt-3 text-sm text-slate-600">{candidate.headline}</p>
      )}

      {/* Skills */}
      {topSkills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {topSkills.map((skill, idx) => (
            <span key={idx} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Experience Summary */}
      {candidate.experience && candidate.experience.length > 0 && (
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <Briefcase className="h-3 w-3" />
          <span>{candidate.experience[0].role} at {candidate.experience[0].company}</span>
          {candidate.experience.length > 1 && (
            <span>+{candidate.experience.length - 1} more</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
        <span className="text-slate-500">
          Applied {application.createdAt ? new Date(application.createdAt).toLocaleDateString() : 'Recently'}
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
          {getSourceLabel(application.source)}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN APPLICANTS PAGE
// ============================================================================

export default function ApplicantsPage() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');
  const { openSidebar } = useAppShell();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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
      const [jobData, applicationsData] = await Promise.all([
        getJobById(jobId),
        getApplicationsForJob(jobId),
      ]);
      setJob(jobData);
      setApplications(applicationsData);
    } catch (err) {
      setError('Failed to load applicants data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const existingCandidateIds = new Set(
    applications.map(app => (app.candidateId as Candidate)._id)
  );

  const filteredApplications = applications.filter(app => {
    const candidate = app.candidateId as Candidate;
    const fullName = `${candidate.firstName} ${candidate.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: applications.length,
    applied: applications.filter(a => a.status === 'applied').length,
    screened: applications.filter(a => a.status === 'screened').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-screen">
          <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6">
            <div className="mb-6 h-32 animate-pulse rounded-2xl bg-white shadow-card" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-40 animate-pulse rounded-xl bg-white shadow-card" />
              ))}
            </div>
          </div>
        </div>
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="rounded-2xl bg-white p-8 shadow-2xl">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            <p className="mt-4 text-sm font-medium text-slate-700">Loading applicants...</p>
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
                    {job.title}
                  </h1>
                  <span className={clsx(
                    'rounded-full px-2.5 py-1 text-xs font-semibold',
                    job.isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  )}>
                    {job.isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-3 text-sm text-slate-500">
                  {job.department && <span>{job.department}</span>}
                  {job.location && <span>• {job.location}</span>}
                  {job.minYearsExperience && job.minYearsExperience > 0 && (
                    <span>• {job.minYearsExperience}+ years exp</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href={`/analysis?jobId=${jobId}`}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-md hover:from-purple-700 hover:to-indigo-700"
              >
                <TrendingUp className="h-4 w-4" />
                AI Analytics
              </Link>
              <button
                onClick={() => setShowLinkModal(true)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-md hover:from-emerald-700 hover:to-teal-700"
              >
                <UserPlus className="h-4 w-4" />
                Link Applicant
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

          {/* Stats Cards */}
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
            {Object.entries(statusCounts).map(([status, count]) => {
              const colors = {
                all: 'from-slate-500 to-slate-600',
                applied: 'from-blue-500 to-blue-600',
                screened: 'from-purple-500 to-purple-600',
                shortlisted: 'from-emerald-500 to-emerald-600',
                rejected: 'from-red-500 to-red-600',
              };
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={clsx(
                    'rounded-xl bg-white p-4 text-center shadow-md transition-all hover:shadow-lg',
                    statusFilter === status && 'ring-2 ring-blue-400'
                  )}
                >
                  <p className="text-2xl font-bold text-slate-800">{count}</p>
                  <p className="text-xs font-medium text-slate-500 capitalize">
                    {status}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Search & Filter Bar */}
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search applicants by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none ring-blue-500 transition-all focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Applicants List */}
          {filteredApplications.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center">
              <Users className="h-16 w-16 text-slate-300" />
              <h3 className="mt-4 text-lg font-semibold text-slate-700">No applicants found</h3>
              <p className="mt-1 text-sm text-slate-500">
                {searchTerm ? 'Try adjusting your search' : 'Link your first applicant to this job'}
              </p>
              <button
                onClick={() => setShowLinkModal(true)}
                className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-medium text-white"
              >
                <UserPlus className="h-4 w-4" />
                Link Applicant
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <ApplicantCard
                  key={application._id}
                  application={application}
                  onUpdateStatus={(app) => {
                    setSelectedApplication(app);
                    setShowStatusModal(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>

      {/* Modals */}
      {showLinkModal && (
        <LinkApplicantModal
          isOpen={showLinkModal}
          onClose={() => setShowLinkModal(false)}
          onSuccess={loadData}
          jobId={jobId!}
          existingCandidateIds={existingCandidateIds}
        />
      )}
      {showStatusModal && selectedApplication && (
        <UpdateStatusModal
          isOpen={showStatusModal}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedApplication(null);
          }}
          onSuccess={loadData}
          application={selectedApplication}
        />
      )}
    </AppShell>
  );
}
