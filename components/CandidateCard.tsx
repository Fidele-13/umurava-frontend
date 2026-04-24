import { TrendingUp } from 'lucide-react';

type CandidateCardProps = {
  name: string;
  role: string;
  percent: string;
};

export default function CandidateCard({
  name,
  role,
  percent,
}: CandidateCardProps) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="rounded-xl border border-blue-100 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-card">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-content-center rounded-full bg-blue-600 text-sm font-bold text-white">
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{name}</p>
            <p className="text-xs text-slate-500">{role}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
          <TrendingUp className="h-3.5 w-3.5" />
          {percent}
        </span>
      </div>
    </div>
  );
}
