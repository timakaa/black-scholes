"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface HeatmapDisplayProps {
  title: string;
  heatmapType: string;
  inputData: any;
}

export default function HeatmapDisplay({
  title,
  heatmapType,
  inputData,
}: HeatmapDisplayProps) {
  const [imageData, setImageData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!inputData) {
      console.log("No input data for heatmap");
      return;
    }

    const fetchHeatmap = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log(`Fetching heatmap: ${heatmapType}`, inputData);
        const response = await axios.post(
          `${API_URL}/heatmap/${heatmapType}`,
          inputData,
        );
        console.log("Heatmap response:", response.data);
        setImageData(response.data.image);
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.detail || "Failed to generate heatmap";
        setError(errorMsg);
        console.error("Heatmap error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHeatmap();
  }, [heatmapType, inputData]);

  return (
    <div className='bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20'>
      <h3 className='text-xl font-bold text-white mb-4'>{title}</h3>

      {loading && (
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
        </div>
      )}

      {error && (
        <div className='flex items-center justify-center h-64'>
          <p className='text-red-400'>{error}</p>
        </div>
      )}

      {imageData && !loading && !error && (
        <div className='rounded-lg overflow-hidden bg-slate-900'>
          <img
            src={imageData}
            alt={title}
            className='w-full h-auto'
            onError={(e) => {
              console.error("Image failed to load:", e);
              setError("Failed to display image");
            }}
            onLoad={() => console.log("Image loaded successfully")}
          />
        </div>
      )}

      {!imageData && !loading && !error && (
        <div className='flex items-center justify-center h-64'>
          <p className='text-blue-300'>Waiting for data...</p>
        </div>
      )}
    </div>
  );
}
