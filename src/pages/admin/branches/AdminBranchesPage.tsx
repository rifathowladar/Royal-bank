import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GitBranch,
  Building,
  Search,
  Filter,
  RefreshCw,
  MapPin,
  Phone,
  Mail,
  UserCheck,
  DollarSign,
  TrendingUp,
  Radio,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { LoadingState } from '../../../components/ui/LoadingState.tsx';
import { useToast } from '../../../hooks/index.ts';
import { adminBranchService } from '../../../backend/services/adminBranchService.ts';
import { Branch } from '../../../backend/types/index.ts';
import { formatCurrency } from '../../../utils/formatters.ts';

export const AdminBranchesPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedBranches, fetchedMetrics] = await Promise.all([
        adminBranchService.getBranches({
          city: cityFilter,
          type: typeFilter,
          search,
        }),
        adminBranchService.getNetworkMetrics(),
      ]);
      setBranches(fetchedBranches);
      setMetrics(fetchedMetrics);
    } catch (err: any) {
      addToast(err.message || 'Failed to load branch network data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [cityFilter, typeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-royal-500/10 text-royal-600 dark:text-royal-400 font-mono text-[10px] font-bold uppercase tracking-wider">
              GLOBAL PHYSICAL INFRASTRUCTURE
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Branch Network & Regional Treasury Centres
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Vault cash reserves, ATM network telemetry, personnel rosters, and retail branch performance targets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Network Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-royal-600">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Global Centers</span>
            <Building className="w-4 h-4 text-royal-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {metrics?.totalBranches ?? 0} Facilities
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Across 5 international sovereign hubs
          </p>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Vault Cash Reserves</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {formatCurrency(metrics?.totalVaultCashUSD ?? 0, 'USD')}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Aggregated vault physical balance
          </p>
        </Card>

        <Card className="p-4 border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>ATM Fleet Status</span>
            <Radio className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {metrics?.operationalAtms} / {metrics?.totalAtms} Active
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            24/7 secure dispensers operational
          </p>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Daily Network Volume</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white font-mono">
            {formatCurrency(metrics?.todayNetworkVolumeUSD ?? 0, 'USD')}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Teller & OTC settlement volume
          </p>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card className="p-4 space-y-3">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Branch Name, Code, City, or Manager..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <Button type="submit" size="sm" variant="primary">
            Search
          </Button>
        </form>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              >
                <option value="all">All Facility Types</option>
                <option value="Flagship">Flagship</option>
                <option value="Private Banking Suite">Private Banking Suite</option>
                <option value="Corporate Centre">Corporate Centre</option>
                <option value="Retail Branch">Retail Branch</option>
              </select>
            </div>
          </div>

          <div className="text-slate-500 text-[11px]">
            Branches: <span className="font-bold text-slate-800 dark:text-slate-200">{branches.length}</span>
          </div>
        </div>
      </Card>

      {/* Branch Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading && !branches.length ? (
          <div className="col-span-2 p-8">
            <LoadingState message="Accessing global branch controllers..." />
          </div>
        ) : (
          branches.map((b) => (
            <Card
              key={b.id}
              className="p-5 hover:border-royal-300 dark:hover:border-royal-700 transition-colors flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-royal-600 dark:text-royal-400">
                        {b.code}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {b.type}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                      {b.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>{b.address}, {b.city}, {b.country}</span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                    {b.status}
                  </span>
                </div>

                {/* Manager & Staff */}
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
                  <img
                    src={b.branchManager.avatar}
                    alt={b.branchManager.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-300"
                  />
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Branch Manager</div>
                    <div className="font-bold text-slate-900 dark:text-white">{b.branchManager.name}</div>
                    <div className="text-[11px] text-slate-500">{b.branchManager.email}</div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Staff</div>
                    <div className="font-bold text-slate-900 dark:text-white">{b.employeesCount} Staff</div>
                  </div>
                </div>

                {/* Cash Position & Performance Snapshot */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Vault Cash Position</span>
                    <div className="font-mono font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                      {formatCurrency(b.cashPosition.vaultCashUSD, 'USD')}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Status: <span className="font-semibold uppercase text-emerald-600">{b.cashPosition.status}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">ATM Health</span>
                    <div className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                      {b.atms.filter((a) => a.status === 'operational').length} / {b.atms.length} Online
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Rating: <span className="font-semibold text-amber-500 font-mono">★ {b.performance.customerRating}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Card Action */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  Today's Vol: {formatCurrency(b.volumeUSDToday, 'USD')}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/admin/branches/${b.id}`)}
                  className="text-xs"
                >
                  Manage Branch Cockpit &rarr;
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
