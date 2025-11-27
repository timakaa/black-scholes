interface GreeksDisplayProps {
  greeks: {
    call_delta: number;
    put_delta: number;
    gamma: number;
    vega: number;
    call_theta: number;
    put_theta: number;
    call_rho: number;
    put_rho: number;
  };
}

export default function GreeksDisplay({ greeks }: GreeksDisplayProps) {
  const greekItems = [
    {
      name: "Call Delta",
      value: greeks.call_delta,
      description: "Rate of change in call price per $1 change in stock",
    },
    {
      name: "Put Delta",
      value: greeks.put_delta,
      description: "Rate of change in put price per $1 change in stock",
    },
    {
      name: "Gamma",
      value: greeks.gamma,
      description: "Rate of change in delta per $1 change in stock",
    },
    {
      name: "Vega",
      value: greeks.vega,
      description: "Change in price per 1% change in volatility",
    },
    {
      name: "Call Theta",
      value: greeks.call_theta,
      description: "Call price decay per day",
    },
    {
      name: "Put Theta",
      value: greeks.put_theta,
      description: "Put price decay per day",
    },
    {
      name: "Call Rho",
      value: greeks.call_rho,
      description: "Change in call price per 1% change in interest rate",
    },
    {
      name: "Put Rho",
      value: greeks.put_rho,
      description: "Change in put price per 1% change in interest rate",
    },
  ];

  return (
    <div className='bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20'>
      <h2 className='text-2xl font-bold text-white mb-4'>Greeks</h2>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        {greekItems.map((item) => (
          <div
            key={item.name}
            className='bg-white/5 rounded-lg p-4 border border-white/10'
          >
            <p className='text-blue-200 text-xs mb-1'>{item.name}</p>
            <p className='text-2xl font-bold text-white'>
              {item.value.toFixed(4)}
            </p>
            <p className='text-xs text-blue-300 mt-2'>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
