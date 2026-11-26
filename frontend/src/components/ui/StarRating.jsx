import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, onChange, size = 'sm', showValue = false }) {
  const iconSize = size === 'lg' ? 'h-6 w-6' : size === 'md' ? 'h-5 w-5' : 'h-4 w-4';
  return (
    <div className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(rating);
        return (
          <button
            key={star}
            type="button"
            disabled={!onChange}
            onClick={() => onChange && onChange(star)}
            className={`${onChange ? 'cursor-pointer hover:scale-110 transition' : 'cursor-default'} focus:outline-none`}
          >
            <Star
              className={`${iconSize} ${filled ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
            />
          </button>
        );
      })}
      {showValue && (
        <span className="ml-1 text-sm font-medium text-slate-700">
          {Number(rating || 0).toFixed(1)}
        </span>
      )}
    </div>
  );
}
