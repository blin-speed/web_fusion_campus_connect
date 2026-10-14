import React from 'react';

const STEPS = [
  { id: 'payment_pending', num: '01', label: 'Payment' },
  { id: 'handover', num: '02', label: 'Handover' },
  { id: 'borrowed', num: '03', label: 'Active' },
  { id: 'returned', num: '04', label: 'Returned' },
  { id: 'inspected', num: '05', label: 'Inspect' },
  { id: 'settled', num: '06', label: 'Settled' },
  { id: 'rated', num: '07', label: 'Completed' },
];

export default function StatusStepper({ state }) {
  const currentIndex = STEPS.findIndex((s) => s.id === state);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;
  const isCancelled = state === 'cancelled';

  if (isCancelled) {
    return (
      <div className="border border-red-600 bg-red-50 dark:bg-red-950/40 p-3 text-center text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
        Exchange Protocol Cancelled / Terminated
      </div>
    );
  }

  return (
    <div className="w-full py-2 overflow-x-auto">
      <div className="flex items-center justify-between min-w-[620px] px-2 text-xs">
        {STEPS.map((step, idx) => {
          const isDone = idx < activeIndex;
          const isCurrent = idx === activeIndex;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center flex-shrink-0 w-20">
                <div
                  className={`w-7 h-7 flex items-center justify-center text-xs font-semibold border transition-colors ${
                    isCurrent
                      ? 'border-orange-600 bg-orange-600 text-white shadow'
                      : isDone
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {isDone ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.num
                  )}
                </div>
                <span
                  className={`mt-1.5 text-[10px] text-center font-semibold tracking-wider uppercase ${
                    isCurrent
                      ? 'text-orange-600 dark:text-orange-400'
                      : isDone
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-neutral-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-1.5 transition-colors ${
                    idx < activeIndex
                      ? 'bg-emerald-600'
                      : 'bg-neutral-200 dark:bg-neutral-800'
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
