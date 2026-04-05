import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { RolePermissions, UserRole } from '@/types/auth';
import { 
  Users, 
  Shield, 
  Plus, 
  Search, 
  MoreVertical, 
  Mail, 
  Calendar,
  CheckCircle,
  XCircle,
  Lock
} from 'lucide-react';
import toast from 'react-hot-toast';

// Mock user data
const mockUsers = [
  { id: '1', name: 'Admin User', email: 'admin@clvpredictor.ai', role: 'admin' as UserRole, status: 'active', lastLogin: new Date('2024-01-15') },
  { id: '2', name: 'Data Analyst', email: 'analyst@clvpredictor.ai', role: 'analyst' as UserRole, status: 'active', lastLogin: new Date('2024-01-14') },
  { id: '3', name: 'Report Viewer', email: 'viewer@clvpredictor.ai', role: 'viewer' as UserRole, status: 'active', lastLogin: new Date('2024-01-13') },
  { id: '4', name: 'John Smith', email: 'john@company.com', role: 'analyst' as UserRole, status: 'active', lastLogin: new Date('2024-01-12') },
  { id: '5', name: 'Jane Doe', email: 'jane@company.com', role: 'viewer' as UserRole, status: 'inactive', lastLogin: new Date('2024-01-01') },
];

export function UserManagement() {
  const { user, checkPermission } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Check if user has permission
  const canManageUsers = checkPermission('manage_users');

  if (!canManageUsers) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center px-4">
        <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/20">
          <Lock className="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Access Denied</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md">
          You don't have permission to access User Management. Only administrators can manage users.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const filteredUsers = mockUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'analyst': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'viewer': return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const handleRoleChange = (_userId: string, newRole: UserRole) => {
    toast.success(`User role updated to ${newRole}`);
  };

  const handleStatusToggle = (_userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">User Management</h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">Manage user accounts and role-based access control.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </button>
      </div>

      {/* Role Permissions Overview */}
      <div className="rounded-xl bg-white p-4 sm:p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
          Role Permissions Matrix
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-2 text-left font-medium text-slate-500 dark:text-slate-400">Permission</th>
                <th className="px-4 py-2 text-center font-medium text-purple-600 dark:text-purple-400">Admin</th>
                <th className="px-4 py-2 text-center font-medium text-blue-600 dark:text-blue-400">Analyst</th>
                <th className="px-4 py-2 text-center font-medium text-slate-600 dark:text-slate-400">Viewer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {['view_dashboard', 'upload_data', 'run_predictions', 'view_analytics', 'export_data', 'manage_users', 'manage_settings'].map(perm => (
                <tr key={perm}>
                  <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{perm.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
                  <td className="px-4 py-2 text-center">
                    {RolePermissions.admin.includes(perm) ? (
                      <CheckCircle className="h-4 w-4 text-green-600 inline" />
                    ) : (
                      <XCircle className="h-4 w-4 text-slate-300 inline" />
                    )}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {RolePermissions.analyst.includes(perm) ? (
                      <CheckCircle className="h-4 w-4 text-green-600 inline" />
                    ) : (
                      <XCircle className="h-4 w-4 text-slate-300 inline" />
                    )}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {RolePermissions.viewer.includes(perm) ? (
                      <CheckCircle className="h-4 w-4 text-green-600 inline" />
                    ) : (
                      <XCircle className="h-4 w-4 text-slate-300 inline" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-600 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          />
        </div>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-4 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-600 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="analyst">Analyst</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden dark:bg-slate-800 dark:ring-slate-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">User</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">Role</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400 hidden md:table-cell">Status</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400 hidden lg:table-cell">Last Login</th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm dark:bg-indigo-900 dark:text-indigo-300 flex-shrink-0">
                        {u.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div className="ml-3 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{u.name}</p>
                        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                          <Mail className="h-3 w-3 mr-1" />
                          <span className="truncate">{u.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                      disabled={u.email === user?.email}
                      className={`text-xs font-medium rounded-full px-2.5 py-1 border-0 ${getRoleBadgeColor(u.role)} disabled:opacity-50`}
                    >
                      <option value="admin">Admin</option>
                      <option value="analyst">Analyst</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </td>
                  <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                    <button
                      onClick={() => handleStatusToggle(u.id, u.status)}
                      disabled={u.email === user?.email}
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium disabled:opacity-50 ${
                        u.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {u.status === 'active' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {u.status}
                    </button>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-sm text-slate-500 dark:text-slate-400 hidden lg:table-cell">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {u.lastLogin.toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-right">
                    <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
                      <MoreVertical className="h-4 w-4 text-slate-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>No users found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{mockUsers.length}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Users</p>
        </div>
        <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{mockUsers.filter(u => u.role === 'admin').length}</p>
          <p className="text-sm text-purple-600 dark:text-purple-400">Admins</p>
        </div>
        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{mockUsers.filter(u => u.role === 'analyst').length}</p>
          <p className="text-sm text-blue-600 dark:text-blue-400">Analysts</p>
        </div>
        <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">{mockUsers.filter(u => u.status === 'active').length}</p>
          <p className="text-sm text-green-600 dark:text-green-400">Active</p>
        </div>
      </div>

      {/* Add User Modal (simplified) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Add New User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
                <input type="text" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:bg-slate-900 dark:border-slate-700 dark:text-white" placeholder="Full name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input type="email" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:bg-slate-900 dark:border-slate-700 dark:text-white" placeholder="email@company.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                <select className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:bg-slate-900 dark:border-slate-700 dark:text-white">
                  <option value="viewer">Viewer</option>
                  <option value="analyst">Analyst</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    toast.success('User invited successfully!');
                    setShowAddModal(false);
                  }}
                  className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                >
                  Send Invite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
