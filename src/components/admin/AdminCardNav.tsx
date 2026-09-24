import React from 'react';
import { NavLink } from 'react-router-dom';
import { CreditCard, PlusCircle, ArrowRightLeft, ShieldAlert } from 'lucide-react';

export const AdminCardNav: React.FC = () => {
  const tabs = [
    { label: 'Card Fleet Portfolio', path: '/admin/cards', icon: CreditCard, end: true },
    { label: 'Card Issuance Desk', path: '/admin/cards/issuance', icon: PlusCircle },
    { label: 'Card Transactions Feed', path: '/admin/cards/transactions', icon: ArrowRightLeft },
    { label: 'Fraud & Risk Radar', path: '/admin/cards/fraud', icon: ShieldAlert },
  ];

  return (
    <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 mb-6 overflow-x-auto pb-px">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            end={tab.end}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400 dark:border-amber-400'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </NavLink>
        );
      })}
    </div>
  );
};
