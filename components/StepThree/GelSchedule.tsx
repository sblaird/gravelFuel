'use client';

import { useApp } from '@/lib/context';

export default function GelSchedule() {
  const { plan } = useApp();

  if (!plan?.gelRecipe || plan.gelRecipe.gelsPerHour === 0) return null;

  const { gelRecipe } = plan;

  return (
    <div className="rounded-xl border-2 border-dashed border-[#E8601C]/30 bg-[#E8601C]/5 p-4 space-y-3">
      <h3 className="text-sm font-bold text-[#E8601C]">
        Gel Schedule — {gelRecipe.gel.name}
      </h3>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-[#1A1A1A]">
          {gelRecipe.gelsPerHour}
        </span>
        <span className="text-sm text-[#444444]">
          {gelRecipe.gelsPerHour === 1 ? 'gel' : 'gels'} per hour
        </span>
      </div>

      <p className="text-sm text-[#1A1A1A]">{gelRecipe.schedule}</p>

      <div className="text-sm text-[#444444]">
        <span className="font-medium">{gelRecipe.carbsFromGelsGhr}g carbs/hr</span>
        {' '}from gels &middot;{' '}
        <span className="font-medium">{gelRecipe.totalGels}</span> gels for the ride
      </div>
    </div>
  );
}
