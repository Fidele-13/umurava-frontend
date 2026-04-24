'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  TrendingUp,
  Sparkles,
  Eye,
  UserCheck,
  Clock,
  Award,
  Code,
  Building2,
  GraduationCap,
  Loader2,
  ChevronRight,
  Filter,
  Download,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
  FileJson,
  FileSpreadsheet,
  FileText,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import clsx from 'clsx';
import { AppShell, useAppShell } from '@/app/components/app-shell';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || 'https://umurava-jaq4.onrender.com';

export type Job = {
  _id: string;
  jobId: string;
  title: string;
  department: string;
  location: string;
  description: string;
  role?: {
    title: string;
    responsibilities?: string[];
    education?: string[];
  };
  requirements?: {
    requiredSkills?: string[];
    preferredSkills?: string[];
    minYearsExperience?: number;
  };
  requiredSkills?: string[];
  preferredSkills?: string[];
  minYearsExperience?: number;
  isOpen: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type Application = {
  _id: string;
  jobId: string | { _id?: string; jobId?: string };
  candidateId: string;
  status: 'applied' | 'screened' | 'shortlisted' | 'rejected';
  source: string;
  createdAt?: string;
};

export type ScreeningResult = {
  _id: string;
  jobExternalId: string;
  rankedCandidates: Array<{
    candidateId: string;
    score?: number;
    decision?: 'Selected' | 'Consider' | 'Reject';
    reasoning?: string;
  }>;
  createdAt?: string;
};

export type CandidateWithJobs = {
  candidate: {
    _id: string;
  };
  appliedJobIds: string[];
  applications: Array<{
    applicationId: string;
    jobId: string | null;
    mongoJobId: string;
    title: string | null;
    status: 'applied' | 'screened' | 'shortlisted' | 'rejected';
    source: string;
  }>;
};

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

function getJobs() {
  return request<Job[]>('/jobs');
}

function getApplications() {
  return request<Application[]>('/applications');
}

function getScreenings() {
  return request<ScreeningResult[]>('/ai/screenings');
}

function getCandidatesWithJobs() {
  return request<CandidateWithJobs[]>('/candidates/with-jobs');
}

function runAIScreening(jobId: string) {
  return request<{ success: boolean; message: string; screeningId?: string }>(
    `/ai/screen/${jobId}`,
    { method: 'POST' }
  );
}

function createJob(jobData: Partial<Job>) {
  return request<Job>('/jobs', {
    method: 'POST',
    body: JSON.stringify(jobData),
  });
}

function deleteJob(jobId: string) {
  return request<{ success: boolean; deletedJobId: string }>(`/jobs/${jobId}`, {
    method: 'DELETE',
  });
}

function uploadJobsJSON(jobsData: { jobs: Partial<Job>[] }) {
  return request<Job[]>('/jobs/upload/json', {
    method: 'POST',
    body: JSON.stringify(jobsData),
  });
}

function uploadJobsSpreadsheet(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  return fetch(`${API_BASE_URL}/jobs/upload/spreadsheet`, {
    method: 'POST',
    body: formData,
  }).then(res => {
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    return res.json();
  });
}

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function CreateJobModal({ isOpen, onClose, onSuccess }: CreateJobModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    description: '',
    requiredSkills: '',
    preferredSkills: '',
    minYearsExperience: 0,
    isOpen: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const jobData = {
        title: formData.title,
        department: formData.department,
        location: formData.location,
        description: formData.description,
        requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
        preferredSkills: formData.preferredSkills.split(',').map(s => s.trim()).filter(Boolean),
        minYearsExperience: formData.minYearsExperience,
        isOpen: formData.isOpen,
      };
      
      await createJob(jobData);
      onSuccess();
      onClose();
      setFormData({
        title: '',
        department: '',
        location: '',
        description: '',
        requiredSkills: '',
        preferredSkills: '',
        minYearsExperience: 0,
        isOpen: true,
      });
    } catch (err) {
      setError('Failed to create job. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-content-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <Plus className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Create New Job</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Job Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="e.g., Senior Backend Developer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="e.g., Engineering"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="e.g., New York, NY or Remote"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Min Years Experience</label>
              <input
                type="number"
                value={formData.minYearsExperience}
                onChange={(e) => setFormData({ ...formData, minYearsExperience: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="e.g., 3"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="Job description, responsibilities, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Required Skills (comma-separated)
            </label>
            <input
              type="text"
              value={formData.requiredSkills}
              onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="e.g., Node.js, TypeScript, MongoDB"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Preferred Skills (comma-separated)
            </label>
            <input
              type="text"
              value={formData.preferredSkills}
              onChange={(e) => setFormData({ ...formData, preferredSkills: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="e.g., Docker, Kubernetes, AWS"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isOpen}
                onChange={(e) => setFormData({ ...formData, isOpen: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Job is open for applications</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-md hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface UploadJobsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type UploadType = 'json' | 'csv' | 'excel' | null;

function UploadJobsModal({ isOpen, onClose, onSuccess }: UploadJobsModalProps) {
  const [uploadType, setUploadType] = useState<UploadType>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const uploadOptions = [
    { type: 'json' as const, label: 'JSON', icon: FileJson, color: 'from-yellow-500 to-amber-600', description: 'Upload a JSON file with job array' },
    { type: 'csv' as const, label: 'CSV', icon: FileText, color: 'from-green-500 to-emerald-600', description: 'Upload a CSV file with job data' },
    { type: 'excel' as const, label: 'Excel', icon: FileSpreadsheet, color: 'from-emerald-500 to-green-600', description: 'Upload XLS or XLSX file' },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      setSuccess('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (uploadType === 'json') {
        const text = await file.text();
        const jsonData = JSON.parse(text);
        const jobsArray = jsonData.jobs || jsonData.jobProfiles || jsonData.items || jsonData;
        await uploadJobsJSON({ jobs: Array.isArray(jobsArray) ? jobsArray : [jobsArray] });
      } else {
        await uploadJobsSpreadsheet(file);
      }
      
      setSuccess(`Successfully uploaded jobs from ${file.name}`);
      setTimeout(() => {
        onSuccess();
        onClose();
        setFile(null);
        setUploadType(null);
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError('Upload failed. Please check your file format.');
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
            <div className="grid h-10 w-10 place-content-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white">
              <Upload className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Upload Jobs</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {!uploadType ? (
            <div className="grid grid-cols-3 gap-3">
              {uploadOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.type}
                    onClick={() => setUploadType(option.type)}
                    className="group relative overflow-hidden rounded-xl border-2 border-slate-100 p-4 text-center transition-all hover:border-slate-200 hover:shadow-lg"
                  >
                    <div className={`mx-auto mb-3 grid h-14 w-14 place-content-center rounded-xl bg-gradient-to-br ${option.color} text-white shadow-md transition-transform group-hover:scale-105`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">{option.label}</p>
                    <p className="mt-1 text-xs text-slate-500">{option.description}</p>
                  </button>
                );
              })}
            </div>
          ) : (
            <>
              <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={
                    uploadType === 'json' ? '.json' :
                    uploadType === 'csv' ? '.csv' :
                    '.xlsx,.xls'
                  }
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {file ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-emerald-600">
                      <CheckCircle className="h-8 w-8" />
                      <p className="text-sm font-medium">{file.name}</p>
                    </div>
                    <button
                      onClick={() => setFile(null)}
                      className="text-xs text-red-500 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="space-y-3"
                  >
                    <div className="mx-auto grid h-16 w-16 place-content-center rounded-full bg-white shadow-md">
                      <Upload className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-600">Click to select {uploadType.toUpperCase()} file</p>
                    <p className="text-xs text-slate-400">
                      {uploadType === 'json' ? 'JSON array with jobs' : 'CSV/Excel with headers: title, department, location, requiredSkills, etc.'}
                    </p>
                  </button>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                  <AlertTriangle className="h-4 w-4" />
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
                  <CheckCircle className="h-4 w-4" />
                  {success}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setUploadType(null);
                    setFile(null);
                    setError('');
                  }}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!file || loading}
                  className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 text-sm font-medium text-white shadow-md hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Upload'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface DeleteConfirmModalProps {
  job: Job | null;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

function DeleteConfirmModal({ job, onClose, onConfirm, loading }: DeleteConfirmModalProps) {
  if (!job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-content-center rounded-full bg-red-100">
            <Trash2 className="h-7 w-7 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Delete Job</h3>
          <p className="mt-2 text-sm text-slate-500">
            Are you sure you want to delete <span className="font-semibold text-slate-700">{job.title}</span>?
            This action cannot be undone.
          </p>
          
          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


interface JobCardProps {
  job: Job;
  applicantCount: number;
  shortlistedCount: number;
  onViewDetails: (job: Job) => void;
  onViewApplicants: (job: Job) => void;
  onRunAIShortlist: (job: Job) => void;
  onDelete: (job: Job) => void;
}

function JobCard({
  job,
  applicantCount,
  shortlistedCount,
  onViewDetails,
  onViewApplicants,
  onRunAIShortlist,
  onDelete,
}: JobCardProps) {
  const requiredSkills = job.requiredSkills || job.requirements?.requiredSkills || [];
  const displaySkills = requiredSkills.slice(0, 3);
  const hasMoreSkills = requiredSkills.length > 3;

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="absolute right-4 top-4 z-10 flex gap-2">
        <button
          onClick={() => onDelete(job)}
          className="rounded-lg bg-white/90 p-1.5 text-slate-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
          title="Delete job"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <span
          className={clsx(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
            job.isOpen
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-red-50 text-red-700'
          )}
        >
          <span
            className={clsx(
              'h-1.5 w-1.5 rounded-full',
              job.isOpen ? 'bg-emerald-500' : 'bg-red-500'
            )}
          />
          {job.isOpen ? 'Open' : 'Closed'}
        </span>
      </div>

      <div className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-content-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 line-clamp-1">
                {job.title}
              </h3>
              <p className="text-sm text-slate-500">{job.department || 'General'}</p>
            </div>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-3 text-xs text-slate-500">
          {job.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{job.location}</span>
            </div>
          )}
          {job.createdAt && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
            </div>
          )}
          {job.minYearsExperience !== undefined && job.minYearsExperience > 0 && (
            <div className="flex items-center gap-1">
              <Award className="h-3 w-3" />
              <span>{job.minYearsExperience}+ years exp</span>
            </div>
          )}
        </div>

        {displaySkills.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {displaySkills.map((skill, idx) => (
              <span
                key={idx}
                className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
              >
                {skill}
              </span>
            ))}
            {hasMoreSkills && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                +{requiredSkills.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="mb-5 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-800">{applicantCount}</p>
            <p className="text-xs text-slate-500">Applicants</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">{shortlistedCount}</p>
            <p className="text-xs text-slate-500">AI Shortlisted</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onViewDetails(job)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-all duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            <Eye className="h-4 w-4" />
            Details
          </button>
          <button
            onClick={() => onViewApplicants(job)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-all duration-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
          >
            <Users className="h-4 w-4" />
            Applicants
          </button>
          <button
            onClick={() => onRunAIShortlist(job)}
            disabled={applicantCount === 0}
            className={clsx(
              'flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200',
              applicantCount === 0
                ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg'
            )}
          >
            <Sparkles className="h-4 w-4" />
            AI Shortlist
          </button>
        </div>
      </div>
    </div>
  );
}


interface JobDetailsModalProps {
  job: Job | null;
  onClose: () => void;
}

function JobDetailsModal({ job, onClose }: JobDetailsModalProps) {
  if (!job) return null;

  const requiredSkills = job.requiredSkills || job.requirements?.requiredSkills || [];
  const preferredSkills = job.preferredSkills || job.requirements?.preferredSkills || [];
  const responsibilities = job.role?.responsibilities || [];
  const education = job.role?.education || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-content-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <Briefcase className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{job.title}</h2>
              <p className="text-sm text-slate-500">{job.jobId}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4">
            {job.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span className="text-slate-700">{job.location}</span>
              </div>
            )}
            {job.department && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-slate-400" />
                <span className="text-slate-700">{job.department}</span>
              </div>
            )}
            {job.minYearsExperience !== undefined && job.minYearsExperience > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Award className="h-4 w-4 text-slate-400" />
                <span className="text-slate-700">{job.minYearsExperience}+ years experience</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span className="text-slate-700">
                Posted: {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
          </div>
          {job.description && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-800">Description</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{job.description}</p>
            </div>
          )}
          {requiredSkills.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-800">
                <Code className="mb-0.5 mr-1 inline h-3 w-3" />
                Required Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {requiredSkills.map((skill, idx) => (
                  <span key={idx} className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          {preferredSkills.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-800">Preferred Skills</h3>
              <div className="flex flex-wrap gap-2">
                {preferredSkills.map((skill, idx) => (
                  <span key={idx} className="rounded-full bg-purple-50 px-3 py-1.5 text-sm font-medium text-purple-700">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          {responsibilities.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-800">Responsibilities</h3>
              <ul className="space-y-1">
                {responsibilities.map((resp, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                    <ChevronRight className="mt-0.5 h-3 w-3 flex-shrink-0 text-blue-500" />
                    {resp}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {education.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-800">
                <GraduationCap className="mb-0.5 mr-1 inline h-3 w-3" />
                Education Requirements
              </h3>
              <ul className="space-y-1">
                {education.map((edu, idx) => (
                  <li key={idx} className="text-sm text-slate-600">{edu}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  const { openSidebar } = useAppShell();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationCountsByJobId, setApplicationCountsByJobId] = useState<Record<string, number>>({});
  const [screenings, setScreenings] = useState<ScreeningResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState<'all' | 'open' | 'closed'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadJobsData();
  }, []);

  async function loadJobsData() {
    try {
      setLoading(true);
      setError(null);
      const [jobsResult, appsResult, screeningsResult, candidatesWithJobsResult] = await Promise.allSettled([
        getJobs(),
        getApplications(),
        getScreenings(),
        getCandidatesWithJobs(),
      ]);

      if (jobsResult.status === 'rejected') {
        throw jobsResult.reason;
      }

      setJobs(jobsResult.value);
      setApplications(appsResult.status === 'fulfilled' ? appsResult.value : []);
      setScreenings(screeningsResult.status === 'fulfilled' ? screeningsResult.value : []);

      if (candidatesWithJobsResult.status === 'fulfilled') {
        const counts = candidatesWithJobsResult.value.reduce<Record<string, number>>((acc, item) => {
          for (const application of item.applications) {
            const keys = [application.jobId, application.mongoJobId].filter(
              (value): value is string => Boolean(value)
            );

            for (const key of keys) {
              acc[key] = (acc[key] || 0) + 1;
            }
          }
          return acc;
        }, {});

        setApplicationCountsByJobId(counts);
      } else {
        setApplicationCountsByJobId({});
      }
    } catch (err) {
      setError('Failed to load jobs data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const getApplicantCount = (job: Job) => {
    const precomputedCount =
      (applicationCountsByJobId[job.jobId] || 0) 

    if (precomputedCount > 0) {
      return precomputedCount;
    }

    const jobIdentifiers = new Set([job.jobId, job._id].filter(Boolean));

    return applications.filter((app) => {
      if (typeof app.jobId === 'string') {
        return jobIdentifiers.has(app.jobId);
      }

      const nestedId = app.jobId?._id;
      const nestedJobExternalId = app.jobId?.jobId;
      return Boolean(
        (nestedId && jobIdentifiers.has(nestedId)) ||
        (nestedJobExternalId && jobIdentifiers.has(nestedJobExternalId))
      );
    }).length;
  };

  const getShortlistedCount = (jobExternalId: string) => {
    const screening = screenings.find((s) => s.jobExternalId === jobExternalId);
    if (!screening) return 0;
    return screening.rankedCandidates.filter((c) => c.decision === 'Selected').length;
  };

  const handleRunAIShortlist = (job: Job) => {
    sessionStorage.setItem('selectedJob', JSON.stringify(job));
    window.location.href = `/analyse?jobId=${job.jobId}`;
  };

  const handleViewApplicants = (job: Job) => {
    sessionStorage.setItem('selectedJob', JSON.stringify(job));
    window.location.href = `/applicant?jobId=${job.jobId}`;
  };

  const handleDeleteClick = (job: Job) => {
    setJobToDelete(job);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!jobToDelete) return;
    
    setDeleting(true);
    try {
      await deleteJob(jobToDelete.jobId);
      await loadJobsData();
      setShowDeleteModal(false);
      setJobToDelete(null);
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete job. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus =
      filterOpen === 'all' ||
      (filterOpen === 'open' && job.isOpen) ||
      (filterOpen === 'closed' && !job.isOpen);
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-screen">
          <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6">
            <div className="mb-6 h-24 animate-pulse rounded-2xl bg-white shadow-card" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 animate-pulse rounded-2xl bg-white shadow-card" />
              ))}
            </div>
          </div>
        </div>
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="rounded-2xl bg-white p-8 shadow-2xl">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            <p className="mt-4 text-sm font-medium text-slate-700">Loading jobs...</p>
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
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Jobs Management
                </h1>
                <p className="mt-1 text-sm text-slate-500">Manage job postings, upload in bulk, and run AI shortlists</p>
              </div>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none ring-blue-500 transition-all focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </header>

          {/* Action Buttons */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFilterOpen('all')}
                className={clsx(
                  'rounded-xl px-4 py-2 text-sm font-medium transition-all',
                  filterOpen === 'all' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50'
                )}
              >
                All Jobs
              </button>
              <button
                onClick={() => setFilterOpen('open')}
                className={clsx(
                  'rounded-xl px-4 py-2 text-sm font-medium transition-all',
                  filterOpen === 'open' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50'
                )}
              >
                Open
              </button>
              <button
                onClick={() => setFilterOpen('closed')}
                className={clsx(
                  'rounded-xl px-4 py-2 text-sm font-medium transition-all',
                  filterOpen === 'closed' ? 'bg-red-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50'
                )}
              >
                Closed
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2 text-sm font-medium text-purple-700 transition-all hover:shadow-md"
              >
                <Upload className="h-4 w-4" />
                Bulk Upload
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:from-blue-700 hover:to-indigo-700"
              >
                <Plus className="h-4 w-4" />
                Create Job
              </button>
              <button
                onClick={() => loadJobsData()}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 p-4">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          {/* Jobs Grid */}
          {filteredJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center">
              <Briefcase className="h-16 w-16 text-slate-300" />
              <h3 className="mt-4 text-lg font-semibold text-slate-700">No jobs found</h3>
              <p className="mt-1 text-sm text-slate-500">
                {searchTerm ? 'Try adjusting your search' : 'Create your first job posting'}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white"
              >
                <Plus className="h-4 w-4" />
                Create Job
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  applicantCount={getApplicantCount(job)}
                  shortlistedCount={getShortlistedCount(job.jobId)}
                  onViewDetails={setSelectedJob}
                  onViewApplicants={handleViewApplicants}
                  onRunAIShortlist={handleRunAIShortlist}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          )}
        </div>

      {/* Modals */}
      {selectedJob && <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
      {showCreateModal && <CreateJobModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSuccess={loadJobsData} />}
      {showUploadModal && <UploadJobsModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} onSuccess={loadJobsData} />}
      {showDeleteModal && <DeleteConfirmModal job={jobToDelete} onClose={() => setShowDeleteModal(false)} onConfirm={handleConfirmDelete} loading={deleting} />}
    </AppShell>
  );
}
