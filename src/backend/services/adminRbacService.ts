import { db, simulateNetworkDelay } from '../mockApi/storage.ts';
import {
  AdminRole,
  RoleDefinition,
  PermissionMatrix,
  PermissionResource,
  PermissionAction,
} from '../types/index.ts';
import { initialPermissionMatrix, mockRoles } from '../data/mockRbac.ts';

export class UnauthorizedError extends Error {
  constructor(
    public readonly role: string,
    public readonly resource: string,
    public readonly action: string
  ) {
    super(`Access Denied: Role '${role}' lacks '${action}' permission on resource '${resource}'.`);
    this.name = 'UnauthorizedError';
  }
}

export const adminRbacService = {
  async getRoles(): Promise<RoleDefinition[]> {
    await simulateNetworkDelay(50);
    return [...db.roles];
  },

  async getRoleById(id: AdminRole): Promise<RoleDefinition | null> {
    await simulateNetworkDelay(40);
    const role = db.roles.find((r) => r.id === id);
    return role ? { ...role } : null;
  },

  async getPermissionMatrix(): Promise<PermissionMatrix> {
    await simulateNetworkDelay(60);
    return { ...db.permissionMatrix };
  },

  async updatePermission(
    role: AdminRole,
    resource: PermissionResource,
    action: PermissionAction,
    allowed: boolean
  ): Promise<PermissionMatrix> {
    await simulateNetworkDelay(100);

    const matrix = { ...db.permissionMatrix };
    if (!matrix[role]) {
      matrix[role] = {} as Record<PermissionResource, PermissionAction[]>;
    }
    const currentActions = matrix[role][resource] || [];

    if (allowed) {
      if (!currentActions.includes(action)) {
        matrix[role][resource] = [...currentActions, action];
      }
    } else {
      matrix[role][resource] = currentActions.filter((a) => a !== action);
    }

    db.permissionMatrix = matrix;
    db.persist('permissionMatrix', matrix);
    return { ...matrix };
  },

  async resetMatrixToDefault(): Promise<PermissionMatrix> {
    await simulateNetworkDelay(120);
    db.permissionMatrix = { ...initialPermissionMatrix };
    db.persist('permissionMatrix', db.permissionMatrix);
    return { ...db.permissionMatrix };
  },

  async resetToDefaults(): Promise<PermissionMatrix> {
    return this.resetMatrixToDefault();
  },

  async togglePermission(
    role: AdminRole,
    resource: PermissionResource,
    action: PermissionAction
  ): Promise<PermissionMatrix> {
    const currentMatrix = await this.getPermissionMatrix();
    const currentActions = currentMatrix[role]?.[resource] || [];
    const isCurrentlyAllowed = currentActions.includes(action);
    return this.updatePermission(role, resource, action, !isCurrentlyAllowed);
  },

  getActiveRole(): AdminRole {
    return (db.activeAdminRole as AdminRole) || 'super_admin';
  },

  async setActiveRole(role: AdminRole): Promise<AdminRole> {
    await simulateNetworkDelay(60);
    db.activeAdminRole = role;
    db.persist('activeAdminRole', role);

    // Also update current admin object in db if present
    const currentAdmin = db.admins[0];
    if (currentAdmin) {
      currentAdmin.role = role as any;
      db.persist('admins', db.admins);
    }

    return role;
  },

  /**
   * Evaluates if a role has the specified permission on a resource.
   */
  hasPermission(
    role: AdminRole | string,
    resource: PermissionResource,
    action: PermissionAction
  ): boolean {
    const r = role as AdminRole;
    const matrix = db.permissionMatrix;
    if (!matrix || !matrix[r]) return false;
    const resourceActions = matrix[r][resource];
    if (!resourceActions) return false;
    return resourceActions.includes(action);
  },

  /**
   * Enforces backend authorization. Throws UnauthorizedError if insufficient permissions.
   * This guarantees that even if UI tampering occurs, API operations will abort.
   */
  enforcePermission(
    role: AdminRole | string,
    resource: PermissionResource,
    action: PermissionAction
  ): void {
    if (!this.hasPermission(role, resource, action)) {
      throw new UnauthorizedError(role, resource, action);
    }
  },
};
