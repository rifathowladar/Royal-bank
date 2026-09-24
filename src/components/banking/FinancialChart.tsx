import React, { useState } from 'react';
import { TrendingUp, ArrowDownLeft, ArrowUpRight, PieChart, BarChart3 } from 'lucide-react';

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
}

interface FinancialChartProps {
  monthlyTrends?: MonthlyData[];
  categoryBreakdown?: CategoryData[];
  className?: string;
}

export const FinancialChart: React.FC<FinancialChartProps> = ({
  monthlyTrends = [
    { month: 'Apr', income: 65000, expense: 38200 },
    { month: 'May', income: 72000, expense: 42100 },
    { month: 'Jun', income: 84000, expense: 51200 },
    { month: 'Jul', income: 68000, expense: 34900 },
    { month: 'Aug', income: 91000, expense: 62400 },
    { month: 'Sep', income: 85000, expense: 41100 },
  ],
  categoryBreakdown = [
    { category: 'Investment & Equity', amount: 50000, percentage: 54.3 },
    { category: 'Aviation & Travel', amount: 18500, percentage: 20.1 },
    { category: 'Private Dining', amount: 1160, percentage: 1.3 },
    { category: 'Utilities & Residence', amount: 1850, percentage: 2.0 },
    { category: 'Bespoke Shopping', amount: 4500, percentage: 4.9 },
  ],
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'trends' | 'categories'>('trends');
  const [hoveredMonth, setHoveredMonth] = useState<MonthlyData | null>(null);

  const maxVal = Math.max(...monthlyTrends.map((d) => Math.max(d.income, d.expense)), 100000);

  return (
    <div
      className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5 ${className}`}
    >
      {/* Header and Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Financial Analytics & Cash Flow
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Quarterly income vs expenditure reconciliation
          </p>
        </div>

        <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 self-start sm:self-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('trends')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'trends'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Income vs Expense</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'categories'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Category Spending</span>
          </button>
        </div>
      </div>

      {activeTab === 'trends' ? (
        <div className="space-y-4">
          {/* Key Metric Pills */}
          <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-600 dark:text-slate-300">Inbound Cash Inflow</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-royal-500 dark:bg-gold-500" />
              <span className="text-slate-600 dark:text-slate-300">Outbound Expenditure</span>
            </div>
            {hoveredMonth && (
              <div className="ml-auto font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg text-slate-700 dark:text-slate-300">
                {hoveredMonth.month}: Income ${hoveredMonth.income.toLocaleString()} | Expense ${hoveredMonth.expense.toLocaleString()}
              </div>
            )}
          </div>

          {/* SVG Bar Chart */}
          <div className="h-56 w-full flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-100 dark:border-slate-800">
            {monthlyTrends.map((d, i) => {
              const incomeHeight = Math.round((d.income / maxVal) * 160);
              const expenseHeight = Math.round((d.expense / maxVal) * 160);

              return (
                <div
                  key={i}
                  onMouseEnter={() => setHoveredMonth(d)}
                  onMouseLeave={() => setHoveredMonth(null)}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer"
                >
                  <div className="w-full flex items-end justify-center gap-1.5 h-44">
                    {/* Income Bar */}
                    <div
                      style={{ height: `${incomeHeight}px` }}
                      className="w-1/2 max-w-[20px] rounded-t-lg bg-emerald-500 group-hover:bg-emerald-400 transition-all relative"
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-mono px-1 rounded pointer-events-none whitespace-nowrap z-20">
                        +${(d.income / 1000).toFixed(0)}k
                      </div>
                    </div>

                    {/* Expense Bar */}
                    <div
                      style={{ height: `${expenseHeight}px` }}
                      className="w-1/2 max-w-[20px] rounded-t-lg bg-royal-500 dark:bg-gold-500 group-hover:opacity-80 transition-all relative"
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-mono px-1 rounded pointer-events-none whitespace-nowrap z-20">
                        -${(d.expense / 1000).toFixed(0)}k
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 font-mono">
                    {d.month}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1 font-mono">
            <span>Basel III Liquidity Surplus: +$43,900 / mo avg</span>
            <span>Net Growth Rate: +6.8%</span>
          </div>
        </div>
      ) : (
        /* Category Breakdown View */
        <div className="space-y-3 pt-1 text-xs">
          {categoryBreakdown.map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {item.category}
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  ${item.amount.toLocaleString()} ({item.percentage}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${Math.min(item.percentage, 100)}%` }}
                  className={`h-full rounded-full ${
                    idx === 0
                      ? 'bg-royal-600 dark:bg-gold-500'
                      : idx === 1
                      ? 'bg-emerald-500'
                      : idx === 2
                      ? 'bg-amber-500'
                      : 'bg-blue-500'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
