import { ArrowUpRight } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

type MetricCardProps = {
  icon: LucideIcon;
  value: string;
  label: string;
  trend: string;
};

export default function MetricCard({
  icon: Icon,
  value,
  label,
  trend,
}: MetricCardProps) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <div className="grid h-10 w-10 place-content-center rounded-lg bg-blue-50 text-blue-600">
          <Icon className="h-5 w-5" />
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
          <ArrowUpRight className="h-3.5 w-3.5" />
          {trend}
        </span>
      </div>
      <p className="mt-4 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}
