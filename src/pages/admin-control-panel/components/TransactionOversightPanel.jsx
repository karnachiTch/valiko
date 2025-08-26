import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const TransactionOversightPanel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7days');
  
  const [transactions] = useState([
    {
      id: 'TXN-001',
      orderId: 'ORD-2024-5678',
      buyer: 'sarah.j@example.com',
      traveler: 'alex.chen@example.com',
      amount: 299.99,
      currency: 'USD',
      status: 'completed',
      paymentMethod: 'Credit Card',
      createdDate: '2024-08-10',
      completedDate: '2024-08-11',
      product: 'MacBook Pro 14" M3',
      dispute: null
    },
    {
      id: 'TXN-002',
      orderId: 'ORD-2024-5679',
      buyer: 'mike.r@example.com',
      traveler: 'lisa.m@example.com',
      amount: 89.50,
      currency: 'USD',
      status: 'disputed',
      paymentMethod: 'PayPal',
      createdDate: '2024-08-09',
      completedDate: null,
      product: 'Luxury Watch',
      dispute: {
        reason: 'Item not as described',
        reportedDate: '2024-08-10',
        status: 'under_investigation'
      }
    },
    {
      id: 'TXN-003',
      orderId: 'ORD-2024-5680',
      buyer: 'emma.k@example.com',
      traveler: 'david.l@example.com',
      amount: 156.75,
      currency: 'USD',
      status: 'pending',
      paymentMethod: 'Bank Transfer',
      createdDate: '2024-08-11',
      completedDate: null,
      product: 'Japanese Skincare Set',
      dispute: null
    },
    {
      id: 'TXN-004',
      orderId: 'ORD-2024-5681',
      buyer: 'john.d@example.com',
      traveler: 'maria.s@example.com',
      amount: 2450.00,
      currency: 'USD',
      status: 'refunded',
      paymentMethod: 'Credit Card',
      createdDate: '2024-08-05',
      completedDate: '2024-08-08',
      product: 'Gaming Laptop',
      dispute: {
        reason: 'Non-delivery',
        reportedDate: '2024-08-07',
        status: 'resolved'
      }
    }
  ]);

  const filteredTransactions = transactions?.filter(txn => {
    const matchesSearch = 
      txn?.id?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      txn?.buyer?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      txn?.traveler?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      txn?.product?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || txn?.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleTransactionAction = (transactionId, action) => {
    console.log(`Performing ${action} on transaction ${transactionId}`);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { bg: 'bg-success', text: 'text-success-foreground', label: 'Completed' },
      pending: { bg: 'bg-warning', text: 'text-warning-foreground', label: 'Pending' },
      disputed: { bg: 'bg-destructive', text: 'text-destructive-foreground', label: 'Disputed' },
      refunded: { bg: 'bg-accent', text: 'text-accent-foreground', label: 'Refunded' },
      cancelled: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Cancelled' }
    };
    
    const config = statusConfig?.[status] || statusConfig?.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${config?.bg} ${config?.text}`}>
        {config?.label}
      </span>
    );
  };

  const calculateStats = () => {
    const total = transactions?.length;
    const completed = transactions?.filter(t => t?.status === 'completed')?.length;
    const disputed = transactions?.filter(t => t?.status === 'disputed')?.length;
    const totalRevenue = transactions
      ?.filter(t => t?.status === 'completed')
      ?.reduce((sum, t) => sum + t?.amount, 0);
    
    return { total, completed, disputed, totalRevenue };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      {/* Transaction Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Total Transactions</h3>
          <p className="text-2xl font-bold text-foreground">{stats?.total}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Completed</h3>
          <p className="text-2xl font-bold text-success">{stats?.completed}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Disputed</h3>
          <p className="text-2xl font-bold text-destructive">{stats?.disputed}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
          <p className="text-2xl font-bold text-primary">${stats?.totalRevenue?.toFixed(2)}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
          />
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e?.target?.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="disputed">Disputed</option>
            <option value="refunded">Refunded</option>
          </select>
          
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e?.target?.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
          
          <Button>
            Export Report
          </Button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Transaction Monitor</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Transaction</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Participants</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTransactions?.map((transaction) => (
                <tr key={transaction?.id} className="hover:bg-muted/20">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{transaction?.id}</p>
                      <p className="text-xs text-muted-foreground">{transaction?.orderId}</p>
                      <p className="text-xs text-muted-foreground">{transaction?.paymentMethod}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">Buyer</span>
                        <span className="text-xs text-muted-foreground">{transaction?.buyer}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Traveler</span>
                        <span className="text-xs text-muted-foreground">{transaction?.traveler}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-foreground">{transaction?.product}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        ${transaction?.amount?.toFixed(2)} {transaction?.currency}
                      </p>
                      {transaction?.amount >= 1000 && (
                        <span className="text-xs text-warning">High Value</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {getStatusBadge(transaction?.status)}
                      {transaction?.dispute && (
                        <div>
                          <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded">
                            Dispute: {transaction?.dispute?.reason}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Created: {transaction?.createdDate}</p>
                      {transaction?.completedDate && (
                        <p className="text-xs text-muted-foreground">Completed: {transaction?.completedDate}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTransactionAction(transaction?.id, 'view')}
                      >
                        View
                      </Button>
                      
                      {transaction?.status === 'disputed' && (
                        <>
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleTransactionAction(transaction?.id, 'resolve')}
                          >
                            Resolve
                          </Button>
                          <Button
                            size="sm"
                            variant="warning"
                            onClick={() => handleTransactionAction(transaction?.id, 'refund')}
                          >
                            Refund
                          </Button>
                        </>
                      )}
                      
                      {transaction?.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleTransactionAction(transaction?.id, 'cancel')}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTransactions?.length === 0 && (
          <div className="px-6 py-8 text-center">
            <p className="text-muted-foreground">No transactions found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Dispute Resolution Tools */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Dispute Resolution Tools</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="justify-start">
            🔍 Investigation Workflow
          </Button>
          <Button variant="outline" className="justify-start">
            💬 Mediation Tools
          </Button>
          <Button variant="outline" className="justify-start">
            📧 Communication Templates
          </Button>
          <Button variant="outline" className="justify-start">
            💰 Refund Processing
          </Button>
          <Button variant="outline" className="justify-start">
            📊 Dispute Analytics
          </Button>
          <Button variant="outline" className="justify-start">
            ⚖️ Escalation Management
          </Button>
        </div>
      </div>

      {/* Payment Gateway Status */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Payment Gateway Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Stripe</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-xs text-success">Operational</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Response time: 120ms</p>
          </div>
          
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">PayPal</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-warning rounded-full"></div>
                <span className="text-xs text-warning">Slow</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Response time: 850ms</p>
          </div>
          
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Bank Transfer</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-xs text-success">Operational</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Processing normally</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionOversightPanel;