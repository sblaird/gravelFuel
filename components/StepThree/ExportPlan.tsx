'use client';

import { useApp } from '@/lib/context';
import { INTENSITY_TIERS } from '@/lib/products';

export default function ExportPlan() {
  const { plan } = useApp();

  if (!plan) return null;

  const generateText = (): string => {
    const hours = plan.inputs.durationMinutes / 60;
    const tier = INTENSITY_TIERS.find((t) => t.key === plan.inputs.intensity);
    const dm = plan.drinkMix;
    const gel = plan.gelRecipe;

    let text = `GravelFuel — Ride Fueling Plan\n`;
    text += `${'='.repeat(35)}\n\n`;
    text += `Ride: ${hours.toFixed(1)} hours @ ${tier?.label}\n`;
    text += `Carb Target: ${Math.round(plan.carbTargets.carbTargetGhr)}g/hr (${Math.round(plan.totalCarbsRide)}g total)\n`;
    text += `Hydration: ${plan.hydrationTargets.fluidTargetLhr.toFixed(2)} L/hr\n\n`;

    text += `DRINK MIX (per ${dm.bottleSizeMl} mL bottle)\n`;
    text += `${'-'.repeat(35)}\n`;
    text += `  Water: ${dm.waterMlPerBottle} mL\n`;
    text += `  Gatorade: ${dm.gatoradeScoopsPerBottle} scoop(s)\n`;
    text += `  Sugar: ${dm.sugarGramsPerBottle}g (${dm.sugarTspPerBottle} tsp)\n`;
    text += `  → ${dm.bottlesPerHour} bottles/hr, ${dm.totalBottles} total\n\n`;

    if (gel && gel.gelsPerHour > 0) {
      text += `GEL SCHEDULE\n`;
      text += `${'-'.repeat(35)}\n`;
      text += `  ${gel.gel.name}\n`;
      text += `  ${gel.schedule}\n`;
      text += `  → ${gel.totalGels} gels for the ride\n\n`;
    }

    text += `TOTALS\n`;
    text += `${'-'.repeat(35)}\n`;
    text += `  Bottles: ${dm.totalBottles}\n`;
    text += `  Gels: ${gel?.totalGels ?? 0}\n`;
    text += `  Carbs: ${Math.round(plan.totalCarbsRide)}g\n`;

    return text;
  };

  const handleCopy = async () => {
    const text = generateText();
    await navigator.clipboard.writeText(text);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleCopy}
        className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-bold text-[#444444] transition-colors hover:bg-gray-50"
      >
        Copy as Text
      </button>
      <button
        onClick={handlePrint}
        className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-bold text-[#444444] transition-colors hover:bg-gray-50"
      >
        Print / PDF
      </button>
    </div>
  );
}
