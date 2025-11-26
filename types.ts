export type DenominationType = 'note' | 'coin';

export interface Denomination {
  value: number;
  type: DenominationType;
  label: string;
}

export interface CashState {
  [key: number]: number; // value -> count
}

export interface Transaction {
  id: string;
  description: string;
  denominationValue: number; // Value of the specific note/coin (e.g. 100 or 0.50)
  quantity: number; // Number of units
  value: number; // Total value (denom * qty)
  type: 'in' | 'out'; // Entrada vs Saída
}

export interface ExtraInput {
  id: string;
  description: string;
  value: number;
}

export interface DamagedInput {
  notesValue: number;
  coinsValue: number;
}
