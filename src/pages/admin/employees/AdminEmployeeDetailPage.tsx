import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Users,
  ArrowLeft,
  Mail,
  Phone,
  Building,
  KeyRound,
  Shield,
  Activity,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  RefreshCw,
  Smartphone,
  Globe,
  Edit,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import { LoadingState } from '../../../components/ui/LoadingState.tsx';
import { PermissionGate } from '../../../components/common/PermissionGate.tsx';
import { useToast } from '../../../hooks/index.ts';
import { adminEmployeeService } from '../../../backend/services/adminEmployeeService.ts';
import { Employee, AdminRole } from '../../../backend/types/index.ts';
import { mockRoles } from '../../../backend/data/mockRbac.ts';
import { formatDate } from '../../../utils/formatters.ts';

export const AdminEmployeeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<Employee | null>(null);

  // Edit role modal
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AdminRole>('customer_service');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  // Status toggle
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const fetchEmployee = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await adminEmployeeService.getEmployeeById(id);
      if (!data) {
        addToast('Employee profile not found.', 'error');
        navigate('/admin/employees');
        return;
      }
      setEmployee(data);
      setSelectedRole(data.role);
    } catch (err: any) {
      addToast(err.message || 'Failed to load employee profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;
    setIsUpdatingRole(true);

    try {
      const updated = await adminEmployeeService.updateEmployeeRole(employee.id, selectedRole);
      setEmployee(updated);
      addToast(`Role updated to ${selectedRole.toUpperCase()}. Matrix privileges reapplied.`, 'success');
      setRoleModalOpen(false);
    } catch (err: any) {
      addToast(err.message || 'Failed to update role clearance.', 'error');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!employee) return;
    setIsTogglingStatus(true);
    const newStatus = employee.status === 'active' ? 'suspended' : 'active';

    try {
      const updated = await adminEmployeeService.updateEmployeeStatus(
        employee.id,
        newStatus,
        `Administrative status update to ${newStatus}`
      );
      setEmployee(updated);
      addToast(`Staff member credentials status is now ${newStatus.toUpperCase()}`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to update status.', 'error');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  if (loading || !employee) {
    return (
      <div className="p-8">
        <LoadingState message="Loading staff credentials & audit timeline..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <Link
            to="/admin/employees"
            className="text-xs text-royal-600 dark:text-royal-400 hover:underline flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Employee Roster
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {employee.fullName}
            </h1>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-royal-100 text-royal-800 dark:bg-royal-950 dark:text-royal-300">
              {employee.employeeId}
            </span>
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                employee.status === 'active'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}
            >
              {employee.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {employee.jobTitle} • {employee.department}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <PermissionGate resource="employees" action="edit">
            <Button size="sm" variant="outline" onClick={() => setRoleModalOpen(true)}>
              <KeyRound className="w-3.5 h-3.5 mr-1 text-royal-600" />
              Change Role
            </Button>
            <Button
              size="sm"
              variant={employee.status === 'active' ? 'danger' : 'primary'}
              onClick={handleToggleStatus}
              disabled={isTogglingStatus}
            >
              {employee.status === 'active' ? (
                <>
                  <Lock className="w-3.5 h-3.5 mr-1" />
                  Suspend Access
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5 mr-1" />
                  Reactivate Access
                </>
              )}
            </Button>
          </PermissionGate>
          <Button size="sm" variant="outline" onClick={fetchEmployee}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Profile & Department Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <img
              src={employee.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={employee.fullName}
              className="w-14 h-14 rounded-full object-cover border-2 border-royal-500"
            />
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-base">
                {employee.fullName}
              </div>
              <div className="text-xs text-slate-500">{employee.jobTitle}</div>
              <div className="font-mono text-[11px] text-royal-600 dark:text-royal-400 font-semibold mt-0.5">
                {employee.employeeId}
              </div>
            </div>
          </div>

          <div className="text-xs space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{employee.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{employee.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>Branch: <strong className="text-slate-800 dark:text-slate-200">{employee.branchName}</strong> ({employee.branchCode})</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Onboarded: {formatDate(employee.hireDate || employee.joinedDate)}</span>
            </div>
          </div>
        </Card>

        {/* Security & RBAC Clearance */}
        <Card className="p-5 space-y-3 border-l-4 border-l-royal-600">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-semibold">
            <span>RBAC Security Clearance</span>
            <Shield className="w-4 h-4 text-royal-600" />
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Assigned Role</span>
            <div className="text-lg font-bold text-slate-900 dark:text-white uppercase font-mono mt-0.5">
              {employee.role.replace('_', ' ')}
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-1">
            <div className="flex justify-between">
              <span>MFA Enforcement:</span>
              <span className={`font-semibold ${employee.mfaEnabled ? 'text-emerald-600' : 'text-rose-500'}`}>
                {employee.mfaEnabled ? '✓ Hardware Token (FIDO2)' : 'Disabled'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Department:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{employee.department}</span>
            </div>
            <div className="flex justify-between">
              <span>Clearance Level:</span>
              <span className="font-mono font-bold text-royal-600">
                Tier {employee.role === 'super_admin' ? '1 (Global Root)' : employee.role === 'bank_admin' ? '2 (Supervisory)' : '3 (Operational)'}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <Link to="/admin/permissions" className="text-xs text-royal-600 dark:text-royal-400 hover:underline">
              Inspect Role Permission Matrix &rarr;
            </Link>
          </div>
        </Card>

        {/* Session Telemetry */}
        <Card className="p-5 space-y-3 border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-semibold">
            <span>Last Auth Session</span>
            <Activity className="w-4 h-4 text-indigo-500" />
          </div>

          {employee.lastLoginAt ? (
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Timestamp</span>
                <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  {formatDate(employee.lastLoginAt)}
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Connecting IP</span>
                <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {employee.lastLoginIp}
                </div>
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Session authenticated via SSO SAML 2.0
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">No previous sessions recorded.</p>
          )}
        </Card>
      </div>

      {/* Login Activity History Table */}
      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-royal-600" />
          Authentication & Access Activity Audit Log
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase text-[10px] font-semibold">
              <tr>
                <th className="px-3 py-2.5">Timestamp</th>
                <th className="px-3 py-2.5">IP Address</th>
                <th className="px-3 py-2.5">Device & Browser</th>
                <th className="px-3 py-2.5">Origin Location</th>
                <th className="px-3 py-2.5">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {employee.loginActivity.map((act) => (
                <tr key={act.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-3 py-2.5 font-medium text-slate-900 dark:text-white">
                    {formatDate(act.timestamp)}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-slate-700 dark:text-slate-300">
                    {act.ipAddress}
                  </td>
                  <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Smartphone className="w-3 h-3 text-slate-400" />
                      <span>{act.device} ({act.browser})</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-1">
                      <Globe className="w-3 h-3 text-slate-400" />
                      <span>{act.location}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                        act.status === 'success'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {act.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Change Role Modal */}
      {roleModalOpen && (
        <Modal
          isOpen={roleModalOpen}
          onClose={() => setRoleModalOpen(false)}
          title={`Modify RBAC Role Assignment • ${employee.fullName}`}
          subtitle={`Current clearance: ${employee.role.toUpperCase()}`}
          maxWidth="md"
        >
          <form onSubmit={handleUpdateRole} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Authorized Banking Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as AdminRole)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {mockRoles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} — {r.department}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                SECURITY AUDIT NOTICE
              </p>
              <p className="mt-1 text-[11px]">
                Modifying role permissions immediately shifts operational boundaries, active token capabilities, and access permissions in according to the global authorization matrix.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="outline" size="sm" onClick={() => setRoleModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="primary" disabled={isUpdatingRole}>
                {isUpdatingRole ? 'Updating...' : 'Confirm Role Reassignment'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
