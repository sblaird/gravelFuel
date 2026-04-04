'use client';

import { useApp } from '@/lib/context';

export default function UnitToggle() {
  const { unitSystem, setUnitSystem } = useApp();

  return (
    <button
      onClick={() =>
        setUnitSystem(unitSystem === 'metric' ? 'imperial' : 'metric')
      }
      className="rounded-full border border-[#444444] px-3 py-1 text-xs font-medium text-[#444444] transition-colors hover:bg-[#444444] hover:text-white"
      aria-label={`Switch to ${unitSystem === 'metric' ? 'US customary' : 'metric'} units`}
    >
      {unitSystem === 'metric' ? '°C / mL' : '°F / fl oz'}
    </button>
  );
}
