import React from 'react';

export default function ConditionChecklist({ value, onChange }) {
  const items = [
    'Clean and free of residue / defects',
    'No visible casing or connector damage',
    'All original accessories & probes present',
    'Power test / bench verification passed',
  ];

  const toggle = (idx) => {
    const current = value || [];
    if (current.includes(idx)) {
      onChange(current.filter((i) => i !== idx));
    } else {
      onChange([...current, idx]);
    }
  };

  return (
    <div className="space-y-2 border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 p-3 text-xs">
      <div className="font-semibold uppercase tracking-wider text-neutral-400 mb-2 text-[11px]">
        Hardware Physical Verification Checklist
      </div>
      <div className="space-y-1.5">
        {items.map((item, idx) => {
          const checked = (value || []).includes(idx);
          return (
            <label
              key={idx}
              className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300 cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(idx)}
                className="w-4 h-4 rounded-none border-neutral-400 text-orange-600 focus:ring-0"
              />
              <span className={checked ? 'line-through text-neutral-400' : ''}>{item}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
