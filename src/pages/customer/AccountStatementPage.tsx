import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  accountService,
  transactionService,
  Account,
  Transaction,
} from '../../backend/index.ts';
import { Button } from '../../components/ui/Button.tsx';
import { LoadingState } from '../../components/ui/LoadingState.tsx';
import { BrandLogo } from '../../components/common/BrandLogo.tsx';
import {
  ArrowLeft,
  Download,
  Printer,
  Calendar,
  ShieldCheck,
  Building2,
  FileText,
  CheckCircle2,
} from 'lucide-react';

export const AccountStatementPage: React.FC = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();

  const [account, setAccount] = useState<Account | null>(null);
  const [statementData, setStatementData] = useState<{
    account: Account;
    transactions: Transaction[];
    openingBalance: number;
    closingBalance: number;
    totalCredits: number;
    totalDebits: number;
    statementPeriod: { from: string; to: string };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodOption, setPeriodOption] = useState<'30' | '90' | '180' | 'ytd'>('30');

  useEffect(() => {
    const fetchStatement = async () => {
      if (!accountId) return;
      setLoading(true);
      try {
        let fromDate = new Date();
        if (periodOption === '30') fromDate.setDate(fromDate.getDate() - 30);
        else if (periodOption === '90') fromDate.setDate(fromDate.getDate() - 90);
        else if (periodOption === '180') fromDate.setDate(fromDate.getDate() - 180);
        else if (periodOption === 'ytd') fromDate = new Date(new Date().getFullYear(), 0, 1);

        const data = await transactionService.getAccountStatement(
          accountId,
          fromDate.toISOString(),
          new Date().toISOString()
        );
        setAccount(data.account);
        setStatementData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatement();
  }, [accountId, periodOption]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    if (!statementData) return;
    const headers = ['Date', 'Value Date', 'Description', 'Reference', 'Type', 'Amount', 'Currency'];
    const rows = statementData.transactions.map((tx) => [
      new Date(tx.timestamp).toISOString().split('T')[0],
      new Date(tx.timestamp).toISOString().split('T')[0],
      `"${tx.description}"`,
      tx.referenceNumber,
      tx.type,
      tx.amount,
      tx.currency,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `statement_${account?.accountNumber}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <LoadingState type="table" message="Compiling official account statement..." />;
  }

  if (!account || !statementData) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-bold">Statement Unavailable</h2>
        <Button variant="outline" onClick={() => navigate('/bank/accounts')} className="mt-4">
          Return to Accounts
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/bank/accounts/${account.id}`)}
            icon={<ArrowLeft className="w-4 h-4" />}
            className="text-slate-600 dark:text-slate-400"
          >
            Back to Account
          </Button>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
          <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
            Official E-Statement
          </span>
        </div>

        {/* Period Selector & Print Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setPeriodOption('30')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                periodOption === '30' ? 'bg-white dark:bg-slate-700 font-bold shadow-xs text-slate-900 dark:text-white' : 'text-slate-500'
              }`}
            >
              Last 30 Days
            </button>
            <button
              type="button"
              onClick={() => setPeriodOption('90')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                periodOption === '90' ? 'bg-white dark:bg-slate-700 font-bold shadow-xs text-slate-900 dark:text-white' : 'text-slate-500'
              }`}
            >
              90 Days
            </button>
            <button
              type="button"
              onClick={() => setPeriodOption('ytd')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                periodOption === 'ytd' ? 'bg-white dark:bg-slate-700 font-bold shadow-xs text-slate-900 dark:text-white' : 'text-slate-500'
              }`}
            >
              Year-to-Date
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadCSV}
            icon={<Download className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Export CSV
          </Button>
          <Button
            variant="gold"
            size="sm"
            onClick={handlePrint}
            icon={<Printer className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Print / Save PDF
          </Button>
        </div>
      </div>

      {/* Official Bank Statement Document Canvas (Printable Paper Style) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-sm space-y-8 text-xs text-slate-900 dark:text-slate-100 max-w-5xl mx-auto">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
          <div>
            <BrandLogo />
            <p className="text-[11px] text-slate-500 mt-2">
              Royal Bank of Sovereign Depository & Clearing AG
            </p>
            <p className="text-[11px] text-slate-500">
              Institutional Global Head Office • 450 Park Avenue, NY 10022
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              SWIFT: ROBANUS33XXX • FDIC / PRA Regulated
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <h2 className="text-lg font-extrabold uppercase tracking-wider text-royal-600 dark:text-gold-400">
              Account Periodic Statement
            </h2>
            <p className="font-mono text-slate-500 text-[11px]">
              Doc Ref: RB-STM-{Date.now().toString(36).toUpperCase()}
            </p>
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3 h-3" /> FIPS 140-2 Cryptographically Certified
            </div>
          </div>
        </div>

        {/* Customer & Account Metadata Bento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Account Holder Details</span>
            <div className="font-bold text-sm text-slate-900 dark:text-white">{account.accountHolder}</div>
            <div className="text-slate-600 dark:text-slate-400">Customer Number: RB-984021</div>
            <div className="text-slate-600 dark:text-slate-400">Domiciled Branch: {account.branch}</div>
            <div className="text-slate-600 dark:text-slate-400">Tier: Private Sovereign Client</div>
          </div>

          <div className="space-y-1.5 md:text-right">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Statement Parameters</span>
            <div className="font-mono font-bold text-sm text-slate-900 dark:text-white">
              Account #{account.accountNumber}
            </div>
            <div className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">IBAN: {account.iban}</div>
            <div className="text-slate-600 dark:text-slate-400">
              Period: {new Date(statementData.statementPeriod.from).toLocaleDateString()} to{' '}
              {new Date(statementData.statementPeriod.to).toLocaleDateString()}
            </div>
            <div className="text-slate-600 dark:text-slate-400">Currency: {account.currency}</div>
          </div>
        </div>

        {/* Summary Numbers Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-royal-950 text-white font-mono text-center">
          <div className="p-2 border-r border-white/10">
            <span className="text-[10px] text-slate-400 block uppercase">Opening Balance</span>
            <span className="text-base font-bold">
              ${statementData.openingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-2 border-r border-white/10">
            <span className="text-[10px] text-slate-400 block uppercase">Total Credits (+)</span>
            <span className="text-base font-bold text-emerald-400">
              +${statementData.totalCredits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-2 border-r border-white/10">
            <span className="text-[10px] text-slate-400 block uppercase">Total Debits (-)</span>
            <span className="text-base font-bold text-slate-300">
              -${statementData.totalDebits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-2">
            <span className="text-[10px] text-slate-400 block uppercase">Closing Balance</span>
            <span className="text-base font-bold text-gold-400">
              ${statementData.closingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Line-by-Line Itemized Table */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
            Itemized Ledger Entries
          </h4>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3 font-semibold">Post Date</th>
                  <th className="p-3 font-semibold">Reference</th>
                  <th className="p-3 font-semibold">Narrative / Counterparty</th>
                  <th className="p-3 font-semibold">Category</th>
                  <th className="p-3 font-semibold text-right">Debit (-)</th>
                  <th className="p-3 font-semibold text-right">Credit (+)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {statementData.transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-sans">
                      No transactional activity recorded during this statement period.
                    </td>
                  </tr>
                ) : (
                  statementData.transactions.map((tx) => {
                    const isCredit = tx.amount > 0;
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-[11px] text-slate-500">{tx.referenceNumber}</td>
                        <td className="p-3 font-sans font-medium text-slate-900 dark:text-white">
                          {tx.counterpartyName || tx.description}
                        </td>
                        <td className="p-3 font-sans text-slate-500">{tx.category}</td>
                        <td className="p-3 text-right text-slate-900 dark:text-white font-semibold">
                          {!isCredit ? `$${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
                        </td>
                        <td className="p-3 text-right text-emerald-600 dark:text-emerald-400 font-semibold">
                          {isCredit ? `$${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legal Disclosures & Security Footer */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              End-of-period audited snapshot. In accordance with Basel III capital and deposit insurance guidelines.
            </span>
          </div>
          <div className="font-mono text-slate-400">Page 1 of 1 • System Generated</div>
        </div>
      </div>
    </div>
  );
};
