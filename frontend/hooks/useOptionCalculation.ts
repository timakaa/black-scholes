import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface OptionInput {
  stock_price: number;
  strike_price: number;
  time_to_maturity: number;
  risk_free_rate: number;
  volatility: number;
}

export function useOptionCalculation(
  input: OptionInput,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ["option-calculation", input],
    queryFn: async () => {
      const response = await axios.post(`${API_URL}/calculate`, input);
      return response.data;
    },
    enabled,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

interface ImpliedVolatilityInput {
  market_price: number;
  stock_price: number;
  strike_price: number;
  time_to_maturity: number;
  risk_free_rate: number;
  is_call: boolean;
}

export function useImpliedVolatility(
  input: ImpliedVolatilityInput,
  enabled: boolean = false,
) {
  return useQuery({
    queryKey: ["implied-volatility", input],
    queryFn: async () => {
      const response = await axios.post(`${API_URL}/implied-volatility`, input);
      return response.data;
    },
    enabled,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
interface HeatmapInput {
  stock_price: number;
  strike_price: number;
  time_to_maturity: number;
  risk_free_rate: number;
  volatility: number;
  min_spot_price: number;
  max_spot_price: number;
  min_volatility: number;
  max_volatility: number;
}

export function useHeatmap(
  heatmapType: string,
  input: HeatmapInput,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ["heatmap", heatmapType, input],
    queryFn: async () => {
      const response = await axios.post(
        `${API_URL}/heatmap/${heatmapType}`,
        input,
      );
      return response.data.image;
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes (heatmaps change less frequently)
    gcTime: 10 * 60 * 1000, // 10 minutes (keep longer due to generation cost)
  });
}
