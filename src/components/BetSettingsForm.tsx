
import React from 'react';
import { BetSettings } from '../types';

interface Props {
  settings: BetSettings;
  setSettings: (settings: BetSettings) => void;
}

const BetSettingsForm: React.FC<Props> = ({ settings, setSettings }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : Number(value)
    });
  };

  const handleNumberInputChange = (field: 'perStrokeAmount' | 'birdieAmount') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    if (/^\d*$/.test(raw)) {
      setSettings({
        ...settings,
        [field]: raw === '' ? 0 : Number(raw)
      });
    }
  };

  const handleNumberInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedControlKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Home', 'End'];
    if (allowedControlKeys.includes(e.key)) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleNumberInputBlur = (field: 'perStrokeAmount' | 'birdieAmount') => (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === '') {
      setSettings({
        ...settings,
        [field]: 0
      });
    }
  };

  const handleNumberInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 mb-6">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
        <span className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        </span>
        내기 규칙 설정
      </h2>
      
      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">금액 설정 (원)</h3>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">타당 금액</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                name="perStrokeAmount"
                value={settings.perStrokeAmount === 0 ? '' : settings.perStrokeAmount}
                onChange={handleNumberInputChange('perStrokeAmount')}
                onKeyDown={handleNumberInputKeyDown}
                onBlur={handleNumberInputBlur('perStrokeAmount')}
                onFocus={handleNumberInputFocus}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm transition-colors appearance-none [::-webkit-outer-spin-button]:appearance-none [::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">버디 보너스</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                name="birdieAmount"
                value={settings.birdieAmount === 0 ? '' : settings.birdieAmount}
                onChange={handleNumberInputChange('birdieAmount')}
                onKeyDown={handleNumberInputKeyDown}
                onBlur={handleNumberInputBlur('birdieAmount')}
                onFocus={handleNumberInputFocus}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm transition-colors appearance-none [::-webkit-outer-spin-button]:appearance-none [::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pt-2">배판(Double) 규칙</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">트리플 이상 시 배판</span>
              <input type="checkbox" name="doubleOnTripleBogey" checked={settings.doubleOnTripleBogey} onChange={handleChange} className="w-4 h-4 text-emerald-600 rounded dark:bg-slate-800 dark:border-slate-700" />
            </label>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">동타 시 배판 기준</span>
              <select 
                name="doubleOnTieCount" 
                value={settings.doubleOnTieCount} 
                onChange={handleChange}
                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg px-2 py-1 outline-none transition-colors"
              >
                <option value={0}>사용 안함</option>
                <option value={2}>2명 이상</option>
                <option value={3}>3명 이상</option>
                <option value={4}>4명 모두</option>
              </select>
            </div>

            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">모두 동타 시 다음홀 배판</span>
              <input type="checkbox" name="doubleNextOnAllTie" checked={settings.doubleNextOnAllTie} onChange={handleChange} className="w-4 h-4 text-emerald-600 rounded dark:bg-slate-800 dark:border-slate-700" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BetSettingsForm;
