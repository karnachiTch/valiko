import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const UserManagementPanel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [users] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      role: 'traveler',
      status: 'active',
      verified: true,
      joinDate: '2024-01-15',
      lastActive: '2 hours ago',
      totalTransactions: 24,
      rating: 4.9
    },
    {
      id: 2,
      name: 'Alex Chen',
      email: 'alex.chen@example.com',
      role: 'buyer',
      status: 'active',
      verified: true,
      joinDate: '2024-02-10',
      lastActive: '1 day ago',
      totalTransactions: 16,
      rating: 4.7
    },
    {
      id: 3,
      name: 'Maria Rodriguez',
      email: 'm.rodriguez@example.com',
      role: 'traveler',
      status: 'suspended',
      verified: false,
      joinDate: '2024-03-05',
      lastActive: '1 week ago',
      totalTransactions: 3,
      rating: 3.2
    },
    {
      id: 4,
      name: 'John Smith',
      email: 'john.smith@example.com',
      role: 'buyer',
      status: 'pending_verification',
      verified: false,
      joinDate: '2024-08-08',
      lastActive: '5 minutes ago',
      totalTransactions: 0,
      rating: null
    }
  ]);

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         user?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesRole = filterRole === 'all' || user?.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user?.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleUserAction = (userId, action) => {
    console.log(`Performing ${action} on user ${userId}`);
    // Here you would implement the actual user management actions
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { bg: 'bg-success', text: 'text-success-foreground', label: 'Active' },
      suspended: { bg: 'bg-destructive', text: 'text-destructive-foreground', label: 'Suspended' },
      pending_verification: { bg: 'bg-warning', text: 'text-warning-foreground', label: 'Pending' },
      inactive: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Inactive' }
    };
    
    const config = statusConfig?.[status] || statusConfig?.inactive;
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${config?.bg} ${config?.text}`}>
        {config?.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
          />
          
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e?.target?.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="all">All Roles</option>
            <option value="traveler">Travelers</option>
            <option value="buyer">Buyers</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e?.target?.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending_verification">Pending Verification</option>
          </select>
          
          <Button>
            Export Users
          </Button>
        </div>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Total Users</h3>
          <p className="text-2xl font-bold text-foreground">{users?.length}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Active Users</h3>
          <p className="text-2xl font-bold text-success">{users?.filter(u => u?.status === 'active')?.length}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Pending Verification</h3>
          <p className="text-2xl font-bold text-warning">{users?.filter(u => u?.status === 'pending_verification')?.length}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Suspended</h3>
          <p className="text-2xl font-bold text-destructive">{users?.filter(u => u?.status === 'suspended')?.length}</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">User Management</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Activity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Stats</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers?.map((user) => (
                <tr key={user?.id} className="hover:bg-muted/20">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {user?.name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-foreground">{user?.name}</p>
                          {user?.verified && <span className="text-success">✓</span>}
                        </div>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-xs bg-accent/10 text-accent">
                      {user?.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(user?.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Joined: {user?.joinDate}</p>
                      <p className="text-xs text-muted-foreground">Last: {user?.lastActive}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-xs text-muted-foreground">{user?.totalTransactions} transactions</p>
                      {user?.rating && (
                        <p className="text-xs text-muted-foreground">⭐ {user?.rating}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUserAction(user?.id, 'view')}
                      >
                        View
                      </Button>
                      {user?.status === 'active' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleUserAction(user?.id, 'suspend')}
                        >
                          Suspend
                        </Button>
                      )}
                      {user?.status === 'suspended' && (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleUserAction(user?.id, 'reactivate')}
                        >
                          Reactivate
                        </Button>
                      )}
                      {!user?.verified && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleUserAction(user?.id, 'verify')}
                        >
                          Verify
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers?.length === 0 && (
          <div className="px-6 py-8 text-center">
            <p className="text-muted-foreground">No users found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Bulk Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline">Send Notification to All Active Users</Button>
          <Button variant="outline">Export User Data</Button>
          <Button variant="outline">Generate User Report</Button>
          <Button variant="destructive">Mass Suspend Flagged Users</Button>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPanel;