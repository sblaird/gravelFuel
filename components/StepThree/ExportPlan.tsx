'use client';

import { useApp } from '@/lib/context';
import { INTENSITY_TIERS, DRINK_MIX_PRODUCTS } from '@/lib/products';

export default function ExportPlan() {
  const { plan } = useApp();

  if (!plan) return null;

  const generateText = (): string => {
    const hours = plan.inputs.durationMinutes / 60;
    const tier = INTENSITY_TIERS.find((t) => t.key === plan.inputs.intensity);
    const dm = plan.drinkMix;
    const gel = plan.gelRecipe;
    const hyd = plan.hydrationTargets;

    const gatorade = dm.gatoradeVariant === 'endurance'
      ? DRINK_MIX_PRODUCTS.gatorade_endurance
      : DRINK_MIX_PRODUCTS.gatorade_tq;

    const totalDrinkCarbs = Math.round(dm.carbsFromDrinkGhr * hours);
    const totalScoops = Math.round(dm.gatoradeScoopsPerBottle * dm.bottlesPerHour * hours * 2) / 2;
    const totalScoopCarbs = Math.round(totalScoops * gatorade.carbsPerServing);
    const totalSugarG = totalDrinkCarbs - totalScoopCarbs;
    const totalSugarCups = (totalSugarG / 200).toFixed(2);

    let text = `GravelFuel — Ride Fueling Plan\n`;
    text += `${'='.repeat(40)}\n\n`;
    text += `Ride: ${hours.toFixed(1)} hours @ ${tier?.label}\n`;
    text += `Carb Target: ${Math.round(plan.carbTargets.carbTargetGhr)}g/hr (${Math.round(plan.totalCarbsRide)}g total)\n`;
    text += `Hydration: ${hyd.fluidTargetLhr.toFixed(2)} L/hr (${hyd.totalFluidL.toFixed(1)} L total)\n\n`;

    text += `DRINK MIX (total for ride)\n`;
    text += `${'-'.repeat(40)}\n`;
    text += `  Water: ${hyd.totalFluidL.toFixed(1)} L\n`;
    text += `  ${gatorade.name}: ${totalScoops} scoops (${totalScoopCarbs}g carbs)\n`;
    text += `  Sugar: ~${totalSugarCups} cups (${totalSugarG}g carbs)\n`;
    text += `  Salt: to taste\n`;
    text += `  → Divide into your bottles as needed\n\n`;

    if (gel && gel.gelsPerHour > 0) {
      text += `GEL SCHEDULE\n`;
      text += `${'-'.repeat(40)}\n`;
      text += `  ${gel.gel.name}\n`;
      text += `  ${gel.schedule}\n`;
      text += `  → ${gel.totalGels} gels for the ride\n\n`;
    }

    text += `TOTALS\n`;
    text += `${'-'.repeat(40)}\n`;
    text += `  Carbs from drink: ${totalDrinkCarbs}g\n`;
    text += `  Carbs from gels: ${gel && gel.gelsPerHour > 0 ? Math.round(gel.carbsFromGelsGhr * hours) : 0}g\n`;
    text += `  Total carbs: ${Math.round(plan.totalCarbsRide)}g\n`;
    text += `  Total fluid: ${hyd.totalFluidL.toFixed(1)} L\n`;

    return text;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generateText());
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
        onClick={() => window.print()}
        className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-bold text-[#444444] transition-colors hover:bg-gray-50"
      >
        Print / PDF
      </button>
    </div>
  );
}
