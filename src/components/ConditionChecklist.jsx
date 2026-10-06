import React from 'react';

export default function ConditionChecklist({ value, onChange }) {
  const items = [
    'Clean and presentable',
    'No visible damages',
    'All parts included',
    'Working as expected'
  ];

  const toggle = (idx) => {
    const current = value || [];
    if (current.includes(idx)) {
      onChange(current.filter(i => i !== idx));
    } else {
      onChange([...current, idx]);
    }
  };

  return (
    <div className="space-y-2 mt-2">
      <p className="text-sm font-semibold text-slate-700">Checklist</p>
      {items.map((item, idx) => (
        <label key={idx} className="flex items-center gap-2 text-sm text-slate-600">
          <input 
            type="checkbox" 
            checked={(value || []).includes(idx)} 
            onChange={() => toggle(idx)} 
            className="rounded text-orange-600"
          />
          {item}
        </label>
      ))}
    </div>
  );
}
