import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page = 0, totalPages = 0, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        type="button"
        disabled={page <= 0}
        onClick={() => onPageChange(page - 1)}
        className="btn-secondary px-3 py-2 text-xs disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" /> Prev
      </button>
      <span className="text-sm text-slate-600 px-3">
        Page <span className="font-semibold text-slate-900">{page + 1}</span> of {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages - 1}
        onClick={() => onPageChange(page + 1)}
        className="btn-secondary px-3 py-2 text-xs disabled:opacity-40"
      >
        Next <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
