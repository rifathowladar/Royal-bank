import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FileSpreadsheet,
  ArrowRightLeft,
  Users,
  WalletCards,
  Building2,
  CreditCard,
  QrCode,
  AlertOctagon,
  DollarSign,
} from 'lucide-react';

const reportTabs = [
  { label: 'Reports Hub', path: '/admin/reports', icon: FileSpreadsheet, end: true },
  { label: 'Transactions', path: '/admin/reports/transactions', icon: ArrowRightLeft },
  { label: 'Customers', path: '/admin/reports/customers', icon: Users },
  { label: 'Deposits', path: '/admin/reports/deposits', icon: WalletCards },
  { label: 'Loans', path: '/admin/reports/loans', icon: Building2 },
  { label: 'Cards', path: '/admin/reports/cards', icon: CreditCard },
  { label: 'QR Payments', path: '/admin/reports/qr', icon: QrCode },
  { label: 'Fraud Alerts', path: '/admin/reports/fraud', icon: AlertOctagon },
  { label: 'Revenue & Yield', path: '/admin/reports/revenue', icon: DollarSign },
];

export const AdminReportNav: React.FC = () => {
  return (
    <div className="border-b border-slate-200 dark:border-slate-800 mb-6 overflow-x-auto no-scrollbar">
      <nav className="flex items-center gap-1 min-w-max pb-px">
        {reportTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-royal-900 text-royal-900 dark:border-amber-400 dark:text-amber-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300 dark:hover:border-slate-700'
                }`
              }
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
