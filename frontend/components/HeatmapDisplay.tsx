"use client";

import { useEffect, useState } from "react";
import { useHeatmap } from "@/hooks/useOptionCalculation";

interface HeatmapDisplayProps {
  title: string;
  heatmapType: string;
  inputData: any;
  heatmapParams?: any;
}

export default function HeatmapDisplay({
  title,
  heatmapType,
  inputData,
  heatmapParams,
}: HeatmapDisplayProps) {
  const [debouncedInput, setDebouncedInput] = useState<any>(null);

  // Debounce input changes
  useEffect(() => {
    if (!inputData) return;

    const timer = setTimeout(() => {
      setDebouncedInput({
        ...inputData,
        min_spot_price: heatmapParams?.minSpotPrice || 70,
        max_spot_price: heatmapParams?.maxSpotPrice || 130,
        min_volatility: heatmapParams?.minVolatility || 0.1,
        max_volatility: heatmapParams?.maxVolatility || 0.4,
      });
    }, 800);

    return () => clearTimeout(timer);
  }, [inputData, heatmapParams]);

  // Use React Query for caching
  const {
    data: imageData,
    isLoading,
    error,
  } = useHeatmap(heatmapType, debouncedInput, !!debouncedInput);

  return (
    <div className='bg-slate-900/60 backdrop-blur-xl rounded-xl p-6 border border-white/10 shadow-2xl'>
      <h3 className='text-xl font-bold text-white mb-4'>{title}</h3>

      {isLoading && (
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
        </div>
      )}

      {error && (
        <div className='flex items-center justify-center h-64'>
          <p className='text-red-400'>
            {(error as any)?.response?.data?.detail ||
              "Failed to generate heatmap"}
          </p>
        </div>
      )}

      {imageData && !isLoading && !error && (
        <div className='rounded-lg overflow-hidden bg-slate-900'>
          <img src={imageData} alt={title} className='w-full h-auto' />
        </div>
      )}

      {!imageData && !isLoading && !error && (
        <div className='flex items-center justify-center h-64'>
          <p className='text-blue-300'>Waiting for data...</p>
        </div>
      )}
    </div>
  );
}
