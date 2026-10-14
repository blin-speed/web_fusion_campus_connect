import React from 'react';

export default function ConditionCompare({ conditionBefore, conditionAfter }) {
  const parseCondition = (c) => {
    try {
      return typeof c === 'string' && c.startsWith('{') ? JSON.parse(c) : { notes: c || 'No recorded notes' };
    } catch {
      return { notes: 'Unparseable condition data' };
    }
  };

  const before = parseCondition(conditionBefore);
  const after = parseCondition(conditionAfter);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-4 text-xs">
      <div className="border border-neutral-200 dark:border-neutral-800 p-3 bg-white dark:bg-neutral-950">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
          Initial Condition // Handover
        </div>
        <p className="text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap text-xs">
          {before.notes || 'No remarks recorded at handover.'}
        </p>
      </div>

      <div className="border border-neutral-200 dark:border-neutral-800 p-3 bg-white dark:bg-neutral-950">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
          Return Condition // Post-Inspection
        </div>
        <p className="text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap text-xs">
          {after.notes || 'Pending owner return inspection.'}
        </p>
      </div>
    </div>
  );
}
