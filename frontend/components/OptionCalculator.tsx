"use client";

import { useState, useEffect } from "react";
import NumberInput from "./NumberInput";
import { useOptionCalculation } from "@/hooks/useOptionCalculation";

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
  const [formData, setFormData] = useState<{
    stock_price: number | string;
    strike_price: number | string;
    time_to_maturity: number | string;
    risk_free_rate: number | string;
    volatility: number | string;
  }>({
    stock_price: 100,
    strike_price: 100,
    time_to_maturity: 1.0,
    risk_free_rate: 0.05,
    volatility: 0.2,
  });

  const [debouncedFormData, setDebouncedFormData] = useState({
    stock_price: 100,
    strike_price: 100,
    time_to_maturity: 1.0,
    risk_free_rate: 0.05,
    volatility: 0.2,
  });
  const [isValid, setIsValid] = useState(true);

  // Convert form data to numbers for validation and API
  const getNumericFormData = () => {
    return {
      stock_price:
        typeof formData.stock_price === "string"
          ? parseFloat(formData.stock_price) || 0
          : formData.stock_price,
      strike_price:
        typeof formData.strike_price === "string"
          ? parseFloat(formData.strike_price) || 0
          : formData.strike_price,
      time_to_maturity:
        typeof formData.time_to_maturity === "string"
          ? parseFloat(formData.time_to_maturity) || 0
          : formData.time_to_maturity,
      risk_free_rate:
        typeof formData.risk_free_rate === "string"
          ? parseFloat(formData.risk_free_rate) || 0
          : formData.risk_free_rate,
      volatility:
        typeof formData.volatility === "string"
          ? parseFloat(formData.volatility) || 0
          : formData.volatility,
    };
  };

  // Validate form data
  const validateFormData = (data: ReturnType<typeof getNumericFormData>) => {
    return (
      data.stock_price > 0 &&
      data.strike_price > 0 &&
      data.time_to_maturity > 0 &&
      data.risk_free_rate >= 0 &&
      data.risk_free_rate <= 1 &&
      data.volatility > 0 &&
      data.volatility <= 5
    );
  };

  // Debounce form data changes
  useEffect(() => {
    const numericData = getNumericFormData();
    const valid = validateFormData(numericData);
    setIsValid(valid);

    if (!valid) return;

    const timer = setTimeout(() => {
      setDebouncedFormData(numericData);
    }, 500);

    return () => clearTimeout(timer);
  }, [formData]);

  // Use React Query for caching - only enabled when data is valid
  const { data, isLoading, isFetching } = useOptionCalculation(
    debouncedFormData,
    isValid,
  );

  // Update parent component when data changes (only if valid)
  useEffect(() => {
    if (data && isValid) {
      onCalculate(data, debouncedFormData);
    }
  }, [data, debouncedFormData, isValid]);

  // Update loading state
  useEffect(() => {
    setLoading(isLoading || isFetching);
  }, [isLoading, isFetching, setLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const newData = {
      ...formData,
      [e.target.name]: value === "" ? "" : value,
    };
    setFormData(newData);

    // Only notify parent with numeric data
    const numericData = {
      ...formData,
      [e.target.name]: parseFloat(value) || 0,
    };
    onInputChange?.(numericData);
  };

  const updateValue = (field: string, delta: number, min: number = 0) => {
    // Calculate new value
    const currentValue = (formData as any)[field];
    const numericValue =
      typeof currentValue === "string"
        ? parseFloat(currentValue) || 0
        : currentValue;
    const newValue = numericValue + delta;

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
      <div className='mb-6'>
        <div className='flex items-center justify-between mb-2'>
          <h2 className='text-2xl font-bold text-white'>Input Parameters</h2>
          {loading && isValid && (
            <div className='flex items-center gap-2'>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500'></div>
              <span className='text-sm text-blue-300'>Calculating...</span>
            </div>
          )}
        </div>
        {!isValid && (
          <div className='flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg'>
            <span className='text-sm text-yellow-400'>
              ⚠ Invalid input - please enter valid values
            </span>
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
