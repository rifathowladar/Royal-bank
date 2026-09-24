import { db, simulateNetworkDelay } from '../mockApi/storage.ts';
import { Employee, AdminRole } from '../types/index.ts';
import { adminRbacService } from './adminRbacService.ts';

export const adminEmployeeService = {
  async getEmployees(params?: {
    search?: string;
    department?: string;
    branchId?: string;
    role?: string;
    status?: string;
  }): Promise<Employee[]> {
    await simulateNetworkDelay(70);
    let list = [...db.employees];

    if (params?.department && params.department !== 'all') {
      list = list.filter((e) => e.department === params.department);
    }
    if (params?.branchId && params.branchId !== 'all') {
      list = list.filter((e) => e.branchId === params.branchId);
    }
    if (params?.role && params.role !== 'all') {
      list = list.filter((e) => e.role === params.role);
    }
    if (params?.status && params.status !== 'all') {
      list = list.filter((e) => e.status === params.status);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (e) =>
          e.fullName.toLowerCase().includes(q) ||
          e.employeeId.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.branchName.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q)
      );
    }

    return list;
  },

  async getEmployeeById(id: string): Promise<Employee | null> {
    await simulateNetworkDelay(50);
    const emp = db.employees.find((e) => e.id === id || e.employeeId.toLowerCase() === id.toLowerCase());
    return emp ? JSON.parse(JSON.stringify(emp)) : null;
  },

  async updateEmployeeStatus(
    id: string,
    status: Employee['status'],
    reason?: string
  ): Promise<Employee> {
    const role = adminRbacService.getActiveRole();
    adminRbacService.enforcePermission(role, 'employees', 'edit');

    await simulateNetworkDelay(120);
    const emp = db.employees.find((e) => e.id === id);
    if (!emp) throw new Error(`Employee ${id} not found.`);

    emp.status = status;
    db.persist('employees', db.employees);

    db.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      adminId: 'adm-hr',
      adminName: 'HR / Security Controller',
      adminRole: role,
      action: 'EMPLOYEE_STATUS_CHANGE',
      targetType: 'system',
      targetId: emp.id,
      targetName: emp.fullName,
      details: `Status changed to ${status.toUpperCase()}. Reason: ${reason || 'Administrative update'}`,
      ipAddress: '10.240.12.18',
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
    });
    db.persist('auditLogs', db.auditLogs);

    return JSON.parse(JSON.stringify(emp));
  },

  async updateEmployeeRole(
    id: string,
    newRole: AdminRole,
    department?: Employee['department']
  ): Promise<Employee> {
    const role = adminRbacService.getActiveRole();
    adminRbacService.enforcePermission(role, 'employees', 'edit');

    await simulateNetworkDelay(140);
    const emp = db.employees.find((e) => e.id === id);
    if (!emp) throw new Error(`Employee ${id} not found.`);

    emp.role = newRole;
    if (department) emp.department = department;
    db.persist('employees', db.employees);

    db.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      adminId: 'adm-hr',
      adminName: 'HR / RBAC Director',
      adminRole: role,
      action: 'EMPLOYEE_ROLE_CHANGE',
      targetType: 'system',
      targetId: emp.id,
      targetName: emp.fullName,
      details: `Assigned RBAC role '${newRole}' to ${emp.fullName}`,
      ipAddress: '10.240.12.18',
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
    });
    db.persist('auditLogs', db.auditLogs);

    return JSON.parse(JSON.stringify(emp));
  },

  async createEmployee(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    department: Employee['department'];
    branchId: string;
    role: AdminRole;
  }): Promise<Employee> {
    const currentRole = adminRbacService.getActiveRole();
    adminRbacService.enforcePermission(currentRole, 'employees', 'create');

    await simulateNetworkDelay(160);
    const empNum = `EMP-9${String(db.employees.length + 1).padStart(3, '0')}`;
    const branch = db.branches.find((b) => b.id === data.branchId);

    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      employeeId: empNum,
      firstName: data.firstName,
      lastName: data.lastName,
      fullName: `${data.firstName} ${data.lastName}`,
      email: data.email,
      phone: data.phone,
      department: data.department,
      branchId: data.branchId,
      branchName: branch ? branch.name : 'Corporate Headquarters',
      role: data.role,
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
      lastLoginAt: 'Never',
      supervisorName: branch ? branch.branchManager.name : 'Victoria Ashford',
      directReportsCount: 0,
      loginActivity: [],
    };

    db.employees.push(newEmp);
    db.persist('employees', db.employees);

    return JSON.parse(JSON.stringify(newEmp));
  },
};
