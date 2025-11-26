import React, { useState, useMemo, useCallback } from 'react';
import { 
  Calculator, 
  RotateCcw, 
  Wallet, 
  Coins, 
  AlertTriangle, 
  ArrowUpCircle, 
  ArrowRightLeft,
  Plus, 
  Trash2, 
  Save,
  Info,
  TrendingUp,
  TrendingDown,
  Banknote,
  Hash
} from 'lucide-react';
import { BANKNOTES, COINS } from './constants';
import { CashState, DamagedInput, ExtraInput, Transaction } from './types';
import { DenominationRow } from './components/DenominationRow';
import { SummaryCard } from './components/SummaryCard';

// Initial States definitions (used for types/structure, but reset logic will recreate them)
const initialCounts: CashState = {};
[...BANKNOTES, ...COINS].forEach(d => initialCounts[d.value] = 0);

const initialDamaged: DamagedInput = { notesValue: 0, coinsValue: 0 };

const initialExtras: ExtraInput[] = [
  { id: '1', description: 'Entrada Extra 1', value: 0 },
  { id: '2', description: 'Entrada Extra 2', value: 0 },
];

const App: React.FC = () => {
  // --- State ---
  const [counts, setCounts] = useState<CashState>(initialCounts);
  const [damaged, setDamaged] = useState<DamagedInput>(initialDamaged);
  const [extras, setExtras] = useState<ExtraInput[]>(initialExtras);
  
  // Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [newTrans, setNewTrans] = useState({ 
    description: '', 
    denominationValue: BANKNOTES[0].value, // Default to first note
    quantity: '',
    type: 'out' as 'in' | 'out', 
  });

  // --- Handlers ---
  const handleCountChange = useCallback((value: number, count: number) => {
    setCounts(prev => ({ ...prev, [value]: count }));
  }, []);

  const handleDamagedChange = (type: 'notesValue' | 'coinsValue', value: string) => {
    const num = parseFloat(value) || 0;
    setDamaged(prev => ({ ...prev, [type]: num }));
  };

  const handleExtraChange = (id: string, field: 'description' | 'value', value: string) => {
    setExtras(prev => prev.map(item => {
      if (item.id === id) {
        return { 
          ...item, 
          [field]: field === 'value' ? (parseFloat(value) || 0) : value 
        };
      }
      return item;
    }));
  };

  const addTransaction = () => {
    const qty = parseInt(newTrans.quantity);
    if (!qty || qty <= 0) return;
    
    // Description is optional now
    const description = newTrans.description.trim() || 'Sem descrição';

    setTransactions(prev => [
      ...prev,
      { 
        id: Date.now().toString(), 
        description: description, 
        denominationValue: newTrans.denominationValue,
        quantity: qty,
        value: newTrans.denominationValue * qty,
        type: newTrans.type
      }
    ]);
    setNewTrans(prev => ({ ...prev, description: '', quantity: '' }));
  };

  const removeTransaction = (id: string) => {
    setTransactions(prev => prev.filter(item => item.id !== id));
  };

  const resetAll = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os dados?')) {
      // 1. Reset Counts
      const zeroCounts: CashState = {};
      [...BANKNOTES, ...COINS].forEach(d => zeroCounts[d.value] = 0);
      setCounts(zeroCounts);

      // 2. Reset Damaged
      setDamaged({ notesValue: 0, coinsValue: 0 });

      // 3. Reset Extras (restore defaults)
      setExtras([
        { id: '1', description: 'Entrada Extra 1', value: 0 },
        { id: '2', description: 'Entrada Extra 2', value: 0 },
      ]);

      // 4. Reset Transactions
      setTransactions([]);
      setNewTrans({ description: '', quantity: '', type: 'out', denominationValue: BANKNOTES[0].value });
    }
  };

  // --- Calculations ---
  
  // 1. Calculate Unit Adjustments per Denomination
  const unitAdjustments = useMemo(() => {
    const adj: Record<number, number> = {};
    // Initialize with 0
    [...BANKNOTES, ...COINS].forEach(d => adj[d.value] = 0);
    
    transactions.forEach(t => {
      const factor = t.type === 'in' ? 1 : -1;
      if (adj[t.denominationValue] !== undefined) {
        adj[t.denominationValue] += (t.quantity * factor);
      }
    });
    return adj;
  }, [transactions]);

  const totals = useMemo(() => {
    // 2. Calculate Effective Totals (Physical + Adjustment) * Value
    let totalNotes = 0;
    let totalCoins = 0;

    // Notes
    BANKNOTES.forEach(note => {
      const physical = counts[note.value] || 0;
      const adjustment = unitAdjustments[note.value] || 0;
      const effectiveCount = Math.max(0, physical + adjustment); // Prevent negative totals if needed, or allow them? Assuming min 0 for value logic.
      totalNotes += effectiveCount * note.value;
    });

    // Coins
    COINS.forEach(coin => {
      const physical = counts[coin.value] || 0;
      const adjustment = unitAdjustments[coin.value] || 0;
      const effectiveCount = Math.max(0, physical + adjustment);
      totalCoins += effectiveCount * coin.value;
    });
    
    // 3. Other totals
    const damagedTotal = damaged.notesValue + damaged.coinsValue;
    const extrasTotal = extras.reduce((acc, curr) => acc + curr.value, 0);

    // 4. Final Calculations
    const physicalCash = totalNotes + totalCoins + damagedTotal;
    const grandTotal = physicalCash + extrasTotal;

    return {
      notes: totalNotes,
      coins: totalCoins,
      damaged: damagedTotal,
      extras: extrasTotal,
      physical: physicalCash,
      grandTotal: grandTotal,
    };
  }, [counts, damaged, extras, unitAdjustments]);

  // Helper to find denomination details
  const getDenomLabel = (val: number) => {
    const d = [...BANKNOTES, ...COINS].find(i => i.value === val);
    return d ? d.label : `R$ ${val}`;
  };
  
  const getDenomType = (val: number) => {
    const d = [...BANKNOTES, ...COINS].find(i => i.value === val);
    return d ? d.type : 'note';
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Calculator className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Tesouraria<span className="text-blue-600">Pro</span></h1>
          </div>
          <div className="flex items-center gap-3">
             <button 
              type="button"
              onClick={resetAll}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw size={16} />
              <span className="hidden sm:inline">Limpar Tudo</span>
            </button>
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm"
            >
              <Save size={16} />
              <span className="hidden sm:inline">Salvar / Imprimir</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Top Summaries */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <SummaryCard 
            title="Total Cédulas" 
            value={totals.notes} 
            icon={Wallet} 
            colorClass="text-emerald-600" 
          />
          <SummaryCard 
            title="Total Moedas" 
            value={totals.coins} 
            icon={Coins} 
            colorClass="text-amber-600" 
          />
          <SummaryCard 
            title="Fundo de Caixa (Físico)" 
            value={totals.physical} 
            icon={Calculator} 
            colorClass="text-blue-600" 
          />
          <SummaryCard 
            title="Saldo Líquido Final" 
            value={totals.grandTotal} 
            icon={Calculator} 
            colorClass="text-white" 
            isTotal={true}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Main Column (Counting) */}
          <div className="xl:col-span-8 space-y-8">
            
            {/* Banknotes Section */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Wallet className="text-emerald-500" size={20} />
                  Contagem de Cédulas
                </h2>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    {totals.notes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {BANKNOTES.map(note => (
                  <DenominationRow 
                    key={note.value} 
                    denomination={note} 
                    count={counts[note.value]} 
                    adjustment={unitAdjustments[note.value] || 0}
                    onCountChange={handleCountChange} 
                  />
                ))}
              </div>
            </section>

            {/* Coins Section */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Coins className="text-amber-500" size={20} />
                  Contagem de Moedas
                </h2>
                 <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                    {totals.coins.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {COINS.map(coin => (
                  <DenominationRow 
                    key={coin.value} 
                    denomination={coin} 
                    count={counts[coin.value]} 
                    adjustment={unitAdjustments[coin.value] || 0}
                    onCountChange={handleCountChange} 
                  />
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Column (Extras, Damaged, Transactions) */}
          <div className="xl:col-span-4 space-y-8">

             {/* Damaged Section */}
             <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ring-1 ring-orange-100">
              <div className="px-6 py-4 border-b border-slate-100 bg-orange-50/50">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <AlertTriangle className="text-orange-500" size={20} />
                  Dilacerados
                </h2>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Info size={12} />
                  Soma ao Fundo de Caixa Físico
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cédulas Dilaceradas</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">R$</span>
                    <input 
                      type="number" 
                      step="0.01"
                      value={damaged.notesValue === 0 ? '' : damaged.notesValue}
                      onChange={(e) => handleDamagedChange('notesValue', e.target.value)}
                      placeholder="0,00"
                      className="w-full pl-10 pr-4 py-2 bg-white text-slate-900 border border-orange-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 placeholder-slate-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Moedas Dilaceradas</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">R$</span>
                    <input 
                      type="number" 
                      step="0.01"
                      value={damaged.coinsValue === 0 ? '' : damaged.coinsValue}
                      onChange={(e) => handleDamagedChange('coinsValue', e.target.value)}
                      placeholder="0,00"
                      className="w-full pl-10 pr-4 py-2 bg-white text-slate-900 border border-orange-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 placeholder-slate-400"
                    />
                  </div>
                </div>
                <div className="pt-3 border-t border-dashed border-orange-200 flex justify-between items-center">
                  <span className="text-sm text-slate-600 font-medium">Total Dilacerado</span>
                  <span className="font-mono font-bold text-orange-600 text-lg">
                    {totals.damaged.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>
            </section>

             {/* Transactions Section */}
             <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <ArrowRightLeft className="text-purple-500" size={20} />
                  Movimentações
                </h2>
                <p className="text-xs text-slate-500 mt-1">Adiciona/Remove unidades da contagem</p>
              </div>
              <div className="p-6">
                
                {/* Transaction Controls */}
                <div className="mb-4 space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {/* Type Toggle */}
                    <div className="flex rounded-md shadow-sm" role="group">
                        <button
                            type="button"
                            onClick={() => setNewTrans(prev => ({...prev, type: 'in'}))}
                            className={`flex-1 px-3 py-2 text-xs font-medium rounded-l-lg border transition-all ${newTrans.type === 'in' ? 'bg-green-100 text-green-700 border-green-200 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                        >
                            <div className="flex items-center justify-center gap-1">
                                <TrendingUp size={14} /> Entrada
                            </div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setNewTrans(prev => ({...prev, type: 'out'}))}
                            className={`flex-1 px-3 py-2 text-xs font-medium rounded-r-lg border-t border-b border-r transition-all ${newTrans.type === 'out' ? 'bg-red-100 text-red-700 border-red-200 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                        >
                            <div className="flex items-center justify-center gap-1">
                                <TrendingDown size={14} /> Saída
                            </div>
                        </button>
                    </div>

                    {/* Denomination Select & Quantity */}
                    <div className="flex gap-2">
                      <div className="w-1/2">
                         <label className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">Tipo</label>
                         <select
                           value={newTrans.denominationValue}
                           onChange={(e) => setNewTrans(prev => ({...prev, denominationValue: parseFloat(e.target.value)}))}
                           className="w-full text-sm text-slate-900 border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                         >
                            <optgroup label="Cédulas" className="text-slate-900">
                              {BANKNOTES.map(b => (
                                <option key={b.value} value={b.value} className="text-slate-900">{b.label}</option>
                              ))}
                            </optgroup>
                            <optgroup label="Moedas" className="text-slate-900">
                              {COINS.map(c => (
                                <option key={c.value} value={c.value} className="text-slate-900">{c.label}</option>
                              ))}
                            </optgroup>
                         </select>
                      </div>
                      <div className="w-1/2">
                         <label className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">Qtd (Un)</label>
                         <div className="relative">
                            <Hash size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="number" 
                                placeholder="1" 
                                min="1"
                                className="w-full pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-900 bg-white"
                                value={newTrans.quantity}
                                onChange={(e) => setNewTrans(prev => ({ ...prev, quantity: e.target.value }))}
                            />
                         </div>
                      </div>
                    </div>

                    {/* Description & Add */}
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Descrição (opcional)" 
                            className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-900 bg-white"
                            value={newTrans.description}
                            onChange={(e) => setNewTrans(prev => ({ ...prev, description: e.target.value }))}
                            onKeyDown={(e) => e.key === 'Enter' && addTransaction()}
                        />
                         <button 
                            onClick={addTransaction}
                            disabled={!newTrans.quantity}
                            className="p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm cursor-pointer"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="space-y-3 max-h-60 overflow-y-auto mb-4 custom-scrollbar">
                  {transactions.length === 0 && (
                    <p className="text-center text-sm text-slate-400 py-4 italic">Nenhuma movimentação</p>
                  )}
                  {transactions.map(item => (
                    <div key={item.id} className={`flex items-center justify-between p-2 rounded-md border ${item.type === 'in' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                      <div className="flex flex-col overflow-hidden flex-1 mr-2">
                           <div className="flex items-center gap-1 text-xs font-semibold text-slate-600 mb-0.5">
                              {getDenomType(item.denominationValue) === 'note' ? <Banknote size={10} /> : <Coins size={10} />}
                              {getDenomLabel(item.denominationValue)} 
                              <span className="text-slate-400 font-normal">x {item.quantity} un</span>
                           </div>
                          <span className={`text-sm truncate ${item.type === 'in' ? 'text-green-900' : 'text-red-900'}`}>{item.description}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-mono font-bold ${item.type === 'in' ? 'text-green-700' : 'text-red-700'}`}>
                          {item.type === 'in' ? '+' : '-'}{item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                        <button 
                          onClick={() => removeTransaction(item.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </section>

            {/* Extras Section */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <ArrowUpCircle className="text-blue-500" size={20} />
                  Entradas Extras (Diversos)
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {extras.map((extra, index) => (
                  <div key={extra.id} className="space-y-1 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                     <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">
                       Entrada {index + 1}
                     </label>
                     <input 
                        type="text"
                        value={extra.description}
                        onChange={(e) => handleExtraChange(extra.id, 'description', e.target.value)}
                        className="w-full text-sm font-medium text-slate-700 border-b border-slate-200 focus:border-blue-500 outline-none pb-1 mb-2 bg-transparent placeholder-slate-300"
                        placeholder="Descrição (Ex: Vale Funcionário)"
                      />
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
                      <input 
                        type="number" 
                        step="0.01"
                        value={extra.value === 0 ? '' : extra.value}
                        onChange={(e) => handleExtraChange(extra.id, 'value', e.target.value)}
                        placeholder="0,00"
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 bg-white"
                      />
                    </div>
                  </div>
                ))}
                 <div className="pt-2 border-t border-dashed border-slate-200 flex justify-between items-center">
                  <span className="text-sm text-slate-500">Total Extras</span>
                  <span className="font-mono font-bold text-blue-600">
                    {totals.extras.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>
            </section>

          </div>
        </div>

        {/* Floating Total Bar */}
        <div className="mt-12 p-6 bg-slate-900 rounded-2xl shadow-xl text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Balanço Geral</h3>
              <p className="text-slate-500 text-xs mt-1">Cálculo: Físico (incluindo ajustes) + Extras</p>
            </div>
            <div className="flex-1 w-full md:w-auto grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div>
                <span className="block text-xs text-slate-400 mb-1">Físico Total</span>
                <span className="font-mono text-emerald-400 font-medium">{totals.physical.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              <div>
                 <span className="block text-xs text-slate-400 mb-1">Extras</span>
                 <span className="font-mono text-blue-400 font-medium">{totals.extras.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              <div className="bg-slate-800 rounded-lg py-1 px-2 border border-slate-700">
                 <span className="block text-xs text-slate-300 mb-1 font-bold">LÍQUIDO FINAL</span>
                 <span className="font-mono text-white font-bold text-lg">{totals.grandTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default App;