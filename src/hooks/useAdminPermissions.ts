import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './index.ts';
import {
  AdminRole,
  UserRole,
  PermissionResource,
  PermissionAction,
  RoleDefinition,
} from '../backend/types/index.ts';
import { adminRbacService } from '../backend/services/adminRbacService.ts';
import { mockRoles } from '../backend/data/mockRbac.ts';

export interface AdminPermissions {
  role: AdminRole;
  roleTitle: string;
  isSuperAdmin: boolean;
  isComplianceOfficer: boolean;
  isAdmin: boolean;
  can: (resource: PermissionResource, action: PermissionAction) => boolean;
  switchRole: (newRole: AdminRole) => Promise<void>;
  availableRoles: RoleDefinition[];

  // Convenience permission booleans mapped to RBAC matrix
  canViewCustomers: boolean;
  canEditCustomer: boolean;
  canFreezeCustomer: boolean;
  canResetPassword: boolean;
  canManageRisk: boolean;
  canCreateAccount: boolean;
  canApproveAccount: boolean;
  canFreezeAccount: boolean;
  canCloseAccount: boolean;
  canChangeAccountLimits: boolean;
  canChangeAccountStatus: boolean;
  canApproveTransaction: boolean;
  canRejectTransaction: boolean;
  canReverseTransaction: boolean;
  canRefundTransaction: boolean;
  canExportData: boolean;
  canManageKyc: boolean;
  canViewAuditLogs: boolean;
}

export function useAdminPermissions(): AdminPermissions {
  const { user } = useAuth();
  const [activeRole, setActiveRoleState] = useState<AdminRole>(() => {
    return adminRbacService.getActiveRole();
  });
  const [matrixRevision, setMatrixRevision] = useState(0);

  // Sync if auth user changes
  useEffect(() => {
    if (user?.role && user.role !== 'customer') {
      setActiveRoleState(user.role as AdminRole);
      adminRbacService.setActiveRole(user.role as AdminRole);
    }
  }, [user]);

  const switchRole = useCallback(async (newRole: AdminRole) => {
    await adminRbacService.setActiveRole(newRole);
    setActiveRoleState(newRole);
    setMatrixRevision((v) => v + 1);
  }, []);

  const can = useCallback(
    (resource: PermissionResource, action: PermissionAction): boolean => {
      // matrixRevision dependency ensures reactivity when permissions or role change
      if (activeRole === 'super_admin') return true;
      return adminRbacService.hasPermission(activeRole, resource, action);
    },
    [activeRole, matrixRevision]
  );

  const roleTitle = useMemo(() => {
    const found = mockRoles.find((r) => r.id === activeRole);
    return found ? found.title : activeRole.replace('_', ' ').toUpperCase();
  }, [activeRole]);

  const isSuperAdmin = activeRole === 'super_admin';
  const isComplianceOfficer = activeRole === 'compliance_officer';
  const isAdmin = activeRole === 'super_admin' || activeRole === 'bank_admin' || activeRole === 'admin';

  return {
    role: activeRole,
    roleTitle,
    isSuperAdmin,
    isComplianceOfficer,
    isAdmin,
    can,
    switchRole,
    availableRoles: mockRoles,

    canViewCustomers: can('customers', 'view'),
    canEditCustomer: can('customers', 'edit'),
    canFreezeCustomer: can('customers', 'edit') || isSuperAdmin,
    canResetPassword: can('customers', 'edit') || isSuperAdmin,
    canManageRisk: can('aml', 'edit') || can('fraud', 'edit'),
    canCreateAccount: can('accounts', 'create'),
    canApproveAccount: can('accounts', 'approve'),
    canFreezeAccount: can('accounts', 'edit') || can('accounts', 'reject'),
    canCloseAccount: can('accounts', 'delete') || isSuperAdmin,
    canChangeAccountLimits: can('accounts', 'edit'),
    canChangeAccountStatus: can('accounts', 'edit') || can('accounts', 'approve'),
    canApproveTransaction: can('transactions', 'approve'),
    canRejectTransaction: can('transactions', 'reject'),
    canReverseTransaction: isSuperAdmin || can('transactions', 'delete'),
    canRefundTransaction: can('transactions', 'approve') || can('transactions', 'edit'),
    canExportData: can('reports', 'export') || can('transactions', 'export'),
    canManageKyc: can('kyc', 'approve') || can('kyc', 'edit'),
    canViewAuditLogs: can('audit_logs', 'view'),
  };
}
