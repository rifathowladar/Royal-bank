import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  KeyRound,
  Shield,
  Search,
  Filter,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Lock,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { LoadingState } from '../../../components/ui/LoadingState.tsx';
import { useAdminPermissions } from '../../../hooks/useAdminPermissions.ts';
import { useToast } from '../../../hooks/index.ts';
import { adminRbacService } from '../../../backend/services/adminRbacService.ts';
import { RoleDefinition, AdminRole } from '../../../backend/types/index.ts';

export const AdminRolesPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { role: currentRole, switchRole } = useAdminPermissions();

  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [search, setSearch] = useState('');
  const [switchingTo, setSwitchingTo] = useState<AdminRole | null>(null);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const data = await adminRbacService.getRoles();
      setRoles(data);
    } catch (err: any) {
      addToast(err.message || 'Failed to fetch roles.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleTestRole = async (targetRole: AdminRole) => {
    try {
      setSwitchingTo(targetRole);
      await switchRole(targetRole);
      addToast(`Switched active operational session to: ${targetRole.replace('_', ' ').toUpperCase()}`, 'info');
    } catch (err: any) {
      addToast(err.message || 'Failed to switch role.', 'error');
    } finally {
      setSwitchingTo(null);
    }
  };

  const filteredRoles = roles.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.department.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-royal-500/10 text-royal-600 dark:text-royal-400 font-mono text-[10px] font-bold uppercase tracking-wider">
              AUTHORIZATION & ACCESS CONTROL (RBAC)
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Standard Bank Operating Roles
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            14 distinct functional roles across retail branches, treasury, risk, compliance, underwriting, and SIU forensics.
          </p>
        </div>

        {/* Sub-Nav */}
        <div className="flex items-center gap-2">
          <Link
            to="/admin/roles"
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900"
          >
            Role Definitions ({roles.length})
          </Link>
          <Link
            to="/admin/permissions"
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
          >
            Permission Matrix Grid
          </Link>
          <Button variant="outline" size="sm" onClick={fetchRoles}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Active Role Simulation Banner */}
      <div className="p-4 rounded-xl border border-royal-200 dark:border-royal-900/60 bg-royal-50/50 dark:bg-royal-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-royal-600 text-white">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-royal-700 dark:text-royal-300">
              Active Session Clearance
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{currentRole.replace('_', ' ').toUpperCase()}</span>
              {currentRole === 'super_admin' ? (
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-mono font-bold">
                  ROOT PRIVILEGES
                </span>
              ) : (
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono font-semibold">
                  RESTRICTED MATRIX APPLIED
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/permissions"
            className="text-xs font-semibold text-royal-600 dark:text-royal-400 hover:underline"
          >
            View Permissions Matrix &rarr;
          </Link>
        </div>
      </div>

      {/* Search Input */}
      <Card className="p-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roles by title, department, or scope..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
      </Card>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && !roles.length ? (
          <div className="col-span-full p-8">
            <LoadingState message="Loading RBAC role definitions..." />
          </div>
        ) : (
          filteredRoles.map((r) => {
            const isCurrent = currentRole === r.id;
            return (
              <Card
                key={r.id}
                className={`p-4 transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'border-2 border-royal-600 dark:border-royal-500 shadow-md bg-royal-50/20 dark:bg-royal-950/20'
                    : 'hover:border-slate-400 dark:hover:border-slate-600'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                        Tier {r.tier}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                        {r.title}
                      </h3>
                      <div className="text-[11px] text-royal-600 dark:text-royal-400 font-semibold">
                        {r.department}
                      </div>
                    </div>

                    {isCurrent ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-royal-600 text-white shrink-0">
                        Active
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] text-slate-400 shrink-0">
                        {r.id}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {r.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between">
                  <Link
                    to={`/admin/permissions?role=${r.id}`}
                    className="text-[11px] text-slate-500 hover:text-royal-600 dark:hover:text-royal-400 font-medium"
                  >
                    View Matrix
                  </Link>

                  <Button
                    size="sm"
                    variant={isCurrent ? 'outline' : 'primary'}
                    disabled={isCurrent || switchingTo === r.id}
                    onClick={() => handleTestRole(r.id)}
                    className="text-xs"
                  >
                    {isCurrent
                      ? 'Current Session'
                      : switchingTo === r.id
                      ? 'Activating...'
                      : 'Test Role'}
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
