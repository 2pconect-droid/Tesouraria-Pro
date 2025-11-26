import { Denomination } from './types';

export const BANKNOTES: Denomination[] = [
  { value: 200, type: 'note', label: 'R$ 200' },
  { value: 100, type: 'note', label: 'R$ 100' },
  { value: 50, type: 'note', label: 'R$ 50' },
  { value: 20, type: 'note', label: 'R$ 20' },
  { value: 10, type: 'note', label: 'R$ 10' },
  { value: 5, type: 'note', label: 'R$ 5' },
  { value: 2, type: 'note', label: 'R$ 2' },
];

export const COINS: Denomination[] = [
  { value: 1, type: 'coin', label: 'R$ 1,00' },
  { value: 0.50, type: 'coin', label: 'R$ 0,50' },
  { value: 0.25, type: 'coin', label: 'R$ 0,25' },
  { value: 0.10, type: 'coin', label: 'R$ 0,10' },
  { value: 0.05, type: 'coin', label: 'R$ 0,05' },
];