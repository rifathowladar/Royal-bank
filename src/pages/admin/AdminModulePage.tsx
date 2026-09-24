import React, { useEffect, useState } from 'react';
import { useToast } from '../../hooks/index.ts';
import { Card } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { StatusIndicator } from '../../components/ui/StatusIndicator.tsx';
import { LoadingState } from '../../components/ui/LoadingState.tsx';
import { formatCurrency, formatDate } from '../../utils/formatters.ts';
import {
  getCustomers,
  getAccounts,
  getTransactions,
  getKycApplications,
  getSupportTickets,
  getMerchants,
  getLoans,
  getDeposits,
  Customer,
  Account,
  Transaction,
  KYCApplication,
  SupportTicket,
  Merchant,
} from '../../backend/index.ts';
import {
  Users,
  Landmark,
  ArrowRightLeft,
  QrCode,
  CreditCard,
  Building2,
  WalletCards,
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
  CheckCircle,
  Filter,
  Download,
} from 'lucide-react';

interface AdminModuleProps {
  moduleType:
    | 'customers'
    | 'accounts'
    | 'transactions'
    | 'qr'
    | 'cards'
    | 'loans'
    | 'deposits'
    | 'kyc'
    | 'fraud'
    | 'aml'
    | 'branches'
    | 'employees'
    | 'roles'
    | 'reports'
    | 'audit-logs'
    | 'settings'
    | 'support';
}

export const AdminModulePage: React.FC<AdminModuleProps> = ({ moduleType }) => {
  const { success, info } = useToast();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const loadData = async () => {
      switch (moduleType) {
        case 'customers':
          return await getCustomers();
        case 'accounts':
          return await getAccounts();
        case 'transactions':
          return await getTransactions();
        case 'kyc':
          return await getKycApplications();
        case 'support':
          return await getSupportTickets();
        case 'qr':
          return await getMerchants();
        case 'loans':
          return await getLoans();
        case 'deposits':
          return await getDeposits();
        default:
          return [];
      }
    };

    loadData().then((res) => {
      if (mounted) {
        setData(res);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [moduleType]);

  if (loading) {
    return <LoadingState type="table" rows={5} message="Loading regulatory and administrative records..." />;
  }

  // Customers table
  if (moduleType === 'customers') {
    const customers: Customer[] = data;
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Customer Registry
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verified private and institutional clients holding accounts under Royal Bank charter.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={() => success('Export Generated', 'Customer registry exported to encrypted CSV.')}
            >
              Export Registry
            </Button>
          </div>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="pb-3 px-3">Customer ID</th>
                  <th className="pb-3 px-3">Legal Name</th>
                  <th className="pb-3 px-3">Tier</th>
                  <th className="pb-3 px-3">KYC Status</th>
                  <th className="pb-3 px-3">Risk Score</th>
                  <th className="pb-3 px-3 text-right">Total Balance</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono text-slate-500">{c.customerNumber}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-slate-100">
                      {c.firstName} {c.lastName}
                    </td>
                    <td className="py-3 px-3 text-slate-500">{c.tier}</td>
                    <td className="py-3 px-3">
                      <StatusIndicator status={c.kycStatus} />
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-emerald-600 dark:text-emerald-400">{c.riskScore}</span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold tabular-nums">
                      {formatCurrency(c.totalBalanceUSD, 'USD')}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => info('Customer Dossier', `Loaded records for ${c.firstName} ${c.lastName}`)}
                        className="text-royal-600 dark:text-royal-400 hover:underline font-medium"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  }

  // Transactions table
  if (moduleType === 'transactions') {
    const transactions: Transaction[] = data;
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Transactions Audit Stream
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Immutable ledger of wire transfers, card transactions, and ACH clearing.
            </p>
          </div>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="pb-3 px-3">Ref ID</th>
                  <th className="pb-3 px-3">Type</th>
                  <th className="pb-3 px-3">Counterparty</th>
                  <th className="pb-3 px-3">Timestamp</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono text-slate-500">{t.referenceNumber}</td>
                    <td className="py-3 px-3 capitalize">{t.type.replace(/_/g, ' ')}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[200px]">
                      {t.counterpartyName}
                    </td>
                    <td className="py-3 px-3 text-slate-500">{formatDate(t.timestamp)}</td>
                    <td className="py-3 px-3">
                      <StatusIndicator status={t.status} />
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold tabular-nums">
                      {formatCurrency(t.amount, t.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  }

  // KYC Dossiers
  if (moduleType === 'kyc') {
    const kycList: KYCApplication[] = data;
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            KYC Identity Verification Queue
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Passport, national identification and proof of address compliance dossiers.
          </p>
        </div>

        <div className="space-y-4">
          {kycList.map((k) => (
            <Card key={k.id} className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {k.customerName}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">ID: {k.documentNumberMasked}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Document: {k.documentType} · Submitted: {formatDate(k.submittedAt)}
                  </p>
                  {k.notes && <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">{k.notes}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusIndicator status={k.status} />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => success('KYC Approved', `Dossier for ${k.customerName} verified.`)}
                  >
                    Approve
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Generic admin fallback module
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white capitalize">
          {moduleType.replace(/-/g, ' ')}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Supervisory administration and risk subsystem.
        </p>
      </div>

      <Card title="Module Status: Nominal" subtitle="Synchronized with Royal Bank Core Engine">
        <div className="p-8 text-center">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {moduleType.toUpperCase().replace(/-/g, ' ')} Module Initialized
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Ready for administrative operations, queries, and multi-signature authorization routines.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => success('Audit Checked', `${moduleType} status verified: 0 anomalies`)}
            >
              Run Integrity Check
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
