import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  KeyRound,
  Shield,
  Check,
  X,
  RefreshCw,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { LoadingState } from '../../../components/ui/LoadingState.tsx';
import { useAdminPermissions } from '../../../hooks/useAdminPermissions.ts';
import { useToast } from '../../../hooks/index.ts';
import { adminRbacService } from '../../../backend/services/adminRbacService.ts';
import {
  AdminRole,
  PermissionResource,
  PermissionAction,
  PermissionMatrix,
} from '../../../backend/types/index.ts';
import { mockRoles } from '../../../backend/data/mockRbac.ts';

const RESOURCES: { key: PermissionResource; label: string; desc: string }[] = [
  { key: 'dashboard', label: 'Command Center', desc: 'Executive telemetry & KPI charts' },
  { key: 'customers', label: 'Customer Registry', desc: 'Account holders, profile identity' },
  { key: 'accounts', label: 'Account Ledgers', desc: 'Checking, savings, balance limits' },
  { key: 'transactions', label: 'Transaction Stream', desc: 'Wire transfers, reversals, approvals' },
  { key: 'cards', label: 'Card Management', desc: 'Debit/Credit card provisioning & locks' },
  { key: 'loans', label: 'Credit & Loans', desc: 'Underwriting, disbursements, schedules' },
  { key: 'deposits', label: 'Treasury Deposits', desc: 'CD accounts, term deposits, rates' },
  { key: 'qr', label: 'Merchant QR', desc: 'Dynamic payment terminals & settlement' },
  { key: 'kyc', label: 'KYC Applications', desc: 'Document verification & ID clearance' },
  { key: 'fraud', label: 'Fraud Engine', desc: 'Risk scoring, telemetry, hard freeze' },
  { key: 'aml', label: 'AML & Sanctions', desc: 'Structuring detection, PEP, SAR filings' },
  { key: 'branches', label: 'Branch Network', desc: 'Vault cash, regional facilities, ATMs' },
  { key: 'employees', label: 'Bank Employees', desc: 'Staff directory, clearances, sessions' },
  { key: 'roles', label: 'RBAC Security Matrix', desc: 'Role definitions & privilege matrix' },
  { key: 'reports', label: 'Executive Reports', desc: 'Financial statements, exports, analytics' },
  { key: 'audit_logs', label: 'Immutable Audit Logs', desc: 'Cryptographic compliance audit trails' },
  { key: 'settings', label: 'System Settings', desc: 'Core platform parameters & keys' },
];

const ACTIONS: { key: PermissionAction; label: string; color: string }[] = [
  { key: 'view', label: 'View', color: 'text-blue-600' },
  { key: 'create', label: 'Create', color: 'text-emerald-600' },
  { key: 'edit', label: 'Edit', color: 'text-amber-600' },
  { key: 'approve', label: 'Approve', color: 'text-indigo-600' },
  { key: 'reject', label: 'Reject', color: 'text-rose-600' },
  { key: 'delete', label: 'Delete', color: 'text-red-700' },
  { key: 'export', label: 'Export', color: 'text-purple-600' },
];

export const AdminPermissionsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useToast();
  const { role: currentSessionRole, switchRole } = useAdminPermissions();

  const [loading, setLoading] = useState(true);
  const [matrix, setMatrix] = useState<PermissionMatrix | null>(null);

  const initialRole = (searchParams.get('role') as AdminRole) || currentSessionRole || 'super_admin';
  const [selectedRole, setSelectedRole] = useState<AdminRole>(initialRole);

  const fetchMatrix = async () => {
    try {
      setLoading(true);
      const data = await adminRbacService.getPermissionMatrix();
      setMatrix(data);
    } catch (err: any) {
      addToast(err.message || 'Failed to fetch matrix.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrix();
  }, []);

  const handleRoleChange = (role: AdminRole) => {
    setSelectedRole(role);
    setSearchParams({ role });
  };

  const handleTogglePermission = async (resource: PermissionResource, action: PermissionAction) => {
    if (selectedRole === 'super_admin') {
      addToast('Super Admin holds immutable root wildcard clearance (*:*)', 'info');
      return;
    }

    try {
      const updated = await adminRbacService.togglePermission(selectedRole, resource, action);
      setMatrix(updated);
      addToast(`Updated ${action.toUpperCase()} on ${resource} for ${selectedRole}`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to toggle permission.', 'error');
    }
  };

  const handleReset = async () => {
    try {
      const reset = await adminRbacService.resetToDefaults();
      setMatrix(reset);
      addToast('Reset permission matrix to default institutional standards.', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to reset matrix.', 'error');
    }
  };

  const handleActivateRoleSession = async () => {
    try {
      await switchRole(selectedRole);
      addToast(`Active session role shifted to: ${selectedRole.toUpperCase()}`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to switch role.', 'error');
    }
  };

  if (loading || !matrix) {
    return (
      <div className="p-8">
        <LoadingState message="Loading enterprise RBAC permission matrix..." />
      </div>
    );
  }

  const rolePermissions = matrix[selectedRole] || {};
  const currentRoleDef = mockRoles.find((r) => r.id === selectedRole);

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
            Enterprise RBAC Authorization Matrix
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Fine-grained 7-dimensional CRUD and approval permissions across all 17 core banking modules.
          </p>
        </div>

        {/* Sub-Nav */}
        <div className="flex items-center gap-2">
          <Link
            to="/admin/roles"
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
          >
            Role Definitions
          </Link>
          <Link
            to="/admin/permissions"
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900"
          >
            Permission Matrix Grid
          </Link>
          <Button variant="outline" size="sm" onClick={handleReset} title="Reset Matrix to Factory Presets">
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset Defaults
          </Button>
        </div>
      </div>

      {/* Role Picker Toolbar & Interactive Simulator */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Select Role to Configure & Inspect:
            </label>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {mockRoles.map((r) => {
                const isSelected = selectedRole === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => handleRoleChange(r.id)}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                      isSelected
                        ? 'bg-royal-600 text-white shadow-xs font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {r.title}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 pt-2 lg:pt-0">
            {selectedRole !== currentSessionRole ? (
              <Button size="sm" variant="primary" onClick={handleActivateRoleSession}>
                <KeyRound className="w-3.5 h-3.5 mr-1" />
                Assume {currentRoleDef?.title} Clearance
              </Button>
            ) : (
              <span className="px-3 py-1.5 text-xs font-bold uppercase rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Active Session Role
              </span>
            )}
          </div>
        </div>

        {/* Role Summary Banner */}
        {currentRoleDef && (
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
            <div>
              <span className="font-bold text-slate-900 dark:text-white">
                {currentRoleDef.title} ({currentRoleDef.department})
              </span>
              <p className="text-slate-500 mt-0.5">{currentRoleDef.description}</p>
            </div>
            <div className="font-mono text-royal-600 dark:text-royal-400 font-semibold shrink-0">
              Tier {currentRoleDef.tier} Clearance
            </div>
          </div>
        )}
      </Card>

      {/* Permission Matrix Grid */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3 min-w-[220px]">Banking Resource</th>
                {ACTIONS.map((act) => (
                  <th key={act.key} className="px-3 py-3 text-center">
                    <span className={act.color}>{act.label}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {RESOURCES.map((res) => {
                const actionsForRes = rolePermissions[res.key] || [];
                const isSuperAdmin = selectedRole === 'super_admin';

                return (
                  <tr
                    key={res.key}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {res.label}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {res.desc}
                      </div>
                    </td>

                    {ACTIONS.map((act) => {
                      const hasAccess = isSuperAdmin || actionsForRes.includes(act.key);

                      return (
                        <td key={act.key} className="px-3 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleTogglePermission(res.key, act.key)}
                            disabled={isSuperAdmin}
                            title={`${hasAccess ? 'Revoke' : 'Grant'} ${act.label} on ${res.label}`}
                            className={`w-7 h-7 mx-auto rounded-md flex items-center justify-center transition-all ${
                              hasAccess
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                                : 'bg-slate-100 text-slate-300 dark:bg-slate-800/80 dark:text-slate-600 hover:bg-slate-200'
                            } ${isSuperAdmin ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                          >
                            {hasAccess ? (
                              <Check className="w-4 h-4 stroke-[3]" />
                            ) : (
                              <X className="w-3.5 h-3.5 opacity-40" />
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
