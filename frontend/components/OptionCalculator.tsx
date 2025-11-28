"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import NumberInput from "./NumberInput";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface OptionCalculatorProps {
  onCalculate: (data: any, inputs: any) => void;
  onInputChange?: (data: any) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export default function OptionCalculator({
  onCalculate,
  onInputChange,
  loading,
  setLoading,
}: OptionCalculatorProps) {
  const [formData, setFormData] = useState({
    stock_price: 100,
    strike_price: 100,
    time_to_maturity: 1.0,
    risk_free_rate: 0.05,
    volatility: 0.2,
  });

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const calculateOptions = async (data: any) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/calculate`, data);
      onCalculate(response.data, data);
    } catch (error) {
      console.error("Error calculating options:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer for debounced calculation
    debounceTimer.current = setTimeout(() => {
      calculateOptions(formData);
    }, 500); // 500ms debounce

    // Cleanup
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newData = {
      ...formData,
      [e.target.name]: parseFloat(e.target.value) || 0,
    };
    setFormData(newData);
    onInputChange?.(newData);
  };

  const updateValue = (field: string, delta: number, min: number = 0) => {
    // Calculate new value
    const currentValue = (formData as any)[field];
    const newValue = currentValue + delta;

    // Determine decimal places based on delta
    const decimalPlaces = delta.toString().includes(".")
      ? delta.toString().split(".")[1].length
      : 0;

    // Round to avoid floating point precision issues
    const roundedValue = Math.max(
      min,
      parseFloat(newValue.toFixed(Math.max(decimalPlaces, 2))),
    );

    const newData = {
      ...formData,
      [field]: roundedValue,
    };
    setFormData(newData);
    onInputChange?.(newData);
  };

  return (
    <div className='bg-slate-900/60 backdrop-blur-xl rounded-xl p-6 border border-white/10 shadow-2xl'>
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-2xl font-bold text-white'>Input Parameters</h2>
        {loading && (
          <div className='flex items-center gap-2'>
            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500'></div>
            <span className='text-sm text-blue-300'>Calculating...</span>
          </div>
        )}
      </div>

      <div className='space-y-4'>
        <NumberInput
          label='Stock Price (S)'
          name='stock_price'
          value={formData.stock_price}
          onChange={handleChange}
          onIncrement={() => updateValue("stock_price", 1, 0.01)}
          onDecrement={() => updateValue("stock_price", -1, 0.01)}
          step='0.01'
        />

        <NumberInput
          label='Strike Price (K)'
          name='strike_price'
          value={formData.strike_price}
          onChange={handleChange}
          onIncrement={() => updateValue("strike_price", 1, 0.01)}
          onDecrement={() => updateValue("strike_price", -1, 0.01)}
          step='0.01'
        />

        <NumberInput
          label='Time to Maturity (Years)'
          name='time_to_maturity'
          value={formData.time_to_maturity}
          onChange={handleChange}
          onIncrement={() => updateValue("time_to_maturity", 0.1, 0.01)}
          onDecrement={() => updateValue("time_to_maturity", -0.1, 0.01)}
          step='0.01'
        />

        <NumberInput
          label='Risk-Free Rate (r)'
          name='risk_free_rate'
          value={formData.risk_free_rate}
          onChange={handleChange}
          onIncrement={() => updateValue("risk_free_rate", 0.01, 0)}
          onDecrement={() => updateValue("risk_free_rate", -0.01, 0)}
          step='0.001'
          helperText='Example: 0.05 = 5%'
        />

        <NumberInput
          label='Volatility (σ)'
          name='volatility'
          value={formData.volatility}
          onChange={handleChange}
          onIncrement={() => updateValue("volatility", 0.01, 0.01)}
          onDecrement={() => updateValue("volatility", -0.01, 0.01)}
          step='0.01'
          helperText='Example: 0.2 = 20%'
        />
      </div>
    </div>
  );
}
