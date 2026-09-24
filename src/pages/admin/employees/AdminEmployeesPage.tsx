import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  UserCheck,
  UserX,
  Mail,
  Building,
  KeyRound,
  Shield,
  Activity,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { LoadingState } from '../../../components/ui/LoadingState.tsx';
import { useToast } from '../../../hooks/index.ts';
import { adminEmployeeService } from '../../../backend/services/adminEmployeeService.ts';
import { Employee } from '../../../backend/types/index.ts';
import { formatDate } from '../../../utils/formatters.ts';

export const AdminEmployeesPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await adminEmployeeService.getEmployees({
        department: departmentFilter,
        role: roleFilter,
        status: statusFilter,
        search,
      });
      setEmployees(data);
    } catch (err: any) {
      addToast(err.message || 'Failed to load staff roster.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [departmentFilter, statusFilter, roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEmployees();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-royal-500/10 text-royal-600 dark:text-royal-400 font-mono text-[10px] font-bold uppercase tracking-wider">
              ENTERPRISE HUMAN CAPITAL & CREDENTIALS
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Bank Employee Directory & Access Roster
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Operational personnel registry, departmental assignments, clearance levels, and session authentication telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchEmployees}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 space-y-3">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Employee ID, Name, Work Email, or Job Title..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <Button type="submit" size="sm" variant="primary">
            Search
          </Button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Department:</span>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              >
                <option value="all">All Departments</option>
                <option value="Executive Management">Executive Management</option>
                <option value="Retail & Branch Banking">Retail & Branch Banking</option>
                <option value="Risk & Fraud Prevention">Risk & Fraud Prevention</option>
                <option value="Regulatory Compliance & AML">Regulatory Compliance & AML</option>
                <option value="Credit & Underwriting">Credit & Underwriting</option>
                <option value="Internal Audit & Inspection">Internal Audit & Inspection</option>
                <option value="Treasury & Finance">Treasury & Finance</option>
                <option value="Customer Operations">Customer Operations</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="on_leave">On Leave</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
          </div>

          <div className="text-slate-500 text-[11px]">
            Personnel: <span className="font-bold text-slate-800 dark:text-slate-200">{employees.length}</span>
          </div>
        </div>
      </Card>

      {/* Employees Table */}
      <Card className="overflow-hidden">
        {loading && !employees.length ? (
          <div className="p-8">
            <LoadingState message="Loading staff directory..." />
          </div>
        ) : employees.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Users className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-semibold">No employees matched the query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Department & Title</th>
                  <th className="px-4 py-3">Branch Location</th>
                  <th className="px-4 py-3">Assigned Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Recent Login</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {employees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={emp.fullName}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {emp.fullName}
                          </div>
                          <div className="text-[10px] font-mono text-royal-600 dark:text-royal-400">
                            {emp.employeeId}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {emp.jobTitle}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {emp.department}
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-slate-800 dark:text-slate-200 font-medium">
                        {emp.branchName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {emp.branchCode}
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {emp.role.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                          emp.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : emp.status === 'suspended'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                      {emp.lastLoginAt ? (
                        <>
                          <div className="text-slate-800 dark:text-slate-200 font-medium">
                            {formatDate(emp.lastLoginAt)}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">
                            IP: {emp.lastLoginIp || 'N/A'}
                          </div>
                        </>
                      ) : (
                        'Never'
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/admin/employees/${emp.id}`)}
                        className="h-7 px-2 text-xs"
                      >
                        Profile & Roster &rarr;
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
