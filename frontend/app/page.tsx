"use client";

import { useState } from "react";
import OptionCalculator from "@/components/OptionCalculator";
import GreeksDisplay from "@/components/GreeksDisplay";
import ProbabilityDisplay from "@/components/ProbabilityDisplay";
import HeatmapDisplay from "@/components/HeatmapDisplay";
import HeatmapParameters, {
  HeatmapParams,
} from "@/components/HeatmapParameters";

export default function Home() {
  const [optionData, setOptionData] = useState<any>(null);
  const [inputData, setInputData] = useState<any>({
    stock_price: 100,
    strike_price: 100,
    time_to_maturity: 1.0,
    risk_free_rate: 0.05,
    volatility: 0.2,
  });
  const [heatmapParams, setHeatmapParams] = useState<HeatmapParams>({
    minSpotPrice: 70,
    maxSpotPrice: 130,
    minVolatility: 0.1,
    maxVolatility: 0.4,
  });
  const [loading, setLoading] = useState(false);

  const handleCalculate = (data: any, inputs: any) => {
    setOptionData(data);
    setInputData(inputs);
  };

  const handleInputChange = (data: any) => {
    setInputData(data);
  };

  return (
    <main className='min-h-screen p-8 bg-[#070e20]'>
      <div className='max-w-7xl mx-auto relative'>
        <header className='text-center mb-12'>
          <h1 className='text-5xl font-bold text-white mb-4'>
            Black-Scholes Option Pricing
          </h1>
          <p className='text-xl text-blue-200'>
            European Option Calculator with Real-time Greeks & Heatmaps
          </p>
        </header>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Left Column - Input */}
          <div className='lg:col-span-1'>
            <div className='sticky top-8 self-start space-y-4'>
              <OptionCalculator
                onCalculate={handleCalculate}
                onInputChange={handleInputChange}
                loading={loading}
                setLoading={setLoading}
              />
              <HeatmapParameters onParametersChange={setHeatmapParams} />
            </div>
          </div>

          {/* Right Column - Results */}
          <div className='lg:col-span-2 space-y-6'>
            {optionData && (
              <>
                {/* Option Prices */}
                <div className='bg-slate-900/60 backdrop-blur-xl rounded-xl p-6 border border-white/10 shadow-2xl'>
                  <h2 className='text-2xl font-bold text-white mb-4'>
                    Option Prices
                  </h2>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='bg-green-500/20 rounded-lg p-4 border border-green-500/30'>
                      <p className='text-green-200 text-sm mb-1'>Call Price</p>
                      <p className='text-3xl font-bold text-white'>
                        ${optionData.call_price.toFixed(2)}
                      </p>
                    </div>
                    <div className='bg-red-500/20 rounded-lg p-4 border border-red-500/30'>
                      <p className='text-red-200 text-sm mb-1'>Put Price</p>
                      <p className='text-3xl font-bold text-white'>
                        ${optionData.put_price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Greeks */}
                <GreeksDisplay greeks={optionData.greeks} />

                {/* Probabilities */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <ProbabilityDisplay
                    title='Call Option Probabilities'
                    probabilities={optionData.call_probabilities}
                    type='call'
                  />
                  <ProbabilityDisplay
                    title='Put Option Probabilities'
                    probabilities={optionData.put_probabilities}
                    type='put'
                  />
                </div>

                {/* Heatmaps */}
                {inputData && (
                  <div className='space-y-6'>
                    <HeatmapDisplay
                      title='Call Option Price Heatmap'
                      heatmapType='call'
                      inputData={inputData}
                      heatmapParams={heatmapParams}
                    />
                    <HeatmapDisplay
                      title='Put Option Price Heatmap'
                      heatmapType='put'
                      inputData={inputData}
                      heatmapParams={heatmapParams}
                    />
                  </div>
                )}
              </>
            )}

            {!optionData && loading && (
              <div className='bg-slate-900/60 backdrop-blur-xl rounded-xl p-12 border border-white/10 shadow-2xl text-center'>
                <div className='flex flex-col items-center gap-4'>
                  <div className='animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500'></div>
                  <p className='text-xl text-blue-200'>Loading results...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
