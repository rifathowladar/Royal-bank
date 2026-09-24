import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  QrCode,
  CreditCard,
  Building,
  PiggyBank,
  Receipt,
  TrendingUp,
  Globe2,
  FileCheck2,
  User,
  ShieldCheck,
  Bell,
  HeadphonesIcon,
  Menu,
  X,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { BrandLogo } from '../components/common/BrandLogo.tsx';
import { ThemeToggle } from '../components/common/ThemeToggle.tsx';
import { UserMenu } from '../components/common/UserMenu.tsx';
import { Breadcrumbs } from '../components/ui/Breadcrumbs.tsx';

interface NavItemConfig {
  label: string;
  path: string;
  icon: React.ElementType;
  section?: string;
  badge?: string;
}

const customerNavItems: NavItemConfig[] = [
  { label: 'Overview', path: '/bank/dashboard', icon: LayoutDashboard },
  { label: 'Accounts & Vaults', path: '/bank/accounts', icon: Wallet },
  { label: 'Transfers & Wires', path: '/bank/transfers', icon: ArrowLeftRight },
  { label: 'QR Instant Pay', path: '/bank/qr', icon: QrCode },
  { label: 'Cards', path: '/bank/cards', icon: CreditCard },
  { label: 'Loans & Credit', path: '/bank/loans', icon: Building },
  { label: 'Term Deposits', path: '/bank/deposits', icon: PiggyBank },
  { label: 'Bills & Utilities', path: '/bank/bills', icon: Receipt },
  { label: 'Investments', path: '/bank/investments', icon: TrendingUp },
  { label: 'Global Remittance', path: '/bank/remittance', icon: Globe2 },
  { label: 'Digital Cheques', path: '/bank/cheques', icon: FileCheck2 },
  { label: 'My Profile', path: '/bank/profile', icon: User },
  { label: 'KYC Compliance', path: '/bank/kyc', icon: ShieldCheck },
  { label: 'Security & 2FA', path: '/bank/security', icon: ShieldCheck },
  { label: 'Notifications', path: '/bank/notifications', icon: Bell, badge: '2' },
  { label: 'Concierge Support', path: '/bank/support', icon: HeadphonesIcon },
];

export const CustomerLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Compute breadcrumbs from current path
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbItems = [
    { label: 'Customer Banking', path: '/bank/dashboard' },
    ...pathSegments.slice(1).map((seg) => ({
      label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
    })),
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col antialiased text-slate-900 dark:text-slate-100">
      {/* Top Banner / Private Client Notice */}
      <div className="bg-royal-950 text-slate-300 border-b border-royal-900 px-4 py-1 text-[11px] flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <span className="inline-flex items-center gap-1 text-gold-400 font-semibold tracking-wide">
            <Sparkles className="w-3 h-3" />
            ROYAL PRIVATE CLIENT
          </span>
          <span className="hidden sm:inline text-slate-500">·</span>
          <span className="hidden sm:inline text-slate-400">
            256-bit Hardware-grade Encryption Active
          </span>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="text-gold-400 hover:text-gold-300 underline font-medium cursor-pointer"
            >
              Switch to Admin Console &rarr;
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-row w-full max-w-[1600px] mx-auto">
        {/* Desktop Sidebar (260px) */}
        <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md sticky top-0 h-screen overflow-y-auto">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <BrandLogo to="/bank/dashboard" variant="customer" />
          </div>

          <div className="p-3">
            <p className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Banking Services
            </p>
            <nav className="space-y-0.5">
              {customerNavItems.slice(0, 11).map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-royal-900 text-white dark:bg-royal-800 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-700 dark:text-gold-400 font-bold">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            <p className="px-3 pt-4 pb-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Account & Security
            </p>
            <nav className="space-y-0.5">
              {customerNavItems.slice(11).map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-royal-900 text-white dark:bg-royal-800 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-700 dark:text-gold-400 font-bold">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto p-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 space-y-1">
            <p className="font-semibold text-slate-700 dark:text-slate-300">Royal Bank Private</p>
            <p>FDIC Insured · Charter #8912</p>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative w-72 bg-white dark:bg-slate-900 h-full p-4 flex flex-col overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <BrandLogo to="/bank/dashboard" variant="customer" />
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="py-3 flex-1 space-y-1">
                {customerNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-royal-900 text-white dark:bg-royal-800'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`
                      }
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500/20 text-gold-400 font-bold">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar Contract: 3 zones */}
          <header className="h-16 px-4 md:px-8 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-4">
            {/* Zone 1: Mobile toggle & Breadcrumb Trail */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Open sidebar menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="hidden sm:block">
                <Breadcrumbs items={breadcrumbItems} />
              </div>
              <div className="sm:hidden font-semibold text-sm truncate">
                Royal Bank
              </div>
            </div>

            {/* Zone 2: Fast Quick Links (Desktop) */}
            <nav className="hidden xl:flex items-center gap-5 text-xs font-medium text-slate-500 dark:text-slate-400">
              <NavLink to="/bank/transfers" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                Quick Transfer
              </NavLink>
              <NavLink to="/bank/qr" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                QR Scanner
              </NavLink>
              <NavLink to="/bank/cards" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                Card Lock
              </NavLink>
              <NavLink to="/bank/support" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                Concierge Desk
              </NavLink>
            </nav>

            {/* Zone 3: Actions & User Menu */}
            <div className="flex items-center gap-2 shrink-0">
              <NavLink
                to="/bank/notifications"
                className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
              </NavLink>
              <ThemeToggle />
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
              <UserMenu variant="customer" />
            </div>
          </header>

          {/* Page Viewport */}
          <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
