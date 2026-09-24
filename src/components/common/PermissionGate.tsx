import React from 'react';
import { PermissionResource, PermissionAction } from '../../backend/types/index.ts';
import { useAdminPermissions } from '../../hooks/useAdminPermissions.ts';
import { ShieldAlert } from 'lucide-react';

interface PermissionGateProps {
  resource: PermissionResource;
  action: PermissionAction;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showDeniedMessage?: boolean;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  resource,
  action,
  children,
  fallback = null,
  showDeniedMessage = false,
}) => {
  const { can, role, roleTitle } = useAdminPermissions();
  const isAllowed = can(resource, action);

  if (isAllowed) {
    return <>{children}</>;
  }

  if (showDeniedMessage) {
    return (
      <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3 my-2">
        <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold uppercase tracking-wider text-[11px]">
            Restricted Operational Clearance
          </div>
          <div className="mt-0.5 text-amber-800 dark:text-amber-300">
            Current role <span className="font-semibold">{roleTitle}</span> lacks <span className="font-mono underline">{action.toUpperCase()}</span> authorization on <span className="font-mono">{resource}</span>. Action controls disabled.
          </div>
        </div>
      </div>
    );
  }

  return <>{fallback}</>;
};
