const STATUS_STYLES = {
  // General / Positive
  OPEN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  COMPLETED: 'bg-brand-50 text-brand-700 border-brand-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CAPTURED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  AVAILABLE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ACCEPTED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  SHORTLISTED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  IN_PROGRESS: 'bg-sky-50 text-sky-700 border-sky-200',

  // Pending / Warning
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  PENDING_ACCEPTANCE: 'bg-amber-50 text-amber-700 border-amber-200',
  SUBMITTED: 'bg-amber-50 text-amber-700 border-amber-200',
  UNDER_REVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
  REVISION_REQUESTED: 'bg-orange-50 text-orange-700 border-orange-200',
  BUSY: 'bg-amber-50 text-amber-700 border-amber-200',
  CREATED: 'bg-slate-100 text-slate-700 border-slate-200',

  // Negative / Closed
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
  DECLINED: 'bg-rose-50 text-rose-700 border-rose-200',
  FAILED: 'bg-rose-50 text-rose-700 border-rose-200',
  SUSPENDED: 'bg-rose-50 text-rose-700 border-rose-200',
  DISPUTED: 'bg-rose-50 text-rose-700 border-rose-200',
  WITHDRAWN: 'bg-slate-100 text-slate-500 border-slate-200',
  CLOSED: 'bg-slate-100 text-slate-600 border-slate-200',
  UNAVAILABLE: 'bg-slate-100 text-slate-500 border-slate-200',
};

export default function Badge({ status, children, className = '' }) {
  const label = children || (status ? status.replace(/_/g, ' ') : '');
  const style = STATUS_STYLES[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style} ${className}`}>
      {label}
    </span>
  );
}
