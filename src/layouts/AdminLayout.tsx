import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  CreditCard,
  Building2,
  FileSearch,
  AlertOctagon,
  Scale,
  GitBranch,
  UserCheck,
  KeyRound,
  FileSpreadsheet,
  ScrollText,
  Sliders,
  LifeBuoy,
  LayoutDashboard,
  Menu,
  X,
  WalletCards,
  Landmark,
  QrCode,
  Layers,
  ArrowRightLeft,
  CheckCircle2,
} from 'lucide-react';
import { BrandLogo } from '../components/common/BrandLogo.tsx';
import { ThemeToggle } from '../components/common/ThemeToggle.tsx';
import { UserMenu } from '../components/common/UserMenu.tsx';
import { Breadcrumbs } from '../components/ui/Breadcrumbs.tsx';
import { useAdminPermissions } from '../hooks/index.ts';
import { PermissionResource, AdminRole } from '../backend/types/index.ts';

interface AdminNavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  section: string;
  badge?: string;
  badgeVariant?: 'warning' | 'alert';
  resource?: PermissionResource;
}

const adminNavItems: AdminNavItem[] = [
  // Governance & Core
  { section: 'Overview', label: 'Command Center', path: '/admin/dashboard', icon: LayoutDashboard, resource: 'dashboard' },
  { section: 'Ledgers & Accounts', label: 'Customer Registry', path: '/admin/customers', icon: Users, resource: 'customers' },
  { section: 'Ledgers & Accounts', label: 'Account Ledgers', path: '/admin/accounts', icon: Landmark, resource: 'accounts' },
  { section: 'Ledgers & Accounts', label: 'Transactions Stream', path: '/admin/transactions', icon: ArrowRightLeft, resource: 'transactions' },
  { section: 'Ledgers & Accounts', label: 'Merchant QR Terminals', path: '/admin/qr', icon: QrCode, resource: 'qr' },
  { section: 'Ledgers & Accounts', label: 'Card Management', path: '/admin/cards', icon: CreditCard, resource: 'cards' },
  { section: 'Ledgers & Accounts', label: 'Credit & Loans', path: '/admin/loans', icon: Building2, resource: 'loans' },
  { section: 'Ledgers & Accounts', label: 'Treasury Deposits', path: '/admin/deposits', icon: WalletCards, resource: 'deposits' },

  // Risk, Compliance & Security
  { section: 'Risk & Surveillance', label: 'KYC Applications', path: '/admin/kyc', icon: FileSearch, badge: '1', resource: 'kyc' },
  { section: 'Risk & Surveillance', label: 'Fraud Detection Engine', path: '/admin/fraud', icon: AlertOctagon, resource: 'fraud' },
  { section: 'Risk & Surveillance', label: 'AML & Sanctions Screen', path: '/admin/aml', icon: Scale, resource: 'aml' },
  { section: 'Risk & Surveillance', label: 'Maker-Checker Approvals', path: '/admin/approvals', icon: CheckCircle2, badge: '6', resource: 'approvals' },

  // Enterprise Administration
  { section: 'Operations & Staff', label: 'Branch Network', path: '/admin/branches', icon: GitBranch, resource: 'branches' },
  { section: 'Operations & Staff', label: 'Bank Employees', path: '/admin/employees', icon: UserCheck, resource: 'employees' },
  { section: 'Operations & Staff', label: 'RBAC Roles & Matrix', path: '/admin/roles', icon: KeyRound, resource: 'roles' },
  { section: 'Operations & Staff', label: 'Executive Reports', path: '/admin/reports', icon: FileSpreadsheet, resource: 'reports' },
  { section: 'Operations & Staff', label: 'Immutable Audit Logs', path: '/admin/audit-logs', icon: ScrollText, resource: 'audit_logs' },
  { section: 'Operations & Staff', label: 'Core System Settings', path: '/admin/settings', icon: Sliders, resource: 'settings' },
  { section: 'Operations & Staff', label: 'Desk Support Escalation', path: '/admin/support', icon: LifeBuoy, badge: '2' },
];

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const permissions = useAdminPermissions();

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbItems = [
    { label: 'Admin Console', path: '/admin/dashboard' },
    ...pathSegments.slice(1).map((seg) => ({
      label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
    })),
  ];

  // Group items by section
  const sections = ['Overview', 'Ledgers & Accounts', 'Risk & Surveillance', 'Operations & Staff'];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col antialiased text-slate-900 dark:text-slate-100">
      {/* Top Admin Telemetry Banner */}
      <div className="bg-slate-900 text-slate-300 border-b border-slate-800 px-4 py-1 text-[11px] flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <span className="inline-flex items-center gap-1.5 text-amber-400 font-semibold tracking-wide">
            <ShieldAlert className="w-3.5 h-3.5" />
            SUPERVISORY ADMINISTRATION ENVIRONMENT
          </span>
          <span className="hidden sm:inline text-slate-500">·</span>
          <span className="hidden sm:inline text-slate-400">
            Node ID: RBS-CORE-US-EAST
          </span>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => navigate('/bank/dashboard')}
              className="text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
            >
              Switch to Customer Portal &rarr;
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-row w-full max-w-[1680px] mx-auto">
        {/* Admin Sidebar (270px) */}
        <aside className="hidden md:flex flex-col w-68 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 sticky top-0 h-screen overflow-y-auto">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <BrandLogo to="/admin/dashboard" variant="admin" />
          </div>

          {/* Quick RBAC Simulator Widget in Sidebar */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              <span>Operational Role</span>
              <span className="text-royal-600 dark:text-royal-400 font-mono">RBAC</span>
            </div>
            <select
              value={permissions.role}
              onChange={(e) => permissions.switchRole(e.target.value as AdminRole)}
              className="w-full text-xs font-semibold px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              title="Switch demo operating role to test route & feature authorization"
            >
              {permissions.availableRoles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
            <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
              <span>View Matrix:</span>
              <NavLink to="/admin/permissions" className="text-royal-600 dark:text-royal-400 hover:underline">
                /admin/permissions
              </NavLink>
            </div>
          </div>

          <div className="p-3 space-y-4">
            {sections.map((sectionName) => {
              const items = adminNavItems
                .filter((i) => i.section === sectionName)
                .filter((i) => !i.resource || permissions.can(i.resource, 'view'));

              if (!items.length) return null;

              return (
                <div key={sectionName}>
                  <p className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    {sectionName}
                  </p>
                  <nav className="mt-1 space-y-0.5">
                    {items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          className={({ isActive }) =>
                            `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                              isActive
                                ? 'bg-slate-900 text-white dark:bg-royal-800 dark:text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                            }`
                          }
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200" />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold">
                              {item.badge}
                            </span>
                          )}
                        </NavLink>
                      );
                    })}
                  </nav>
                </div>
              );
            })}
          </div>

          <div className="mt-auto p-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
            <p className="font-semibold text-slate-700 dark:text-slate-300">Internal Audit Compliance</p>
            <p className="font-mono text-[10px] text-slate-500 mt-0.5">ISO/IEC 27001 Certified</p>
          </div>
        </aside>

        {/* Mobile Navigation Drawer for Admin */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative w-72 bg-white dark:bg-slate-900 h-full p-4 flex flex-col overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <BrandLogo to="/admin/dashboard" variant="admin" />
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Mobile Role Switcher */}
              <div className="py-3 border-b border-slate-100 dark:border-slate-800">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Operational Role</label>
                <select
                  value={permissions.role}
                  onChange={(e) => permissions.switchRole(e.target.value as AdminRole)}
                  className="w-full text-xs font-semibold mt-1 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {permissions.availableRoles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="py-3 flex-1 space-y-1">
                {adminNavItems
                  .filter((item) => !item.resource || permissions.can(item.resource, 'view'))
                  .map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                            isActive
                              ? 'bg-slate-900 text-white dark:bg-royal-800'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`
                        }
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-600 font-bold">
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
          <header className="h-16 px-4 md:px-8 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-4">
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
                Admin Console
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Quick Role Badge with Direct Switcher in Header */}
              <div className="hidden lg:flex items-center gap-1.5 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">Clearance:</span>
                <select
                  value={permissions.role}
                  onChange={(e) => permissions.switchRole(e.target.value as AdminRole)}
                  className="bg-transparent text-xs font-bold text-amber-700 dark:text-amber-300 outline-none cursor-pointer"
                >
                  {permissions.availableRoles.map((r) => (
                    <option key={r.id} value={r.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      {r.title}
                    </option>
                  ))}
                </select>
              </div>

              <ThemeToggle />
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
              <UserMenu variant="admin" />
            </div>
          </header>

          <main className="flex-1 p-4 md:p-8 max-w-[1500px] w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
