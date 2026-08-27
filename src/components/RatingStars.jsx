import React, { useState } from 'react';

export default function RatingStars({ value = null, onChange, interactive = false }) {
  const [hoverValue, setHoverValue] = useState(null);
  const stars = [1, 2, 3, 4, 5];
  const hasRating = typeof value === 'number';
  const displayValue = hoverValue !== null ? hoverValue : (hasRating ? value : 0);

  return (
    <div className="inline-flex items-center gap-1" aria-label={hasRating ? `Rating: ${value} out of 5` : 'Rating: N/A'}>
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange && onChange(star)}
          onMouseEnter={() => interactive && setHoverValue(star)}
          onMouseLeave={() => interactive && setHoverValue(null)}
          className={`text-lg transition-colors ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} ${
            star <= Math.round(displayValue) ? 'text-amber-500' : 'text-gray-300'
          }`}
        >
          ★
        </button>
      ))}
      <span className="ml-1 text-xs text-gray-500">
        {hasRating ? `(${value.toFixed(1)}/5)` : '(N/A)'}
      </span>
    </div>
  );
}
