import React from 'react';

const STEPS = [
  { id: 'accepted', label: 'Accepted' },
  { id: 'payment_pending', label: 'Deposit Due' },
  { id: 'handover', label: 'Handover' },
  { id: 'returned', label: 'Returned' },
  { id: 'inspected', label: 'Inspected' },
  { id: 'settled', label: 'Settled' },
  { id: 'rated', label: 'Completed' },
];

export default function StatusStepper({ exchange }) {
  const currentState = exchange?.state || 'payment_pending';
  const currentIndex = STEPS.findIndex((s) => s.id === currentState);
  const activeIndex = currentIndex === -1 ? 1 : currentIndex;
  const isAllDone = currentState === 'rated';

  return (
    <div className="w-full py-2">
      <div className="flex items-center justify-between">
        {STEPS.map((step, idx) => {
          const isDone = idx < activeIndex;
          const isCurrent = idx === activeIndex;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    isAllDone && isCurrent
                      ? 'bg-slate-700 text-white'
                      : isCurrent
                      ? 'bg-orange-600 text-white ring-2 ring-orange-200 shadow-sm'
                      : isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-200 text-slate-500'
                  }`}
                >
                  {idx + 1}
                </div>
                <span
                  className={`mt-1 text-[11px] text-center max-w-[70px] leading-tight ${
                    isAllDone && isCurrent
                      ? 'font-bold text-slate-700'
                      : isCurrent
                      ? 'font-bold text-orange-600'
                      : isDone
                      ? 'font-medium text-emerald-700'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 min-w-[10px] mx-1 ${
                    idx < activeIndex ? 'bg-emerald-500' : 'bg-stone-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
