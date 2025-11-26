import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  colorClass: string;
  isTotal?: boolean;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon: Icon, colorClass, isTotal = false }) => {
  return (
    <div className={`p-4 rounded-xl border shadow-sm flex items-center justify-between ${isTotal ? 'bg-slate-900 text-white border-slate-800' : 'bg-white border-slate-200'}`}>
      <div>
        <p className={`text-sm font-medium ${isTotal ? 'text-slate-400' : 'text-slate-500'}`}>{title}</p>
        <p className={`text-2xl font-bold font-mono mt-1 ${!isTotal && colorClass}`}>
          {value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
      </div>
      <div className={`p-3 rounded-lg ${isTotal ? 'bg-slate-800' : 'bg-slate-50'}`}>
        <Icon className={isTotal ? 'text-blue-400' : 'text-slate-400'} size={24} />
      </div>
    </div>
  );
};