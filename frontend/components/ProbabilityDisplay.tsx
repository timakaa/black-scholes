interface ProbabilityDisplayProps {
  title: string;
  probabilities: {
    probability_itm: number;
    probability_otm: number;
    expected_value: number;
    break_even_price: number;
  };
  type: "call" | "put";
}

export default function ProbabilityDisplay({
  title,
  probabilities,
  type,
}: ProbabilityDisplayProps) {
  const color = type === "call" ? "green" : "red";

  return (
    <div className='bg-slate-900/60 backdrop-blur-xl rounded-xl p-6 border border-white/10 shadow-2xl'>
      <h3 className='text-xl font-bold text-white mb-4'>{title}</h3>
      <div className='space-y-3'>
        <div
          className={`bg-${color}-500/20 rounded-lg p-3 border border-${color}-500/30`}
        >
          <p className={`text-${color}-200 text-sm`}>Probability ITM</p>
          <p className='text-2xl font-bold text-white'>
            {(probabilities.probability_itm * 100).toFixed(2)}%
          </p>
        </div>
        <div className='bg-white/5 rounded-lg p-3 border border-white/10'>
          <p className='text-blue-200 text-sm'>Probability OTM</p>
          <p className='text-2xl font-bold text-white'>
            {(probabilities.probability_otm * 100).toFixed(2)}%
          </p>
        </div>
        <div className='bg-white/5 rounded-lg p-3 border border-white/10'>
          <p className='text-blue-200 text-sm'>Expected Value</p>
          <p className='text-xl font-bold text-white'>
            ${probabilities.expected_value.toFixed(2)}
          </p>
        </div>
        <div className='bg-white/5 rounded-lg p-3 border border-white/10'>
          <p className='text-blue-200 text-sm'>Break-Even Price</p>
          <p className='text-xl font-bold text-white'>
            ${probabilities.break_even_price.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
