import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/ui/Button.tsx';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center antialiased">
      <div className="w-16 h-16 rounded-2xl bg-royal-950/10 dark:bg-royal-900/40 text-royal-900 dark:text-gold-400 flex items-center justify-center border border-royal-700/20 mb-6">
        <ShieldAlert className="w-8 h-8 text-amber-500" />
      </div>
      <span className="text-xs font-mono font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
        HTTP 404 · Unrecognized Banking Route
      </span>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2 mb-3">
        Page Not Located
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-6">
        The financial record, ledger portal, or administrative resource requested does not exist or has been relocated to another security classification tier.
      </p>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Return Back
        </Button>
        <Button
          variant="primary"
          onClick={() => navigate('/bank/dashboard')}
          icon={<Home className="w-4 h-4" />}
        >
          Customer Dashboard
        </Button>
      </div>
    </div>
  );
};
