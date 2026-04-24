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

export function getJobs() {
  return request<Job[]>('/jobs');
}

export function getCandidatesWithJobs() {
  return request<CandidateWithJobs[]>('/candidates/with-jobs');
}

export function getScreenings() {
  return request<Screening[]>('/ai/screenings');
}
