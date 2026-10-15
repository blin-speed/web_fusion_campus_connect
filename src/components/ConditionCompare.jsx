import React from 'react';

export default function ConditionCompare({ conditionBefore, conditionAfter }) {
  const parseCondition = (c) => {
    if (!c) return { notes: '' };
    if (typeof c === 'object') return c;
    try {
      if (typeof c === 'string' && (c.startsWith('{') || c.startsWith('['))) {
        return JSON.parse(c);
      }
    } catch {
      // ignore
    }
    return { notes: c || '' };
  };

  const before = parseCondition(conditionBefore);
  const after = parseCondition(conditionAfter);

  const renderPhotoGallery = (photoIds, label) => {
    if (!Array.isArray(photoIds) || photoIds.length === 0) return null;
    return (
      <div className="mt-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
          {label} ({photoIds.length})
        </div>
        <div className="flex flex-wrap gap-2">
          {photoIds.map((pid) => (
            <a
              key={pid}
              href={`/api/v1/files/${pid}`}
              target="_blank"
              rel="noreferrer"
              className="group block relative w-20 h-20 border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 overflow-hidden"
              title="Click to view full photo"
            >
              <img
                src={`/api/v1/files/${pid}`}
                alt="Condition snapshot"
                className="object-cover w-full h-full group-hover:scale-105 transition-transform"
              />
            </a>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-4 text-xs">
      <div className="border border-neutral-200 dark:border-neutral-800 p-3 bg-white dark:bg-neutral-950 flex flex-col justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
            Initial Condition // Handover
          </div>
          <p className="text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap text-xs">
            {before.notes || 'No remarks recorded at handover.'}
          </p>

          {Array.isArray(before.checklist) && before.checklist.length > 0 && (
            <div className="mt-2.5 text-[11px] text-neutral-600 dark:text-neutral-400">
              <span className="font-semibold uppercase text-[10px] tracking-wider text-neutral-400 block mb-1">
                Verified Checklist:
              </span>
              <ul className="list-disc list-inside space-y-0.5">
                {before.checklist.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {renderPhotoGallery(before.photoIds, 'Handover Photos')}
      </div>

      <div className="border border-neutral-200 dark:border-neutral-800 p-3 bg-white dark:bg-neutral-950 flex flex-col justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
            Return Condition // Post-Inspection
          </div>
          <p className="text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap text-xs">
            {after.notes || 'Pending owner return inspection.'}
          </p>
        </div>

        {renderPhotoGallery(after.photoIds, 'Return Photos')}
      </div>
    </div>
  );
}
