import React, { useState } from 'react';
import { Beneficiary } from '../../backend/index.ts';
import { Button } from '../ui/Button.tsx';
import {
  Star,
  Search,
  Plus,
  Building2,
  Landmark,
  Globe2,
  CheckCircle2,
  User,
} from 'lucide-react';

export interface BeneficiarySelectorProps {
  beneficiaries: Beneficiary[];
  selectedBeneficiaryId?: string;
  onSelect: (beneficiary: Beneficiary) => void;
  onAddNew?: () => void;
  onToggleFavorite?: (id: string) => void;
}

export const BeneficiarySelector: React.FC<BeneficiarySelectorProps> = ({
  beneficiaries,
  selectedBeneficiaryId,
  onSelect,
  onAddNew,
  onToggleFavorite,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'favorite' | 'internal' | 'domestic' | 'international'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = beneficiaries.filter((b) => {
    if (filterTab === 'favorite' && !b.isFavorite) return false;
    if (filterTab === 'internal' && b.type !== 'internal') return false;
    if (filterTab === 'domestic' && b.type !== 'domestic') return false;
    if (filterTab === 'international' && b.type !== 'international_swift') return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        b.name.toLowerCase().includes(q) ||
        (b.nickName && b.nickName.toLowerCase().includes(q)) ||
        b.accountNumber.includes(q) ||
        b.bankName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search saved payee by name, account, or bank..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {[
            { id: 'all', label: 'All Payees' },
            { id: 'favorite', label: '★ Favorites' },
            { id: 'internal', label: 'Royal Bank' },
            { id: 'domestic', label: 'Other Banks' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterTab(tab.id as any)}
              className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap text-[11px] transition-colors ${
                filterTab === tab.id
                  ? 'bg-royal-600 dark:bg-gold-500 text-white dark:text-royal-950 font-bold shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
          {onAddNew && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddNew}
              icon={<Plus className="w-3 h-3" />}
              className="text-[11px] py-1.5 h-auto whitespace-nowrap"
            >
              Add Payee
            </Button>
          )}
        </div>
      </div>

      {/* Grid of Beneficiaries */}
      {filtered.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
          No matching beneficiaries on record.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filtered.map((ben) => {
            const isSelected = selectedBeneficiaryId === ben.id;
            return (
              <div
                key={ben.id}
                onClick={() => onSelect(ben)}
                className={`group relative p-3.5 rounded-2xl border cursor-pointer transition-all text-left space-y-2 ${
                  isSelected
                    ? 'border-royal-600 dark:border-gold-400 bg-royal-50/50 dark:bg-royal-950/40 shadow-sm ring-1 ring-royal-600/30 dark:ring-gold-400/30'
                    : 'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-royal-600 dark:text-gold-400 shrink-0">
                      {ben.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-xs truncate max-w-[140px]">
                        {ben.name}
                      </div>
                      {ben.nickName && (
                        <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">
                          {ben.nickName}
                        </span>
                      )}
                    </div>
                  </div>

                  {onToggleFavorite && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(ben.id);
                      }}
                      className="p-1 rounded-full text-slate-300 hover:text-amber-400 transition-colors"
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          ben.isFavorite ? 'fill-amber-400 text-amber-400' : ''
                        }`}
                      />
                    </button>
                  )}
                </div>

                <div className="text-[11px] font-mono text-slate-600 dark:text-slate-300 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span>{ben.accountNumber}</span>
                  <span className="text-[10px] font-sans font-medium text-slate-400 truncate max-w-[100px]">
                    {ben.bankName}
                  </span>
                </div>

                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="w-4 h-4 text-royal-600 dark:text-gold-400" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
