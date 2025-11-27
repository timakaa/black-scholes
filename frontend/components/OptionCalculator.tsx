"use client";

import { useState } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface OptionCalculatorProps {
  onCalculate: (data: any) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export default function OptionCalculator({
  onCalculate,
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: parseFloat(e.target.value) || 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/calculate`, formData);
      onCalculate(response.data);
    } catch (error) {
      console.error("Error calculating options:", error);
      alert("Error calculating options. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20'>
      <h2 className='text-2xl font-bold text-white mb-6'>Input Parameters</h2>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-blue-200 mb-2'>
            Stock Price (S)
          </label>
          <input
            type='number'
            name='stock_price'
            value={formData.stock_price}
            onChange={handleChange}
            step='0.01'
            className='w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
            required
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-blue-200 mb-2'>
            Strike Price (K)
          </label>
          <input
            type='number'
            name='strike_price'
            value={formData.strike_price}
            onChange={handleChange}
            step='0.01'
            className='w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
            required
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-blue-200 mb-2'>
            Time to Maturity (Years)
          </label>
          <input
            type='number'
            name='time_to_maturity'
            value={formData.time_to_maturity}
            onChange={handleChange}
            step='0.01'
            className='w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
            required
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-blue-200 mb-2'>
            Risk-Free Rate (r)
          </label>
          <input
            type='number'
            name='risk_free_rate'
            value={formData.risk_free_rate}
            onChange={handleChange}
            step='0.001'
            className='w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
            required
          />
          <p className='text-xs text-blue-300 mt-1'>Example: 0.05 = 5%</p>
        </div>

        <div>
          <label className='block text-sm font-medium text-blue-200 mb-2'>
            Volatility (σ)
          </label>
          <input
            type='number'
            name='volatility'
            value={formData.volatility}
            onChange={handleChange}
            step='0.01'
            className='w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
            required
          />
          <p className='text-xs text-blue-300 mt-1'>Example: 0.2 = 20%</p>
        </div>

        <button
          type='submit'
          disabled={loading}
          className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200'
        >
          {loading ? "Calculating..." : "Calculate"}
        </button>
      </form>
    </div>
  );
}
