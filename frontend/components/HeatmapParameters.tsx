"use client";

import { useState } from "react";

interface HeatmapParametersProps {
  onParametersChange: (params: HeatmapParams) => void;
}

export interface HeatmapParams {
  minSpotPrice: number;
  maxSpotPrice: number;
  minVolatility: number;
  maxVolatility: number;
}

export default function HeatmapParameters({
  onParametersChange,
}: HeatmapParametersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [params, setParams] = useState<HeatmapParams>({
    minSpotPrice: 70,
    maxSpotPrice: 130,
    minVolatility: 0.1,
    maxVolatility: 0.4,
  });

  const updateParam = (key: keyof HeatmapParams, value: number) => {
    const newParams = { ...params, [key]: value };
    setParams(newParams);
    onParametersChange(newParams);
  };

  const updateValue = (
    field: keyof HeatmapParams,
    delta: number,
    min: number = 0,
  ) => {
    const currentValue = params[field];
    const newValue = currentValue + delta;
    const decimalPlaces = delta.toString().includes(".")
      ? delta.toString().split(".")[1].length
      : 0;
    const roundedValue = Math.max(
      min,
      parseFloat(newValue.toFixed(Math.max(decimalPlaces, 2))),
    );
    updateParam(field, roundedValue);
  };

  return (
    <div className='bg-slate-900/60 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors'
      >
        <h3 className='text-lg font-bold text-white'>Heatmap Parameters</h3>
        <svg
          className={`w-5 h-5 text-blue-300 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M19 9l-7 7-7-7'
          />
        </svg>
      </button>

      {isOpen && (
        <div className='px-6 pb-6 space-y-4 border-t border-white/10 pt-4'>
          <div>
            <label className='block text-sm font-medium text-blue-200 mb-2'>
              Min Spot Price
            </label>
            <div className='flex gap-2'>
              <input
                type='number'
                value={params.minSpotPrice}
                onChange={(e) =>
                  updateParam("minSpotPrice", parseFloat(e.target.value) || 0)
                }
                step='1'
                className='flex-1 px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              <button
                type='button'
                onClick={() => updateValue("minSpotPrice", -5, 1)}
                className='px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-bold transition-colors'
              >
                −
              </button>
              <button
                type='button'
                onClick={() => updateValue("minSpotPrice", 5, 1)}
                className='px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-bold transition-colors'
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-blue-200 mb-2'>
              Max Spot Price
            </label>
            <div className='flex gap-2'>
              <input
                type='number'
                value={params.maxSpotPrice}
                onChange={(e) =>
                  updateParam("maxSpotPrice", parseFloat(e.target.value) || 0)
                }
                step='1'
                className='flex-1 px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              <button
                type='button'
                onClick={() => updateValue("maxSpotPrice", -5, 1)}
                className='px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-bold transition-colors'
              >
                −
              </button>
              <button
                type='button'
                onClick={() => updateValue("maxSpotPrice", 5, 1)}
                className='px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-bold transition-colors'
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-blue-200 mb-2'>
              Min Volatility:{" "}
              <span className='text-red-400'>
                {(params.minVolatility * 100).toFixed(0)}%
              </span>
            </label>
            <input
              type='range'
              min='0.01'
              max='0.5'
              step='0.01'
              value={params.minVolatility}
              onChange={(e) =>
                updateParam("minVolatility", parseFloat(e.target.value))
              }
              className='w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-red-500'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-blue-200 mb-2'>
              Max Volatility:{" "}
              <span className='text-red-400'>
                {(params.maxVolatility * 100).toFixed(0)}%
              </span>
            </label>
            <input
              type='range'
              min='0.01'
              max='1.0'
              step='0.01'
              value={params.maxVolatility}
              onChange={(e) =>
                updateParam("maxVolatility", parseFloat(e.target.value))
              }
              className='w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-red-500'
            />
          </div>
        </div>
      )}
    </div>
  );
}
