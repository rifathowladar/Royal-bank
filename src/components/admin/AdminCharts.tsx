import React, { useState } from 'react';
import { Card } from '../ui/Card.tsx';
import { formatCurrency } from '../../utils/formatters.ts';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  Building2,
  WalletCards,
  ArrowRightLeft,
} from 'lucide-react';

export const AdminCharts: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'30d' | '90d' | '1y'>('30d');

  // Chart 1: Transaction Volume Data (Daily volume over 7 periods)
  const volumeData = [
    { label: 'Mon', volume: 1840000, count: 124 },
    { label: 'Tue', volume: 2950000, count: 189 },
    { label: 'Wed', volume: 3820000, count: 245 },
    { label: 'Thu', volume: 3100000, count: 210 },
    { label: 'Fri', volume: 4620000, count: 320 },
    { label: 'Sat', volume: 1980000, count: 145 },
    { label: 'Sun', volume: 1420000, count: 98 },
  ];
  const maxVolume = Math.max(...volumeData.map((d) => d.volume));

  // Chart 2: Customer Growth (Cumulative over months)
  const customerGrowthData = [
    { month: 'Apr', total: 1120, newUsers: 140 },
    { month: 'May', total: 1290, newUsers: 170 },
    { month: 'Jun', total: 1480, newUsers: 190 },
    { month: 'Jul', total: 1710, newUsers: 230 },
    { month: 'Aug', total: 2040, newUsers: 330 },
    { month: 'Sep', total: 2450, newUsers: 410 },
  ];
  const maxCustomerGrowth = Math.max(...customerGrowthData.map((d) => d.total));

  // Chart 3: Deposits (By asset tier/currency)
  const depositsData = [
    { category: 'Sovereign Checking', amount: 32400000, percent: 45, color: '#d97706' },
    { category: 'High-Yield Fixed Term', amount: 24500000, percent: 34, color: '#2563eb' },
    { category: 'Multi-Currency Foreign Vault', amount: 10200000, percent: 14, color: '#059669' },
    { category: 'Institutional Escrow', amount: 5100000, percent: 7, color: '#7c3aed' },
  ];

  // Chart 4: Loans (By facility & performance)
  const loansData = [
    { type: 'Commercial Real Estate', disbursed: 18500000, performing: 18200000, rate: '6.2%' },
    { type: 'Syndicated Corporate Credit', disbursed: 14200000, performing: 14200000, rate: '5.8%' },
    { type: 'Private Sovereign Mortgage', disbursed: 8900000, performing: 8850000, rate: '4.9%' },
    { type: 'Asset-Backed Working Capital', disbursed: 4300000, performing: 4150000, rate: '7.1%' },
  ];

  // Chart 5: Revenue Streams (Monthly Revenue)
  const revenueStreams = [
    { month: 'May', netInterest: 840000, feeServices: 320000, treasuryFX: 190000 },
    { month: 'Jun', netInterest: 910000, feeServices: 350000, treasuryFX: 210000 },
    { month: 'Jul', netInterest: 990000, feeServices: 380000, treasuryFX: 240000 },
    { month: 'Aug', netInterest: 1080000, feeServices: 420000, treasuryFX: 290000 },
    { month: 'Sep', netInterest: 1220000, feeServices: 490000, treasuryFX: 340000 },
  ];

  // Chart 6: Payment Methods Breakdown
  const paymentMethods = [
    { name: 'Fedwire / Real-Time RTGS', volume: '$18.4M', share: 36, color: 'bg-amber-500' },
    { name: 'SWIFT International Wire', volume: '$14.2M', share: 28, color: 'bg-blue-600' },
    { name: 'EMVCo QR & Instant Pay', volume: '$8.9M', share: 18, color: 'bg-emerald-500' },
    { name: 'Card Infinite / World Elite', volume: '$5.6M', share: 11, color: 'bg-purple-600' },
    { name: 'ACH Direct Clearing', volume: '$3.5M', share: 7, color: 'bg-sky-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-500" />
            Supervisory Intelligence & Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time throughput metrics, treasury positioning, and liquidity telemetry
          </p>
        </div>

        <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
          {(['30d', '90d', '1y'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeframe === t
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of 6 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Transaction Volume */}
        <Card className="p-5 border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Liquidity Throughput
              </p>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                Daily Transaction Volume
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              +18.4% WoW
            </span>
          </div>

          <div className="pt-6 pb-2">
            <div className="h-44 flex items-end justify-between gap-3 px-2">
              {volumeData.map((item) => {
                const heightPercent = Math.round((item.volume / maxVolume) * 100);
                return (
                  <div key={item.label} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="text-[10px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      ${(item.volume / 1000000).toFixed(1)}M
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-t-lg h-32 flex items-end overflow-hidden">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-linear-to-t from-amber-600 to-amber-400 dark:from-amber-600 dark:to-amber-300 rounded-t-md transition-all duration-500 group-hover:brightness-110"
                      />
                    </div>
                    <span className="text-[11px] font-medium text-slate-500">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Peak Day: Friday ($4.62M)</span>
            <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
              Total 7D: $19.73M
            </span>
          </div>
        </Card>

        {/* Chart 2: Customer Growth */}
        <Card className="p-5 border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Registry Velocity
              </p>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                Customer Base Growth & Acquisition
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-royal-600 dark:text-amber-400 bg-royal-50 dark:bg-royal-950/40 px-2 py-0.5 rounded-full border border-royal-200 dark:border-royal-800">
              2,450 Verified
            </span>
          </div>

          <div className="pt-6 pb-2">
            <div className="h-44 flex items-end justify-between gap-3 px-2">
              {customerGrowthData.map((cg) => {
                const heightPercent = Math.round((cg.total / maxCustomerGrowth) * 100);
                return (
                  <div key={cg.month} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="text-[10px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      +{cg.newUsers}
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-t-lg h-32 flex items-end overflow-hidden">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-linear-to-t from-royal-700 to-royal-500 dark:from-royal-600 dark:to-royal-400 rounded-t-md transition-all duration-500 group-hover:brightness-110"
                      />
                    </div>
                    <span className="text-[11px] font-medium text-slate-500">{cg.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Net Monthly Inflow: +410</span>
            <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
              Retention: 98.4%
            </span>
          </div>
        </Card>

        {/* Chart 3: Deposits Breakdown */}
        <Card className="p-5 border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Custody Distribution
              </p>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                Total Deposits ($72.2M Custody)
              </h3>
            </div>
            <WalletCards className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-4 pt-4">
            {depositsData.map((d) => (
              <div key={d.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {d.category}
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-500">{d.percent}%</span>
                    <strong className="text-slate-900 dark:text-white">
                      ${(d.amount / 1000000).toFixed(1)}M
                    </strong>
                  </div>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${d.percent}%`, backgroundColor: d.color }}
                    className="h-full rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Chart 4: Loans Portfolio Performance */}
        <Card className="p-5 border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Credit Facility Risk
              </p>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                Commercial & Sovereign Loans ($45.9M)
              </h3>
            </div>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3 pt-4 text-xs">
            {loansData.map((l) => (
              <div
                key={l.type}
                className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{l.type}</p>
                  <p className="text-[11px] text-slate-500">
                    Yield APR: <span className="font-mono font-medium text-amber-500">{l.rate}</span>
                  </p>
                </div>
                <div className="text-right font-mono">
                  <p className="font-bold text-slate-900 dark:text-white">
                    ${(l.disbursed / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                    {((l.performing / l.disbursed) * 100).toFixed(1)}% Current
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Chart 5: Revenue Breakdown */}
        <Card className="p-5 border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Operating Revenue
              </p>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                Net Interest Margin & Fee Income
              </h3>
            </div>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>

          <div className="pt-4 space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">NIM Margin</span>
                <p className="text-sm font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                  $1.22M
                </p>
              </div>
              <div className="p-2.5 bg-royal-500/10 rounded-xl border border-royal-500/20">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Fees & Cards</span>
                <p className="text-sm font-bold font-mono text-royal-600 dark:text-royal-400 mt-0.5">
                  $490K
                </p>
              </div>
              <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">FX & Treasury</span>
                <p className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                  $340K
                </p>
              </div>
            </div>

            <div className="pt-2 text-xs space-y-2">
              {revenueStreams.map((rs) => {
                const total = rs.netInterest + rs.feeServices + rs.treasuryFX;
                return (
                  <div key={rs.month} className="flex items-center gap-3">
                    <span className="w-10 text-slate-400 font-mono text-[11px]">{rs.month}</span>
                    <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${(rs.netInterest / total) * 100}%` }}
                        className="bg-amber-500 h-full"
                        title="NIM"
                      />
                      <div
                        style={{ width: `${(rs.feeServices / total) * 100}%` }}
                        className="bg-blue-600 h-full"
                        title="Fee"
                      />
                      <div
                        style={{ width: `${(rs.treasuryFX / total) * 100}%` }}
                        className="bg-emerald-500 h-full"
                        title="FX"
                      />
                    </div>
                    <span className="w-14 text-right font-mono font-medium text-slate-700 dark:text-slate-300">
                      ${(total / 1000000).toFixed(2)}M
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Chart 6: Payment Methods Share */}
        <Card className="p-5 border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Clearing Rails
              </p>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                Payment Channel Breakdown
              </h3>
            </div>
            <ArrowRightLeft className="w-4 h-4 text-slate-400" />
          </div>

          <div className="pt-4 space-y-3">
            {paymentMethods.map((pm) => (
              <div key={pm.name} className="flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2.5 h-2.5 rounded-full ${pm.color} shrink-0`} />
                  <span className="truncate font-medium text-slate-700 dark:text-slate-300">
                    {pm.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0 font-mono">
                  <span className="text-slate-900 dark:text-white font-semibold">{pm.volume}</span>
                  <span className="text-slate-400 w-8 text-right">{pm.share}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
