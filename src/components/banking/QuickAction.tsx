import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  ArrowRightLeft,
  QrCode,
  Receipt,
  Smartphone,
  PlusCircle,
  CreditCard,
  HandCoins,
} from 'lucide-react';

export interface QuickActionItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  colorClass: string;
  route?: string;
  onClick?: () => void;
  badge?: string;
}

interface QuickActionProps {
  onActionClick?: (actionId: string) => void;
  className?: string;
}

export const QuickAction: React.FC<QuickActionProps> = ({
  onActionClick,
  className = '',
}) => {
  const navigate = useNavigate();

  const actions: QuickActionItem[] = [
    {
      id: 'send_money',
      label: 'Send Money',
      icon: <Send className="w-5 h-5" />,
      colorClass: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      route: '/bank/transfers?mode=wire',
    },
    {
      id: 'transfer',
      label: 'Transfer',
      icon: <ArrowRightLeft className="w-5 h-5" />,
      colorClass: 'text-royal-600 bg-royal-50 dark:bg-royal-950/60 dark:text-gold-400 border-royal-200 dark:border-royal-800',
      route: '/bank/transfers',
    },
    {
      id: 'scan_qr',
      label: 'Scan QR',
      icon: <QrCode className="w-5 h-5" />,
      colorClass: 'text-gold-600 bg-amber-50 dark:bg-amber-950/60 dark:text-gold-400 border-amber-200 dark:border-amber-800',
      route: '/bank/qr',
      badge: 'Instant',
    },
    {
      id: 'pay_bill',
      label: 'Pay Bill',
      icon: <Receipt className="w-5 h-5" />,
      colorClass: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      route: '/bank/bills',
    },
    {
      id: 'mobile_recharge',
      label: 'Mobile Recharge',
      icon: <Smartphone className="w-5 h-5" />,
      colorClass: 'text-purple-600 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-400 border-purple-200 dark:border-purple-800',
      route: '/bank/bills?tab=recharge',
    },
    {
      id: 'deposit',
      label: 'Deposit',
      icon: <PlusCircle className="w-5 h-5" />,
      colorClass: 'text-teal-600 bg-teal-50 dark:bg-teal-950/60 dark:text-teal-400 border-teal-200 dark:border-teal-800',
      route: '/bank/deposits',
    },
    {
      id: 'card',
      label: 'Card Controls',
      icon: <CreditCard className="w-5 h-5" />,
      colorClass: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
      route: '/bank/cards',
    },
    {
      id: 'request_money',
      label: 'Request Money',
      icon: <HandCoins className="w-5 h-5" />,
      colorClass: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/60 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
      route: '/bank/transfers?mode=request',
    },
  ];

  const handleClick = (item: QuickActionItem) => {
    if (onActionClick) {
      onActionClick(item.id);
    }
    if (item.route) {
      navigate(item.route);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Instant Operations
        </h3>
        <span className="text-[11px] text-slate-400">Sub-second execution</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {actions.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleClick(item)}
            className="group relative flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-gold-400/80 hover:shadow-md transition-all text-center"
          >
            {item.badge && (
              <span className="absolute -top-1.5 -right-1 px-1.5 py-0.2 rounded-full bg-gold-400 text-royal-950 font-bold text-[9px] uppercase tracking-wider">
                {item.badge}
              </span>
            )}
            <div
              className={`p-3 rounded-2xl border transition-transform group-hover:scale-110 mb-2 ${item.colorClass}`}
            >
              {item.icon}
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-royal-600 dark:group-hover:text-gold-400 transition-colors">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
