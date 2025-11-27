"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface ProfitLossChartProps {
  optionType: "call" | "put";
}

export default function ProfitLossChart({ optionType }: ProfitLossChartProps) {
  const [data, setData] = useState<any[]>([]);
  const color = optionType === "call" ? "#10b981" : "#ef4444";
  const title = optionType === "call" ? "Call Option" : "Put Option";

  return (
    <div className='bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20'>
      <h3 className='text-xl font-bold text-white mb-4'>{title} Profit/Loss</h3>
      <div className='h-64'>
        <ResponsiveContainer width='100%' height='100%'>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray='3 3' stroke='#ffffff20' />
            <XAxis
              dataKey='price'
              stroke='#93c5fd'
              label={{
                value: "Stock Price at Expiration",
                position: "insideBottom",
                offset: -5,
                fill: "#93c5fd",
              }}
            />
            <YAxis
              stroke='#93c5fd'
              label={{
                value: "Profit/Loss",
                angle: -90,
                position: "insideLeft",
                fill: "#93c5fd",
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #475569",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#93c5fd" }}
            />
            <Legend />
            <ReferenceLine y={0} stroke='#ffffff40' strokeDasharray='3 3' />
            <Line
              type='monotone'
              dataKey='value'
              stroke={color}
              strokeWidth={2}
              dot={false}
              name='P&L'
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
