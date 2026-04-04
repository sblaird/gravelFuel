'use client';

import { useApp } from '@/lib/context';

export default function ProgressBar() {
  const { currentStep } = useApp();

  const steps = [
    { num: 1, label: 'Ride Inputs' },
    { num: 2, label: 'Targets' },
    { num: 3, label: 'Recipe' },
  ];

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {steps.map((step, i) => (
        <div key={step.num} className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
              currentStep >= step.num
                ? 'bg-[#E8601C] text-white'
                : 'bg-gray-200 text-[#444444]'
            }`}
          >
            {step.num}
          </div>
          <span
            className={`text-sm font-medium hidden sm:inline ${
              currentStep >= step.num ? 'text-[#1A1A1A]' : 'text-[#444444]'
            }`}
          >
            {step.label}
          </span>
          {i < steps.length - 1 && (
            <div
              className={`h-0.5 w-8 sm:w-12 ${
                currentStep > step.num ? 'bg-[#E8601C]' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
