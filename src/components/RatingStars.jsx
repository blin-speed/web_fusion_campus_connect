import React, { useState } from 'react';

export default function RatingStars({ value = null, onChange, interactive = false }) {
  const [hoverValue, setHoverValue] = useState(null);
  const stars = [1, 2, 3, 4, 5];
  const hasRating = typeof value === 'number';
  const displayValue = hoverValue !== null ? hoverValue : (hasRating ? value : 0);

  return (
    <div className="inline-flex items-center gap-1 text-xs" aria-label={hasRating ? `Rating: ${value} out of 5` : 'Rating: N/A'}>
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange && onChange(star)}
          onMouseEnter={() => interactive && setHoverValue(star)}
          onMouseLeave={() => interactive && setHoverValue(null)}
          className={`w-4 h-4 text-[10px] font-semibold flex items-center justify-center border transition-colors ${
            interactive ? 'cursor-pointer hover:border-orange-600' : 'cursor-default'
          } ${
            star <= Math.round(displayValue)
              ? 'border-orange-600 bg-orange-600 text-white'
              : 'border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
          }`}
        >
          {star}
        </button>
      ))}
      <span className="ml-1 text-[11px] font-semibold tabular-nums text-neutral-600 dark:text-neutral-400">
        {hasRating ? `${value.toFixed(1)}/5.0` : 'N/A'}
      </span>
    </div>
  );
}
