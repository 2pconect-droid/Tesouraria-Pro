import React from 'react';
import { Denomination } from '../types';
import { Coins, Banknote } from 'lucide-react';

interface DenominationRowProps {
  denomination: Denomination;
  count: number;
  adjustment: number; // From transactions
  onCountChange: (value: number, count: number) => void;
}

export const DenominationRow: React.FC<DenominationRowProps> = ({ denomination, count, adjustment, onCountChange }) => {
  // Effective count includes physical count + transaction adjustments
  const effectiveCount = Math.max(0, count + adjustment);
  const totalValue = denomination.value * effectiveCount;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    onCountChange(denomination.value, Math.max(0, val));
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-400 transition-colors shadow-sm group relative">
      <div className="flex items-center gap-3 w-1/3">
        <div className={`p-2 rounded-full flex-shrink-0 ${denomination.type === 'note' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
          {denomination.type === 'note' ? <Banknote size={20} /> : <Coins size={20} />}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-slate-700 text-sm sm:text-base truncate">{denomination.label}</span>
          <span className="text-[10px] text-slate-400 font-medium truncate">
             Físico: {count}
          </span>
        </div>
      </div>

      <div className="w-1/3 px-2 flex items-center justify-center">
        <div className="relative w-full max-w-[120px]">
          <input
            type="number"
            value={count === 0 ? '' : count}
            onChange={handleChange}
            placeholder="0"
            className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center font-mono text-lg bg-white text-slate-900 shadow-sm"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">un</span>
          
          {/* Adjustment Badge - Positioned absolutely to prevent layout break */}
          {adjustment !== 0 && (
            <div 
              className={`absolute -top-3 -right-2 flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 rounded-full text-xs font-bold font-mono shadow-sm border border-white z-10 ${
                adjustment > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}
              title="Ajuste via Movimentações"
            >
              {adjustment > 0 ? '+' : ''}{adjustment}
            </div>
          )}
        </div>
      </div>

      <div className="w-1/3 text-right">
        <span className={`font-bold font-mono text-sm sm:text-lg block truncate ${totalValue > 0 ? 'text-slate-900' : 'text-slate-300'}`}>
          {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
      </div>
    </div>
  );
};