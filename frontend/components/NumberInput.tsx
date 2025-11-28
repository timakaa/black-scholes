interface NumberInputProps {
  label: string;
  name: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onIncrement: () => void;
  onDecrement: () => void;
  step?: string;
  helperText?: string;
}

export default function NumberInput({
  label,
  name,
  value,
  onChange,
  onIncrement,
  onDecrement,
  step = "0.01",
  helperText,
}: NumberInputProps) {
  return (
    <div>
      <label className='block text-sm font-medium text-blue-200 mb-2'>
        {label}
      </label>
      <div className='flex gap-2'>
        <input
          type='number'
          name={name}
          value={value}
          onChange={onChange}
          step={step}
          className='flex-1 px-4 py-2 bg-white/5 border w-full border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
          required
        />
        <button
          type='button'
          onClick={onDecrement}
          className='px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-bold transition-colors'
        >
          −
        </button>
        <button
          type='button'
          onClick={onIncrement}
          className='px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-bold transition-colors'
        >
          +
        </button>
      </div>
      {helperText && <p className='text-xs text-blue-300 mt-1'>{helperText}</p>}
    </div>
  );
}
