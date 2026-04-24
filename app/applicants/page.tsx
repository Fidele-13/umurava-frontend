'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Upload,
  FileText,
  Trash2,
  Edit,
  Plus,
  X,
  Search,
  Filter,
  Eye,
  Clock,
  XCircle,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  FileSpreadsheet,
  FileJson,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Star,
  UserPlus,
  Cloud,
  Briefcase,
  Link2,
  Download,
  File as FileIcon,
  Check,
  Zap,
  Award,
  Target,
  Brain,
  Sparkles,
  Linkedin,
  Github,
  Globe,
  BookOpen,
  GraduationCap,
  Briefcase as BriefcaseIcon,
  Code,
  Languages,
  Heart,
  Share2,
  MoreVertical,
  ExternalLink,
  Send,
  Save,
  Archive,
  Copy,
  Flag,
  Bell,
  MessageSquare,
  ThumbsUp,
  Mic,
  Video,
  Camera,
  Music,
  Gamepad,
  Book,
  Coffee,
  Gift,
  ZapIcon,
  Sun,
  Moon,
  CloudRain,
  Wind,
  Thermometer,
  Droplet,
  Compass,
  Map as MapIcon,
  Flag as FlagIcon,
  Anchor,
  Umbrella,
  Snowflake,
  Flame,
  Leaf,
  HeartIcon,
  Smile,
  Frown,
  Meh,
} from 'lucide-react';
import clsx from 'clsx';
import { AppShell, useAppShell } from '@/app/components/app-shell';

// ============================================================================
// API CONFIGURATION
// ============================================================================

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || 'http://localhost:3000';

// ============================================================================
// TYPES (Based on your API documentation)
// ============================================================================

type Skill = {
  name: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  yearsOfExperience?: number;
};

type Experience = {
  role: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
};

type Education = {
  degree: string;
  institution: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
};

type Project = {
  name: string;
  description?: string;
  technologies?: string[];
  url?: string;
};

type Language = {
  name: string;
  proficiency?: 'Basic' | 'Conversational' | 'Professional' | 'Native';
};

type Certification = {
  name: string;
  issuer?: string;
  date?: string;
  url?: string;
};

type SocialLinks = {
  linkedin?: string;
  github?: string;
  portfolio?: string;
  twitter?: string;
};

type Availability = {
  status: 'Open to Opportunities' | 'Actively Looking' | 'Not Looking' | 'Casually Looking';
  type?: 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Hybrid';
  noticePeriod?: string;
};

type Candidate = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  headline?: string;
  bio?: string;
  location?: string;
  skills: Skill[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
  languages?: Language[];
  certifications?: Certification[];
  socialLinks?: SocialLinks;
  availability?: Availability;
  externalCandidateId?: string;
  source: 'manual' | 'resume-pdf' | 'csv' | 'xlsx' | 'external-api';
  createdAt: string;
  updatedAt: string;
};

type Application = {
  applicationId: string;
  jobId: string | null;
  mongoJobId: string;
  title: string | null;
  status: 'applied' | 'screened' | 'shortlisted' | 'rejected' | 'hired';
  source: 'manual' | 'dummy-seed' | 'external-api' | 'csv-upload' | 'resume-upload';
  appliedAt?: string;
};

type CandidateWithJobs = {
  candidate: Candidate;
  appliedJobIds: string[];
  applications: Application[];
};

type Job = {
  _id: string;
  jobId: string;
  title: string;
  department: string;
  location: string;
  description: string;
  requiredSkills?: string[];
  minYearsExperience?: number;
  createdAt?: string;
};

// ============================================================================
// API CALL FUNCTIONS (Using your exact endpoints)
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

// Candidate endpoints
async function getAllCandidatesWithJobs(): Promise<CandidateWithJobs[]> {
  return request<CandidateWithJobs[]>('/candidates/with-jobs');
}

async function getCandidateById(id: string): Promise<CandidateWithJobs> {
  return request<CandidateWithJobs>(`/candidates/${id}/with-jobs`);
}

async function createCandidate(data: Partial<Candidate> & { jobId?: string; appliedJobIds?: string[] }): Promise<Candidate> {
  return request<Candidate>('/candidates', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

async function updateCandidate(id: string, data: Partial<Candidate>): Promise<Candidate> {
  return request<Candidate>(`/candidates/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

async function deleteCandidate(id: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/candidates/${id}`, {
    method: 'DELETE',
  });
}

// Bulk upload endpoints
async function uploadCandidatesJSON(file: File, jobId?: string): Promise<Candidate[]> {
  const formData = new FormData();
  formData.append('file', file);
  if (jobId) formData.append('jobId', jobId);

  const response = await fetch(`${API_BASE_URL}/candidates/upload/json`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`JSON upload failed: ${error}`);
  }

  return response.json();
}

async function uploadCandidatesSpreadsheet(file: File, jobId?: string): Promise<Candidate[]> {
  const formData = new FormData();
  formData.append('file', file);
  if (jobId) formData.append('jobId', jobId);

  const response = await fetch(`${API_BASE_URL}/candidates/upload/spreadsheet`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Spreadsheet upload failed: ${error}`);
  }

  return response.json();
}

async function uploadResumeAndCreate(file: File, jobId?: string): Promise<{ candidate: Candidate; parsedProfile: Partial<Candidate> }> {
  const formData = new FormData();
  formData.append('file', file);
  if (jobId) formData.append('jobId', jobId);

  const response = await fetch(`${API_BASE_URL}/candidates/upload/resume`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resume upload failed: ${error}`);
  }

  return response.json();
}

async function reparseCandidateDocument(id: string, file: File): Promise<{ success: boolean; parsedProfile: Partial<Candidate> }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/candidates/${id}/reparse`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Reparse failed: ${error}`);
  }

  return response.json();
}

// Application endpoints
async function linkCandidateToJob(candidateId: string, jobId: string, source?: string): Promise<Application> {
  return request<Application>('/applications', {
    method: 'POST',
    body: JSON.stringify({
      candidateId,
      jobId,
      source: source || 'manual',
    }),
  });
}

async function getApplicationsForJob(jobId: string): Promise<Application[]> {
  return request<Application[]>(`/applications/job/${jobId}`);
}

async function getApplicationsForCandidate(candidateId: string): Promise<Application[]> {
  return request<Application[]>(`/applications/candidate/${candidateId}`);
}

// Parse only endpoints
async function parseResume(file: File): Promise<Partial<Candidate>> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/parse/resume`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Parse failed: ${error}`);
  }

  const result = await response.json();
  return result.data;
}

async function parseBatchResume(files: File[]): Promise<Array<Partial<Candidate>>> {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  const response = await fetch(`${API_BASE_URL}/parse/batch`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Batch parse failed: ${error}`);
  }

  const result = await response.json();
  return result.data;
}

// Jobs endpoint (for linking)
async function getAllJobs(): Promise<Job[]> {
  return request<Job[]>('/jobs');
}

// ============================================================================
// STATUS CONFIGURATION
// ============================================================================

const statusConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  applied: {
    label: 'Applied',
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
  },
  screened: {
    label: 'Screened',
    icon: Eye,
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
  },
  shortlisted: {
    label: 'Shortlisted',
    icon: Star,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-200',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-200',
  },
  hired: {
    label: 'Hired',
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50 border-green-200',
  },
};

const sourceConfig: Record<string, { label: string; icon: any; color: string }> = {
  manual: { label: 'Manual Entry', icon: UserPlus, color: 'text-purple-600' },
  'resume-pdf': { label: 'Resume Upload', icon: FileText, color: 'text-blue-600' },
  csv: { label: 'CSV Import', icon: FileSpreadsheet, color: 'text-green-600' },
  xlsx: { label: 'Excel Import', icon: FileSpreadsheet, color: 'text-emerald-600' },
  'external-api': { label: 'External API', icon: Cloud, color: 'text-cyan-600' },
};

// ============================================================================
// SIDEBAR COMPONENT
// ============================================================================

const Sidebar = ({ open, onClose, active }: { open: boolean; onClose: () => void; active: string }) => {
  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { key: 'applicants', label: 'Applicants', icon: Users, href: '/applicants' },
    { key: 'jobs', label: 'Jobs', icon: Briefcase, href: '/jobs' },
    { key: 'analytics', label: 'Analytics', icon: BarChart3, href: '/analytics' },
    { key: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={clsx(
          'fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-all duration-300 lg:hidden',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      />

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-80 overflow-y-auto transition-all duration-300 ease-out lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Background Image */}
        <div className="absolute inset-0 bg-[url('/images/Sidebar.jpg')] bg-cover bg-center bg-no-repeat" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/95 via-indigo-950/90 to-slate-950/95" />

        <div className="relative flex h-full flex-col p-6">
          {/* Logo */}
          <div className="mb-8 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-lg font-bold text-white shadow-lg">
              HR
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">HR Dashboard</h1>
              <p className="text-xs text-blue-200/80">Applicants Management</p>
            </div>
          </div>

          {/* Navigation */}
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

          {/* Footer */}
          <div className="mt-6 rounded-2xl border border-white/15 bg-gradient-to-br from-white/10 to-white/5 p-4 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-lg" />
              <p className="text-xs font-semibold text-emerald-300">AI Assistant Active</p>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-blue-100/80">
              {active === 'applicants' 
                ? 'Manage candidates, track applications, and analyze talent pool.'
                : 'Review applicant profiles and job matches.'}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

// ============================================================================
// MISSING ICON IMPORTS
// ============================================================================

const LayoutDashboard = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const BarChart3 = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 3v18h18" />
    <path d="M18 17V9" />
    <path d="M12 17V5" />
    <path d="M6 17v-3" />
  </svg>
);

const Settings = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function ApplicantsPage() {
  const { openSidebar } = useAppShell();
  const [applicants, setApplicants] = useState<CandidateWithJobs[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [selectedApplicant, setSelectedApplicant] = useState<CandidateWithJobs | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | 'link'>('view');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<'json' | 'spreadsheet' | 'resume'>('json');
  const [uploadJobId, setUploadJobId] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedJobForLinking, setSelectedJobForLinking] = useState<string>('');
  const [linkingJobId, setLinkingJobId] = useState<string>('');
  const [linkingCandidateId, setLinkingCandidateId] = useState<string>('');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    headline: '',
    bio: '',
    location: '',
    skills: '',
    experience: '',
    education: '',
    projects: '',
    languages: '',
    certifications: '',
    linkedin: '',
    github: '',
    portfolio: '',
    availabilityStatus: 'Open to Opportunities',
    availabilityType: 'Full-time',
    jobId: '',
    appliedJobIds: [] as string[],
  });

  // Load data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [applicantsData, jobsData] = await Promise.all([
        getAllCandidatesWithJobs(),
        getAllJobs(),
      ]);
      setApplicants(applicantsData);
      setJobs(jobsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
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

  // Filter applicants
  const filteredApplicants = applicants.filter((item) => {
    const fullName = `${item.candidate.firstName} ${item.candidate.lastName}`.toLowerCase();
    const email = item.candidate.email.toLowerCase();
    const matchesSearch = searchTerm === '' || fullName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (statusFilter !== 'all') {
      matchesStatus = item.applications.some((app) => app.status === statusFilter);
    }

    let matchesSource = true;
    if (sourceFilter !== 'all') {
      matchesSource = item.candidate.source === sourceFilter;
    }

    return matchesSearch && matchesStatus && matchesSource;
  });

  // Pagination
  const totalPages = Math.ceil(filteredApplicants.length / itemsPerPage);
  const paginatedApplicants = filteredApplicants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle create candidate
  const handleCreateCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const skillsArray = formData.skills.split(',').filter(Boolean).map((s) => ({
        name: s.trim(),
        level: 'Intermediate' as const,
      }));

      const experienceArray = formData.experience.split(',').filter(Boolean).map((exp) => {
        const [role, company] = exp.split('|');
        return { role: role?.trim() || '', company: company?.trim() || '' };
      });

      const educationArray = formData.education.split(',').filter(Boolean).map((edu) => {
        const [degree, institution] = edu.split('|');
        return { degree: degree?.trim() || '', institution: institution?.trim() || '' };
      });

      const projectsArray = formData.projects.split(',').filter(Boolean).map((proj) => ({
        name: proj.trim(),
      }));

      const languagesArray = formData.languages.split(',').filter(Boolean).map((lang) => ({
        name: lang.trim(),
        proficiency: 'Professional' as const,
      }));

      const certificationsArray = formData.certifications.split(',').filter(Boolean).map((cert) => ({
        name: cert.trim(),
      }));

      const appliedJobIdsArray = formData.appliedJobIds.filter(Boolean);

      await createCandidate({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        headline: formData.headline,
        bio: formData.bio,
        location: formData.location,
        skills: skillsArray,
        experience: experienceArray,
        education: educationArray,
        projects: projectsArray,
        languages: languagesArray,
        certifications: certificationsArray,
        socialLinks: {
          linkedin: formData.linkedin,
          github: formData.github,
          portfolio: formData.portfolio,
        },
        availability: {
          status: formData.availabilityStatus as any,
          type: formData.availabilityType as any,
        },
        jobId: formData.jobId || undefined,
        appliedJobIds: appliedJobIdsArray.length > 0 ? appliedJobIdsArray : undefined,
      });

      setShowModal(false);
      resetForm();
      refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
    }
  };

  // Handle link candidate to job
  const handleLinkToJob = async () => {
    if (!linkingCandidateId || !linkingJobId) {
      setError('Please select both candidate and job');
      return;
    }

    setLinkLoading(true);
    try {
      await linkCandidateToJob(linkingCandidateId, linkingJobId, 'manual');
      setShowLinkModal(false);
      setLinkingCandidateId('');
      setLinkingJobId('');
      refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Link failed');
    } finally {
      setLinkLoading(false);
    }
  };

  // Handle bulk upload
  const handleBulkUpload = async () => {
    if (!uploadFile) return;
    setUploading(true);
    try {
      if (uploadType === 'json') {
        await uploadCandidatesJSON(uploadFile, uploadJobId || undefined);
      } else if (uploadType === 'spreadsheet') {
        await uploadCandidatesSpreadsheet(uploadFile, uploadJobId || undefined);
      } else if (uploadType === 'resume') {
        await uploadResumeAndCreate(uploadFile, uploadJobId || undefined);
      }
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadJobId('');
      refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this applicant? This will remove all linked applications.')) return;
    try {
      await deleteCandidate(id);
      refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      headline: '',
      bio: '',
      location: '',
      skills: '',
      experience: '',
      education: '',
      projects: '',
      languages: '',
      certifications: '',
      linkedin: '',
      github: '',
      portfolio: '',
      availabilityStatus: 'Open to Opportunities',
      availabilityType: 'Full-time',
      jobId: '',
      appliedJobIds: [],
    });
  };

  const openCreateModal = () => {
    resetForm();
    setModalMode('create');
    setShowModal(true);
  };

  const openLinkModal = () => {
    setLinkingCandidateId('');
    setLinkingJobId('');
    setShowLinkModal(true);
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || statusConfig.applied;
    const Icon = config.icon;
    return (
      <span className={clsx('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium', config.bg, config.color)}>
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  if (loading && applicants.length === 0) {
    return (
      <AppShell>
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            <p className="mt-4 text-sm text-slate-600">Loading applicants...</p>
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
                Applicants Management
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage candidates, track applications, and analyze talent pool
              </p>
            </div>
            <div className="flex gap-3">
              {/* Menu button for mobile */}
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
                onClick={openLinkModal}
                className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 transition-all hover:bg-blue-100 hover:shadow-md"
              >
                <Link2 className="h-4 w-4" />
                Link to Job
              </button>

              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 transition-all hover:bg-emerald-100 hover:shadow-md"
              >
                <Upload className="h-4 w-4" />
                Bulk Upload
              </button>

              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg"
              >
                <Plus className="h-4 w-4" />
                Add Applicant
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
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-white p-5 shadow-md">
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
                  <Users className="h-5 w-5" />
                </div>
                <span className="text-2xl font-bold text-slate-800">{applicants.length}</span>
              </div>
              <p className="mt-2 text-sm text-slate-500">Total Applicants</p>
            </div>
            <div className="rounded-xl bg-white p-5 shadow-md">
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-emerald-100 p-3 text-emerald-600">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <span className="text-2xl font-bold text-slate-800">
                  {applicants.filter(a => a.applications.some(app => app.status === 'shortlisted')).length}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-500">Shortlisted</p>
            </div>
            <div className="rounded-xl bg-white p-5 shadow-md">
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-purple-100 p-3 text-purple-600">
                  <Briefcase className="h-5 w-5" />
                </div>
                <span className="text-2xl font-bold text-slate-800">
                  {applicants.reduce((acc, a) => acc + a.applications.length, 0)}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-500">Total Applications</p>
            </div>
            <div className="rounded-xl bg-white p-5 shadow-md">
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-amber-100 p-3 text-amber-600">
                  <Star className="h-5 w-5" />
                </div>
                <span className="text-2xl font-bold text-slate-800">
                  {applicants.filter(a => a.candidate.source === 'resume-pdf').length}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-500">Resume Uploads</p>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-md sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-300"
              >
                <option value="all">All Status</option>
                <option value="applied">Applied</option>
                <option value="screened">Screened</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="rejected">Rejected</option>
                <option value="hired">Hired</option>
              </select>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-300"
              >
                <option value="all">All Sources</option>
                <option value="manual">Manual Entry</option>
                <option value="resume-pdf">Resume PDF</option>
                <option value="csv">CSV Import</option>
                <option value="xlsx">Excel Import</option>
                <option value="external-api">External API</option>
              </select>
            </div>
          </div>

          {/* Applicants Table */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                    <th className="px-6 py-4 font-semibold text-slate-600">Applicant</th>
                    <th className="px-6 py-4 font-semibold text-slate-600">Contact</th>
                    <th className="px-6 py-4 font-semibold text-slate-600">Applied Jobs</th>
                    <th className="px-6 py-4 font-semibold text-slate-600">Skills</th>
                    <th className="px-6 py-4 font-semibold text-slate-600">Source</th>
                    <th className="px-6 py-4 font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedApplicants.map((item) => {
                    const fullName = `${item.candidate.firstName} ${item.candidate.lastName}`;
                    const source = sourceConfig[item.candidate.source] || sourceConfig.manual;
                    const SourceIcon = source.icon;

                    return (
                      <tr
                        key={item.candidate._id}
                        className="border-b border-slate-100 transition-all hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent"
                      >
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-md">
                              {item.candidate.firstName[0]}{item.candidate.lastName[0]}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">{fullName}</p>
                              <p className="text-xs text-slate-500">{item.candidate.headline || 'No headline'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs text-slate-600">
                              <Mail className="h-3 w-3" />
                              {item.candidate.email}
                            </div>
                            {item.candidate.location && (
                              <div className="flex items-center gap-1 text-xs text-slate-500">
                                <MapPin className="h-3 w-3" />
                                {item.candidate.location}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {item.applications.length > 0 ? (
                              item.applications.map((app) => (
                                <div key={app.applicationId} className="flex flex-col gap-1">
                                  {getStatusBadge(app.status)}
                                  <span className="text-xs font-medium text-slate-700">
                                    {app.title || 'Unknown Job'}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400">No applications</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {item.candidate.skills?.slice(0, 3).map((skill, i) => (
                              <span
                                key={i}
                                className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                              >
                                {skill.name}
                              </span>
                            ))}
                            {item.candidate.skills && item.candidate.skills.length > 3 && (
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                                +{item.candidate.skills.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={clsx('inline-flex items-center gap-1.5 text-xs font-medium', source.color)}>
                            <SourceIcon className="h-3.5 w-3.5" />
                            {source.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedApplicant(item);
                                setModalMode('view');
                                setShowModal(true);
                              }}
                              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.candidate._id)}
                              className="rounded-lg p-1.5 text-red-500 transition hover:bg-red-50 hover:text-red-700"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
                <p className="text-sm text-slate-500">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredApplicants.length)} of {filteredApplicants.length} applicants
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = currentPage;
                      if (totalPages <= 5) pageNum = i + 1;
                      else if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = currentPage - 2 + i;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={clsx(
                            'h-9 w-9 rounded-lg text-sm font-medium transition',
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                          )}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      {/* ============================================================================
        CREATE APPLICANT MODAL
      ============================================================================ */}
      {showModal && modalMode === 'create' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white p-5">
              <h2 className="text-xl font-bold text-slate-800">Add New Applicant</h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCandidate} className="p-6 space-y-5">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Headline</label>
                <input
                  type="text"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  placeholder="e.g., Senior Software Engineer"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Kigali, Rwanda"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  placeholder="Brief description about the candidate..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                />
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="React, Node.js, Python, SQL, AWS"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                />
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Experience (format: role|company)
                </label>
                <textarea
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="Software Engineer|Tech Corp&#10;Product Manager|Startup Inc"
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                />
                <p className="mt-1 text-xs text-slate-500">One per line. Format: Role | Company</p>
              </div>

              {/* Education */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Education (format: degree|institution)
                </label>
                <textarea
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  placeholder="Bachelor of Science|University of Rwanda&#10;Master of Business Administration|University of Kigali"
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                />
                <p className="mt-1 text-xs text-slate-500">One per line. Format: Degree | Institution</p>
              </div>

              {/* Projects */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Projects (comma-separated)</label>
                <input
                  type="text"
                  value={formData.projects}
                  onChange={(e) => setFormData({ ...formData, projects: e.target.value })}
                  placeholder="E-commerce Platform, Mobile App, API Gateway"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                />
              </div>

              {/* Social Links */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn</label>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">GitHub</label>
                  <input
                    type="url"
                    value={formData.github}
                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                  />
                </div>
              </div>

              {/* Job Linking */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Link to Job (Optional)</label>
                <select
                  value={formData.jobId}
                  onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                >
                  <option value="">-- Select a job --</option>
                  {jobs.map((job) => (
                    <option key={job._id} value={job.jobId}>
                      {job.title} - {job.department}
                    </option>
                  ))}
                </select>
              </div>

              {/* Multiple Job Links */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Link to Multiple Jobs (Optional)</label>
                <select
                  multiple
                  value={formData.appliedJobIds}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setFormData({ ...formData, appliedJobIds: selected });
                  }}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 min-h-[100px]"
                >
                  {jobs.map((job) => (
                    <option key={job._id} value={job.jobId}>
                      {job.title} - {job.department}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-500">Hold Ctrl (Cmd on Mac) to select multiple jobs</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:from-blue-700 hover:to-indigo-700"
                >
                  Create Applicant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================================
        VIEW APPLICANT MODAL
      ============================================================================ */}
      {showModal && modalMode === 'view' && selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white p-5">
              <h2 className="text-xl font-bold text-slate-800">Applicant Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="flex items-start gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-3xl font-bold text-white shadow-lg">
                  {selectedApplicant.candidate.firstName[0]}{selectedApplicant.candidate.lastName[0]}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-800">
                    {selectedApplicant.candidate.firstName} {selectedApplicant.candidate.lastName}
                  </h3>
                  <p className="text-sm text-blue-600">{selectedApplicant.candidate.headline || 'No headline'}</p>
                  <div className="mt-2 flex flex-wrap gap-3">
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <Mail className="h-4 w-4" />
                      {selectedApplicant.candidate.email}
                    </div>
                    {selectedApplicant.candidate.location && (
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <MapPin className="h-4 w-4" />
                        {selectedApplicant.candidate.location}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              {selectedApplicant.candidate.bio && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-slate-700">Bio</h4>
                  <p className="text-sm text-slate-600">{selectedApplicant.candidate.bio}</p>
                </div>
              )}

              {/* Skills */}
              {selectedApplicant.candidate.skills && selectedApplicant.candidate.skills.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-slate-700">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplicant.candidate.skills.map((skill, i) => (
                      <span key={i} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                        {skill.name}
                        {skill.level && ` (${skill.level})`}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {selectedApplicant.candidate.experience && selectedApplicant.candidate.experience.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-slate-700">Experience</h4>
                  <div className="space-y-3">
                    {selectedApplicant.candidate.experience.map((exp, i) => (
                      <div key={i} className="rounded-lg bg-slate-50 p-3">
                        <p className="font-medium text-slate-800">{exp.role}</p>
                        <p className="text-sm text-slate-600">{exp.company}</p>
                        {exp.location && <p className="text-xs text-slate-500">{exp.location}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {selectedApplicant.candidate.education && selectedApplicant.candidate.education.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-slate-700">Education</h4>
                  <div className="space-y-3">
                    {selectedApplicant.candidate.education.map((edu, i) => (
                      <div key={i} className="rounded-lg bg-slate-50 p-3">
                        <p className="font-medium text-slate-800">{edu.degree}</p>
                        <p className="text-sm text-slate-600">{edu.institution}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {selectedApplicant.candidate.projects && selectedApplicant.candidate.projects.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-slate-700">Projects</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplicant.candidate.projects.map((project, i) => (
                      <span key={i} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                        {project.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Links */}
              {selectedApplicant.candidate.socialLinks && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-slate-700">Social Links</h4>
                  <div className="flex gap-3">
                    {selectedApplicant.candidate.socialLinks.linkedin && (
                      <a href={selectedApplicant.candidate.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        LinkedIn
                      </a>
                    )}
                    {selectedApplicant.candidate.socialLinks.github && (
                      <a href={selectedApplicant.candidate.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        GitHub
                      </a>
                    )}
                    {selectedApplicant.candidate.socialLinks.portfolio && (
                      <a href={selectedApplicant.candidate.socialLinks.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        Portfolio
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Availability */}
              {selectedApplicant.candidate.availability && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-slate-700">Availability</h4>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-sm text-slate-800">
                      {selectedApplicant.candidate.availability.status}
                      {selectedApplicant.candidate.availability.type && ` • ${selectedApplicant.candidate.availability.type}`}
                    </p>
                  </div>
                </div>
              )}

              {/* Applications */}
              {selectedApplicant.applications.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-slate-700">Job Applications</h4>
                  <div className="space-y-2">
                    {selectedApplicant.applications.map((app) => (
                      <div key={app.applicationId} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                        <div>
                          <p className="font-medium text-slate-800">{app.title || 'Unknown Position'}</p>
                          <p className="text-xs text-slate-500">
                            Applied: {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        {getStatusBadge(app.status)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Source */}
              <div>
                <h4 className="mb-2 text-sm font-semibold text-slate-700">Source</h4>
                <div className="flex items-center gap-2">
                  {(() => {
                    const SourceIcon = sourceConfig[selectedApplicant.candidate.source]?.icon || UserPlus;
                    return <SourceIcon className="h-4 w-4 text-slate-500" />;
                  })()}
                  <span className="text-sm text-slate-600">
                    {sourceConfig[selectedApplicant.candidate.source]?.label || selectedApplicant.candidate.source}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================
        LINK TO JOB MODAL
      ============================================================================ */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <h2 className="text-xl font-bold text-slate-800">Link Applicant to Job</h2>
              <button
                onClick={() => setShowLinkModal(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Applicant</label>
                <select
                  value={linkingCandidateId}
                  onChange={(e) => setLinkingCandidateId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                >
                  <option value="">-- Select an applicant --</option>
                  {applicants.map((item) => (
                    <option key={item.candidate._id} value={item.candidate._id}>
                      {item.candidate.firstName} {item.candidate.lastName} - {item.candidate.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Job</label>
                <select
                  value={linkingJobId}
                  onChange={(e) => setLinkingJobId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                >
                  <option value="">-- Select a job --</option>
                  {jobs.map((job) => (
                    <option key={job._id} value={job.jobId}>
                      {job.title} - {job.department} ({job.location})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowLinkModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLinkToJob}
                  disabled={linkLoading || !linkingCandidateId || !linkingJobId}
                  className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
                >
                  {linkLoading ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : 'Link to Job'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================
        BULK UPLOAD MODAL
      ============================================================================ */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <h2 className="text-xl font-bold text-slate-800">Bulk Upload Applicants</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Upload Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'json', label: 'JSON', icon: FileJson },
                    { value: 'spreadsheet', label: 'CSV/XLSX', icon: FileSpreadsheet },
                    { value: 'resume', label: 'Resume', icon: FileText },
                  ].map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setUploadType(type.value as any)}
                        className={clsx(
                          'flex flex-col items-center gap-1 rounded-lg border p-3 text-sm font-medium transition',
                          uploadType === type.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Link to Job (Optional)
                </label>
                <select
                  value={uploadJobId}
                  onChange={(e) => setUploadJobId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                >
                  <option value="">-- No job link --</option>
                  {jobs.map((job) => (
                    <option key={job._id} value={job.jobId}>
                      {job.title} - {job.department}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-500">
                  {uploadType === 'json' && 'Upload JSON file with candidates array'}
                  {uploadType === 'spreadsheet' && 'Upload CSV, XLS, or XLSX file'}
                  {uploadType === 'resume' && 'Upload PDF, DOC, or DOCX resume'}
                </p>
              </div>

              <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6">
                <label className="flex cursor-pointer flex-col items-center gap-3">
                  <input
                    type="file"
                    accept={
                      uploadType === 'json'
                        ? '.json'
                        : uploadType === 'spreadsheet'
                        ? '.csv,.xls,.xlsx'
                        : '.pdf,.doc,.docx'
                    }
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setUploadFile(e.target.files[0]);
                      }
                    }}
                  />
                  <Upload className="h-10 w-10 text-slate-400" />
                  <span className="text-sm font-medium text-slate-600">
                    {uploadFile ? uploadFile.name : `Choose ${uploadType.toUpperCase()} file`}
                  </span>
                  <span className="text-xs text-slate-500">
                    Click to browse or drag and drop
                  </span>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkUpload}
                  disabled={!uploadFile || uploading}
                  className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-2.5 text-sm font-medium text-white transition hover:from-emerald-700 hover:to-green-700 disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : 'Upload & Import'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

// Missing Menu icon
const Menu = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
