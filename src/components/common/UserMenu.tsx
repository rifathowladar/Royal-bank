import React, { useState, useRef, useEffect } from 'react';
import { useAuth, useToast } from '../../hooks/index.ts';
import { User, LogOut, ChevronDown, Check, Shield, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const UserMenu: React.FC<{ variant?: 'customer' | 'admin' }> = ({ variant = 'customer' }) => {
  const { user, logout, switchUserRole } = useAuth();
  const { info } = useToast();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    info('Session Terminated', 'You have been safely signed out of Royal Bank.');
    navigate(variant === 'admin' ? '/admin/login' : '/bank/login');
  };

  const handleRoleSwitch = async (targetRole: 'customer' | 'admin') => {
    await switchUserRole(targetRole);
    setIsOpen(false);
    info(
      'Profile Switched',
      targetRole === 'customer'
        ? 'Active session: Alexander Sterling (Private Client)'
        : 'Active session: Victoria Ashford (Super Admin Console)'
    );
    navigate(targetRole === 'customer' ? '/bank/dashboard' : '/admin/dashboard');
  };

  if (!user) {
    return null;
  }

  const initials = `${user.firstName[0]}${user.lastName[0]}`;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-2 focus-visible:outline-royal-600"
      >
        <div className="w-8 h-8 rounded-lg bg-royal-900 text-gold-400 font-semibold text-xs flex items-center justify-center border border-gold-400/30">
          {initials}
        </div>
        <div className="hidden lg:flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
            {user.firstName} {user.lastName}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">
            {user.role.replace(/_/g, ' ')}
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2"
        >
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-400">Authenticated as</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate mt-0.5">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
          </div>

          {variant === 'customer' && (
            <div className="px-2 py-1.5 border-b border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/bank/profile');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-royal-600 dark:text-gold-400" />
                <span>My Profile & KYC</span>
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/bank/security');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-royal-600 dark:text-gold-400" />
                <span>Security & Devices</span>
              </button>
            </div>
          )}

          <div className="px-2 py-1.5">
            <p className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Quick Role Switch (Demo)
            </p>
            <button
              onClick={() => handleRoleSwitch('customer')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            >
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-500" />
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">Customer Client</p>
                  <p className="text-[10px] text-slate-400">Alexander Sterling (Private)</p>
                </div>
              </div>
              {user.role === 'customer' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
            </button>

            <button
              onClick={() => handleRoleSwitch('admin')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-500" />
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">Admin Console</p>
                  <p className="text-[10px] text-slate-400">Victoria Ashford (Super Admin)</p>
                </div>
              </div>
              {user.role !== 'customer' && <Check className="w-3.5 h-3.5 text-amber-500" />}
            </button>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 px-2 pt-1.5">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out Securely</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
