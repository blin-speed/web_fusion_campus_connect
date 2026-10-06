import React from 'react';

const STEPS = [
  { id: 'payment_pending', label: 'Payment' },
  { id: 'handover', label: 'Handover' },
  { id: 'borrowed', label: 'Active' },
  { id: 'returned', label: 'Returned' },
  { id: 'inspected', label: 'Inspection' },
  { id: 'settled', label: 'Settled' },
  { id: 'rated', label: 'Completed' },
];

export default function StatusStepper({ state }) {
  const currentIndex = STEPS.findIndex((s) => s.id === state);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;
  const isAllDone = state === 'rated' || state === 'cancelled';

  if (state === 'cancelled') {
    return <div className="text-stone-500 font-bold p-4 text-center">Exchange Cancelled</div>;
  }

  return (
    <div className="w-full py-4 overflow-x-auto">
      <div className="flex items-center justify-between min-w-[600px] px-2">
        {STEPS.map((step, idx) => {
          const isDone = idx < activeIndex;
          const isCurrent = idx === activeIndex;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center flex-shrink-0 w-16">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all ${
                    isAllDone && isCurrent
                      ? 'bg-slate-700 text-white'
                      : isCurrent
                      ? 'bg-orange-600 text-white ring-4 ring-orange-100 shadow-sm'
                      : isDone
                      ? 'bg-emerald-500 text-white'
                      : 'bg-stone-200 text-slate-500'
                  }`}
                >
                  {isDone ? '✓' : idx + 1}
                </div>
                <span
                  className={`mt-2 text-xs text-center font-medium ${
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
                  className={`h-1 flex-1 mx-2 rounded-full ${
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
