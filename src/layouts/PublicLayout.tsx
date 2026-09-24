import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Menu, X, ChevronDown, Globe, Lock, ExternalLink } from 'lucide-react';
import { ThemeToggle } from '../components/common/ThemeToggle.tsx';
import { Button } from '../components/ui/Button.tsx';

interface PublicLayoutProps {
  children?: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const primaryNavLinks = [
    { label: 'Personal', path: '/personal-banking' },
    { label: 'Business', path: '/business-banking' },
    { label: 'Accounts', path: '/accounts' },
    { label: 'Cards', path: '/cards' },
    { label: 'Loans', path: '/loans' },
    { label: 'Deposits', path: '/deposits' },
  ];

  const allPublicLinks = [
    { label: 'About Institutional Heritage', path: '/about' },
    { label: 'Personal Banking', path: '/personal-banking' },
    { label: 'Business & Treasury', path: '/business-banking' },
    { label: 'Multi-Currency Accounts', path: '/accounts' },
    { label: 'Metal & Debit Cards', path: '/cards' },
    { label: 'Sovereign Loans', path: '/loans' },
    { label: 'Fixed Term Deposits', path: '/deposits' },
    { label: 'Digital Banking Suite', path: '/digital-banking' },
    { label: 'Contactless QR Rail', path: '/qr-payment' },
    { label: 'Cryptographic Security', path: '/security' },
    { label: 'Branch Directory', path: '/branches' },
    { label: 'Global ATM Locator', path: '/atm-locator' },
    { label: 'Knowledge Base & FAQ', path: '/faq' },
    { label: 'Contact Private Desk', path: '/contact' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col antialiased text-slate-900 dark:text-slate-100">
      {/* Top Bar Contract: Zone 1, Zone 2, Zone 3 */}
      <header className="h-16 px-4 sm:px-8 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between">
        {/* Zone 1: Single element brand wordmark */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group focus-visible:outline-2 focus-visible:outline-amber-500 rounded-lg"
        >
          <div className="w-8 h-8 rounded-lg bg-royal-900 text-gold-400 flex items-center justify-center border border-gold-400/40 shadow-sm">
            <ShieldCheck className="w-5 h-5 text-gold-400" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
            Royal Bank
          </span>
        </Link>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-400">
          {primaryNavLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-colors py-1 ${
                  isActive
                    ? 'text-royal-600 dark:text-gold-400 border-b-2 border-royal-600 dark:border-gold-400'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            to="/digital-banking"
            className="hover:text-slate-900 dark:hover:text-white transition-colors py-1"
          >
            Digital Suite
          </Link>
          <Link
            to="/security"
            className="hover:text-slate-900 dark:hover:text-white transition-colors py-1"
          >
            Security
          </Link>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          <Link
            to="/bank/register"
            className="hidden sm:inline-flex text-xs font-semibold text-royal-700 dark:text-gold-400 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Open Account
          </Link>

          <Button
            size="sm"
            variant="gold"
            onClick={() => navigate('/bank/login')}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
            iconPosition="right"
            className="text-xs"
          >
            Client Login
          </Button>

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-16 bottom-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md overflow-y-auto p-6 flex flex-col justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest block">
              Institutional Navigation
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {allPublicLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm py-2 px-3 rounded-xl font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'bg-royal-50 dark:bg-royal-950/60 text-royal-700 dark:text-gold-400 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/admin/login');
                }}
              >
                Admin Governance
              </Button>
              <Button
                variant="primary"
                className="flex-1 text-xs"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/bank/register');
                }}
              >
                Apply for Account
              </Button>
            </div>
            <p className="text-[11px] text-center text-slate-400">
              Royal Bank International · Chartered Financial Depository
            </p>
          </div>
        </div>
      )}

      {/* Main Viewport */}
      <main className="flex-1 flex flex-col">
        {children || <Outlet />}
      </main>

      {/* Institutional Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-xs text-slate-500 pt-14 pb-8 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-royal-900 text-gold-400 flex items-center justify-center border border-gold-400/40">
                <ShieldCheck className="w-4 h-4 text-gold-400" />
              </div>
              <span className="text-base font-bold text-slate-900 dark:text-white">
                Royal Bank International
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              Global custodian for multi-currency reserves, institutional liquidity, automated cross-border settlement, and sovereign wealth custody.
            </p>
            <div className="text-[11px] text-slate-400 space-y-1">
              <div>Chartered Institutional Identifier: RB-8912</div>
              <div>Common Equity Tier 1 (CET1) Ratio: 18.4%</div>
              <div>FDIC & Basel III Pillar 3 Disclosures Compliant</div>
            </div>
          </div>

          {/* Col 1: Personal & Wealth */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              Personal & Wealth
            </h4>
            <ul className="space-y-2 text-slate-500 dark:text-slate-400">
              <li><Link to="/personal-banking" className="hover:text-slate-900 dark:hover:text-white transition-colors">Private Client Banking</Link></li>
              <li><Link to="/accounts" className="hover:text-slate-900 dark:hover:text-white transition-colors">Multi-Currency Accounts</Link></li>
              <li><Link to="/cards" className="hover:text-slate-900 dark:hover:text-white transition-colors">Metal & Infinite Cards</Link></li>
              <li><Link to="/loans" className="hover:text-slate-900 dark:hover:text-white transition-colors">Sovereign Credit & Mortgages</Link></li>
              <li><Link to="/deposits" className="hover:text-slate-900 dark:hover:text-white transition-colors">Fixed Yield Deposits</Link></li>
            </ul>
          </div>

          {/* Col 2: Business & Technology */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              Enterprise & Rails
            </h4>
            <ul className="space-y-2 text-slate-500 dark:text-slate-400">
              <li><Link to="/business-banking" className="hover:text-slate-900 dark:hover:text-white transition-colors">Commercial Treasury</Link></li>
              <li><Link to="/digital-banking" className="hover:text-slate-900 dark:hover:text-white transition-colors">Digital Banking Suite</Link></li>
              <li><Link to="/qr-payment" className="hover:text-slate-900 dark:hover:text-white transition-colors">Merchant QR Rail</Link></li>
              <li><Link to="/security" className="hover:text-slate-900 dark:hover:text-white transition-colors">Cryptographic Architecture</Link></li>
              <li><Link to="/admin/login" className="hover:text-slate-900 dark:hover:text-white transition-colors">Supervisory Terminal</Link></li>
            </ul>
          </div>

          {/* Col 3: Network & Support */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              Network & Inquiries
            </h4>
            <ul className="space-y-2 text-slate-500 dark:text-slate-400">
              <li><Link to="/about" className="hover:text-slate-900 dark:hover:text-white transition-colors">Institutional Heritage</Link></li>
              <li><Link to="/branches" className="hover:text-slate-900 dark:hover:text-white transition-colors">Branch Locations</Link></li>
              <li><Link to="/atm-locator" className="hover:text-slate-900 dark:hover:text-white transition-colors">Global ATM Network</Link></li>
              <li><Link to="/faq" className="hover:text-slate-900 dark:hover:text-white transition-colors">Knowledge Base & FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-slate-900 dark:hover:text-white transition-colors">Contact Private Banker</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & regulatory line */}
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-[11px] text-slate-500 leading-relaxed">
            © {new Date().getFullYear()} Royal Bank International plc. Authorized by the Prudential Regulation Authority and regulated by the Financial Conduct Authority and the Prudential Regulation Authority under registration number 8912. Member FDIC.
          </p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400 shrink-0">
            <Link to="/security" className="hover:underline">Privacy Policy</Link>
            <span>·</span>
            <Link to="/security" className="hover:underline">Terms of Service</Link>
            <span>·</span>
            <Link to="/security" className="hover:underline">Security Bureau</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

