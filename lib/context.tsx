'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type {
  IntensityLevel,
  BottleSize,
  GatoradeVariant,
  GelProduct,
  HeatTier,
  UnitSystem,
  WeatherData,
  FuelingPlan,
} from '@/types';
import { buildFuelingPlan, calculateHeatTier } from './calculations';

interface AppState {
  // Step 1
  durationMinutes: number;
  intensity: IntensityLevel | null;

  // Step 2
  customCarbTarget: number | null;
  weatherData: WeatherData | null;
  weatherLoading: boolean;
  weatherError: string | null;
  manualWeather: { temperatureC: number; humidity: number } | null;

  // Step 3
  bottleSize: BottleSize;
  gatoradeVariant: GatoradeVariant;
  selectedGel: GelProduct | null;

  // Global
  unitSystem: UnitSystem;
  currentStep: 1 | 2 | 3;
  plan: FuelingPlan | null;
}

interface AppActions {
  setDuration: (minutes: number) => void;
  setIntensity: (level: IntensityLevel) => void;
  setCustomCarbTarget: (target: number | null) => void;
  setWeatherData: (data: WeatherData | null) => void;
  setWeatherLoading: (loading: boolean) => void;
  setWeatherError: (error: string | null) => void;
  setManualWeather: (data: { temperatureC: number; humidity: number } | null) => void;
  setBottleSize: (size: BottleSize) => void;
  setGatoradeVariant: (variant: GatoradeVariant) => void;
  setSelectedGel: (gel: GelProduct | null) => void;
  setUnitSystem: (system: UnitSystem) => void;
  goToStep: (step: 1 | 2 | 3) => void;
  startOver: () => void;
  recalculate: () => void;
}

const AppContext = createContext<(AppState & AppActions) | null>(null);

const INITIAL_STATE: AppState = {
  durationMinutes: 120,
  intensity: null,
  customCarbTarget: null,
  weatherData: null,
  weatherLoading: false,
  weatherError: null,
  manualWeather: null,
  bottleSize: 750,
  gatoradeVariant: 'thirst_quencher',
  selectedGel: null,
  unitSystem: 'metric',
  currentStep: 1,
  plan: null,
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const saved =
      typeof window !== 'undefined'
        ? localStorage.getItem('gf-units')
        : null;
    return {
      ...INITIAL_STATE,
      unitSystem: saved === 'imperial' ? 'imperial' : 'metric',
    };
  });

  useEffect(() => {
    localStorage.setItem('gf-units', state.unitSystem);
  }, [state.unitSystem]);

  const recalculate = useCallback(() => {
    setState((s) => {
      if (!s.intensity) return { ...s, plan: null };

      const heatTier: HeatTier | null =
        s.manualWeather
          ? calculateHeatTier(
              s.manualWeather.temperatureC,
              s.manualWeather.humidity
            )
          : s.weatherData?.heatTier ?? null;

      const plan = buildFuelingPlan({
        durationMinutes: s.durationMinutes,
        intensity: s.intensity,
        bottleSize: s.bottleSize,
        gatoradeVariant: s.gatoradeVariant,
        gel: s.selectedGel,
        heatTier,
        customCarbTarget: s.customCarbTarget ?? undefined,
      });

      return { ...s, plan };
    });
  }, []);

  const actions: AppActions = {
    setDuration: (minutes) =>
      setState((s) => ({ ...s, durationMinutes: minutes })),
    setIntensity: (level) => setState((s) => ({ ...s, intensity: level })),
    setCustomCarbTarget: (target) =>
      setState((s) => ({ ...s, customCarbTarget: target })),
    setWeatherData: (data) => setState((s) => ({ ...s, weatherData: data })),
    setWeatherLoading: (loading) =>
      setState((s) => ({ ...s, weatherLoading: loading })),
    setWeatherError: (error) =>
      setState((s) => ({ ...s, weatherError: error })),
    setManualWeather: (data) =>
      setState((s) => ({ ...s, manualWeather: data })),
    setBottleSize: (size) => setState((s) => ({ ...s, bottleSize: size })),
    setGatoradeVariant: (variant) =>
      setState((s) => ({ ...s, gatoradeVariant: variant })),
    setSelectedGel: (gel) => setState((s) => ({ ...s, selectedGel: gel })),
    setUnitSystem: (system) => setState((s) => ({ ...s, unitSystem: system })),
    goToStep: (step) => setState((s) => ({ ...s, currentStep: step })),
    startOver: () =>
      setState((s) => ({
        ...INITIAL_STATE,
        unitSystem: s.unitSystem,
      })),
    recalculate,
  };

  return (
    <AppContext.Provider value={{ ...state, ...actions }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
