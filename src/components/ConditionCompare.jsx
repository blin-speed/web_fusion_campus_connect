import React from 'react';

export default function ConditionCompare({ conditionBefore, conditionAfter }) {
  const parseCondition = (c) => {
    try {
      return typeof c === 'string' && c.startsWith('{') ? JSON.parse(c) : { notes: c || 'None' };
    } catch {
      return { notes: 'Invalid condition data' };
    }
  };

  const before = parseCondition(conditionBefore);
  const after = parseCondition(conditionAfter);

  return (
    <div className="grid grid-cols-2 gap-4 mt-4 bg-stone-50 p-4 rounded-lg border">
      <div>
        <h4 className="text-sm font-bold text-slate-700">Before (Handover)</h4>
        <p className="text-sm text-slate-600 mt-1">{before.notes}</p>
      </div>
      <div>
        <h4 className="text-sm font-bold text-slate-700">After (Inspection)</h4>
        <p className="text-sm text-slate-600 mt-1">{after.notes}</p>
      </div>
    </div>
  );
}
