import React from 'react';

const MetricsDashboard = () => {
  const kpiData = [
    {
      title: "Total Users",
      value: "12,847",
      change: "+12.5%",
      trend: "up",
      icon: "👥",
      color: "primary"
    },
    {
      title: "Active Listings",
      value: "3,456",
      change: "+8.2%",
      trend: "up",
      icon: "📦",
      color: "success"
    },
    {
      title: "Completed Transactions",
      value: "1,892",
      change: "-2.1%",
      trend: "down",
      icon: "💳",
      color: "warning"
    },
    {
      title: "Revenue (30 days)",
      value: "$89,432",
      change: "+15.7%",
      trend: "up",
      icon: "💰",
      color: "accent"
    }
  ];

  const recentActivity = [
    {
      type: "user_registration",
      message: "New user registration: Sarah Johnson",
      timestamp: "2 minutes ago",
      severity: "info"
    },
    {
      type: "high_value_transaction",
      message: "High-value transaction: $2,500 (MacBook Pro)",
      timestamp: "5 minutes ago",
      severity: "success"
    },
    {
      type: "dispute",
      message: "Payment dispute reported: Order #12847",
      timestamp: "12 minutes ago",
      severity: "warning"
    },
    {
      type: "verification",
      message: "User verification completed: Alex Chen",
      timestamp: "18 minutes ago",
      severity: "info"
    },
    {
      type: "suspicious_activity",
      message: "Flagged for review: Multiple accounts from same IP",
      timestamp: "25 minutes ago",
      severity: "error"
    }
  ];

  const pendingActions = [
    {
      title: "Pending User Verifications",
      count: 23,
      action: "Review Now",
      priority: "medium"
    },
    {
      title: "Flagged Listings",
      count: 7,
      action: "Moderate",
      priority: "high"
    },
    {
      title: "Payment Disputes",
      count: 3,
      action: "Resolve",
      priority: "urgent"
    },
    {
      title: "System Updates Available",
      count: 2,
      action: "Install",
      priority: "low"
    }
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error': case'urgent':
        return 'text-destructive';
      case 'warning': case'high':
        return 'text-warning';
      case 'success':
        return 'text-success';
      case 'medium':
        return 'text-accent';
      default:
        return 'text-muted-foreground';
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      urgent: 'bg-destructive text-destructive-foreground',
      high: 'bg-warning text-warning-foreground',
      medium: 'bg-accent text-accent-foreground',
      low: 'bg-muted text-muted-foreground'
    };
    return colors?.[priority] || colors?.low;
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData?.map((kpi, index) => (
          <div key={index} className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${kpi?.color}/10`}>
                <span className="text-2xl">{kpi?.icon}</span>
              </div>
              <div className={`flex items-center space-x-1 text-sm ${
                kpi?.trend === 'up' ? 'text-success' : 'text-destructive'
              }`}>
                <span>{kpi?.trend === 'up' ? '↗️' : '↘️'}</span>
                <span>{kpi?.change}</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground">{kpi?.value}</h3>
            <p className="text-sm text-muted-foreground">{kpi?.title}</p>
          </div>
        ))}
      </div>

      {/* Chart Placeholder */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Platform Analytics</h3>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded">7D</button>
            <button className="px-3 py-1 text-sm border border-border rounded hover:bg-muted">30D</button>
            <button className="px-3 py-1 text-sm border border-border rounded hover:bg-muted">90D</button>
          </div>
        </div>
        
        {/* Mock Chart Area */}
        <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center border-2 border-dashed border-muted">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-muted-foreground">Interactive charts and graphs</p>
            <p className="text-sm text-muted-foreground">Revenue, user growth, transaction volume</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentActivity?.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/30 transition-smooth">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity?.severity === 'error' ? 'bg-destructive' :
                  activity?.severity === 'warning' ? 'bg-warning' :
                  activity?.severity === 'success' ? 'bg-success' : 'bg-primary'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{activity?.message}</p>
                  <p className="text-xs text-muted-foreground">{activity?.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Actions */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Pending Actions</h3>
          <div className="space-y-3">
            {pendingActions?.map((action, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="flex items-center space-x-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{action?.title}</span>
                    <span className="text-xs text-muted-foreground">{action?.count} items</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getPriorityBadge(action?.priority)}`}>
                    {action?.priority}
                  </span>
                </div>
                <button className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-smooth">
                  {action?.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboard;