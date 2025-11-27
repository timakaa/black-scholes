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
} from "recharts";

export default function PriceDistributionChart() {
  const [data, setData] = useState<any[]>([]);

  return (
    <div className='bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20'>
      <h2 className='text-2xl font-bold text-white mb-4'>
        Price Distribution at Expiration
      </h2>
      <div className='h-80'>
        <ResponsiveContainer width='100%' height='100%'>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray='3 3' stroke='#ffffff20' />
            <XAxis
              dataKey='price'
              stroke='#93c5fd'
              label={{
                value: "Stock Price",
                position: "insideBottom",
                offset: -5,
                fill: "#93c5fd",
              }}
            />
            <YAxis
              stroke='#93c5fd'
              label={{
                value: "Probability Density",
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
            <Line
              type='monotone'
              dataKey='value'
              stroke='#3b82f6'
              strokeWidth={2}
              dot={false}
              name='Probability'
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
