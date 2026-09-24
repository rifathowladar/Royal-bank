import React from 'react';
import { useAdminPermissions } from '../../hooks/index.ts';
import { PermissionResource, PermissionAction, AdminRole } from '../../backend/types/index.ts';
import { ShieldAlert } from 'lucide-react';

export interface PermissionGuardProps {
  resource?: PermissionResource;
  action?: PermissionAction;
  allowedRoles?: AdminRole[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  resource,
  action = 'view',
  allowedRoles,
  fallback,
  children,
}) => {
  const { role, can } = useAdminPermissions();

  if (allowedRoles && !allowedRoles.includes(role)) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <span>Access Restricted: Requires supervisory clearance tier [{allowedRoles.join(', ')}]. Current clearance: [{role}].</span>
      </div>
    );
  }

  if (resource && !can(resource, action)) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
        <span>Access Restricted: You do not have '{action}' privileges on '{resource}'.</span>
      </div>
    );
  }

  return <>{children}</>;
};
