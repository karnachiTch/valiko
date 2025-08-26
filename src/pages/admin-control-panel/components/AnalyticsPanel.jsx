import React, { useState } from 'react';
import Button from '../../../components/ui/Button';

const AnalyticsPanel = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7days');
  const [selectedMetric, setSelectedMetric] = useState('users');
  
  const timeRanges = [
    { value: '24hours', label: '24 Hours' },
    { value: '7days', label: '7 Days' },
    { value: '30days', label: '30 Days' },
    { value: '90days', label: '90 Days' },
    { value: '1year', label: '1 Year' }
  ];

  const analyticsData = {
    users: {
      total: 12847,
      growth: 12.5,
      new_today: 45,
      active_monthly: 8934
    },
    transactions: {
      total: 1892,
      growth: -2.1,
      volume: 456789,
      avg_value: 241.32
    },
    revenue: {
      total: 89432,
      growth: 15.7,
      fees_collected: 3127,
      refunds_issued: 2456
    },
    engagement: {
      avg_session: '12m 34s',
      bounce_rate: 23.4,
      pages_per_session: 4.7,
      return_visitors: 67.8
    }
  };

  const topPerformers = [
    { name: 'Electronics Category', value: '$24,567', growth: '+18%' },
    { name: 'Sarah Johnson (Traveler)', value: '89 deliveries', growth: '+23%' },
    { name: 'Fashion Products', value: '$18,234', growth: '+12%' },
    { name: 'Tokyo → New York Route', value: '156 trips', growth: '+8%' },
    { name: 'Alex Chen (Buyer)', value: '$8,934 spent', growth: '+34%' }
  ];

  const recentInsights = [
    {
      title: 'Peak Usage Hours',
      description: 'Highest activity between 2-4 PM EST',
      icon: '📊',
      type: 'trend'
    },
    {
      title: 'Geographic Growth',
      description: 'Asia-Pacific region showing 45% growth',
      icon: '🌏',
      type: 'growth'
    },
    {
      title: 'Payment Preferences',
      description: 'Credit cards account for 67% of transactions',
      icon: '💳',
      type: 'behavior'
    },
    {
      title: 'Mobile Usage',
      description: '73% of users access via mobile devices',
      icon: '📱',
      type: 'device'
    }
  ];

  const generateReport = (reportType) => {
    console.log(`Generating ${reportType} report for ${selectedTimeRange}`);
  };

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Analytics Dashboard</h3>
          <div className="flex space-x-2">
            {timeRanges?.map((range) => (
              <button
                key={range?.value}
                onClick={() => setSelectedTimeRange(range?.value)}
                className={`px-3 py-2 text-sm rounded-md transition-smooth ${
                  selectedTimeRange === range?.value
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border hover:bg-muted'
                }`}
              >
                {range?.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(analyticsData)?.map(([category, data]) => (
          <div key={category} className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-muted-foreground uppercase">
                {category?.replace('_', ' ')}
              </h4>
              <div className={`flex items-center space-x-1 text-sm ${
                data?.growth > 0 ? 'text-success' : 'text-destructive'
              }`}>
                <span>{data?.growth > 0 ? '↗️' : '↘️'}</span>
                <span>{Math.abs(data?.growth)}%</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">
                {category === 'revenue' || category === 'transactions' && data?.total > 1000
                  ? `$${data?.total?.toLocaleString()}`
                  : data?.total?.toLocaleString()}
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                {category === 'users' && (
                  <>
                    <p>New today: {data?.new_today}</p>
                    <p>Monthly active: {data?.active_monthly?.toLocaleString()}</p>
                  </>
                )}
                {category === 'transactions' && (
                  <>
                    <p>Volume: ${data?.volume?.toLocaleString()}</p>
                    <p>Avg value: ${data?.avg_value}</p>
                  </>
                )}
                {category === 'revenue' && (
                  <>
                    <p>Fees: ${data?.fees_collected?.toLocaleString()}</p>
                    <p>Refunds: ${data?.refunds_issued?.toLocaleString()}</p>
                  </>
                )}
                {category === 'engagement' && (
                  <>
                    <p>Avg session: {data?.avg_session}</p>
                    <p>Bounce rate: {data?.bounce_rate}%</p>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">User Growth Trend</h3>
          <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center border-2 border-dashed border-muted">
            <div className="text-center">
              <div className="text-4xl mb-2">📈</div>
              <p className="text-muted-foreground">User growth over time</p>
              <p className="text-sm text-muted-foreground">Line chart with trend analysis</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Revenue Breakdown</h3>
          <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center border-2 border-dashed border-muted">
            <div className="text-center">
              <div className="text-4xl mb-2">🥧</div>
              <p className="text-muted-foreground">Revenue by category</p>
              <p className="text-sm text-muted-foreground">Pie chart with segments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Top Performers</h3>
          <div className="space-y-3">
            {topPerformers?.map((performer, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{performer?.name}</p>
                    <p className="text-xs text-muted-foreground">{performer?.value}</p>
                  </div>
                </div>
                <span className="text-sm text-success font-medium">{performer?.growth}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Insights */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Insights</h3>
          <div className="space-y-3">
            {recentInsights?.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-muted/20 rounded-lg">
                <div className="text-2xl">{insight?.icon}</div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-foreground">{insight?.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{insight?.description}</p>
                  <span className="inline-block mt-2 px-2 py-1 rounded-full text-xs bg-accent/10 text-accent">
                    {insight?.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Analytics Charts */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Detailed Analytics</h3>
        
        {/* Chart Navigation */}
        <div className="flex space-x-2 mb-6">
          {['users', 'revenue', 'transactions', 'engagement']?.map((metric) => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={`px-4 py-2 text-sm rounded-md transition-smooth ${
                selectedMetric === metric
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border hover:bg-muted'
              }`}
            >
              {metric?.charAt(0)?.toUpperCase() + metric?.slice(1)}
            </button>
          ))}
        </div>

        {/* Large Chart Area */}
        <div className="h-80 bg-muted/20 rounded-lg flex items-center justify-center border-2 border-dashed border-muted">
          <div className="text-center">
            <div className="text-6xl mb-4">
              {selectedMetric === 'users' && '👥'}
              {selectedMetric === 'revenue' && '💰'}
              {selectedMetric === 'transactions' && '💳'}
              {selectedMetric === 'engagement' && '📊'}
            </div>
            <p className="text-lg text-muted-foreground mb-2">
              {selectedMetric?.charAt(0)?.toUpperCase() + selectedMetric?.slice(1)} Analytics
            </p>
            <p className="text-sm text-muted-foreground">
              Interactive chart with zoom, filters, and detailed breakdowns
            </p>
          </div>
        </div>
      </div>

      {/* Export and Reporting */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Export & Reporting</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            onClick={() => generateReport('executive_summary')}
            className="justify-start"
          >
            📋 Executive Summary
          </Button>
          <Button 
            variant="outline" 
            onClick={() => generateReport('detailed_analytics')}
            className="justify-start"
          >
            📊 Detailed Analytics
          </Button>
          <Button 
            variant="outline" 
            onClick={() => generateReport('user_behavior')}
            className="justify-start"
          >
            👤 User Behavior Report
          </Button>
          <Button 
            variant="outline" 
            onClick={() => generateReport('financial')}
            className="justify-start"
          >
            💰 Financial Report
          </Button>
        </div>

        <div className="mt-6 p-4 bg-muted/20 rounded-lg">
          <h4 className="text-sm font-medium text-foreground mb-2">Scheduled Reports</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Weekly executive summary: Every Monday at 9 AM</p>
            <p>• Monthly financial report: 1st of each month</p>
            <p>• Quarterly business review: Every 3 months</p>
          </div>
          <Button size="sm" variant="outline" className="mt-3">
            Manage Schedules
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;