import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import MetricsDashboard from './components/MetricsDashboard';
import { useNavigate } from 'react-router-dom';
import UserManagementPanel from './components/UserManagementPanel';
import ContentModerationPanel from './components/ContentModerationPanel';
import TransactionOversightPanel from './components/TransactionOversightPanel';
import SystemSettingsPanel from './components/SystemSettingsPanel';
import AnalyticsPanel from './components/AnalyticsPanel';
import NotificationCenter from './components/NotificationCenter';

const AdminControlPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLogout, setShowLogout] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'urgent',
      title: 'Payment Dispute',
      message: 'New dispute requires immediate attention',
      timestamp: '5 minutes ago',
      unread: true
    },
    {
      id: 2,
      type: 'warning',
      title: 'Suspicious Activity',
      message: 'Multiple failed login attempts detected',
      timestamp: '15 minutes ago',
      unread: true
    },
    {
      id: 3,
      type: 'info',
      title: 'System Update',
      message: 'Scheduled maintenance completed successfully',
      timestamp: '2 hours ago',
      unread: false
    }
  ]);

  const adminTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'User Management', icon: '👥' },
    { id: 'content', label: 'Content Moderation', icon: '🔍' },
    { id: 'transactions', label: 'Transaction Oversight', icon: '💳' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'settings', label: 'System Settings', icon: '⚙️' }
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleNotificationRead = (notificationId) => {
    setNotifications(prev =>
      prev?.map(notif =>
        notif?.id === notificationId ? { ...notif, unread: false } : notif
      )
    );
  };

  const unreadNotifications = notifications?.filter(n => n?.unread)?.length;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <MetricsDashboard />;
      case 'users':
        return <UserManagementPanel />;
      case 'content':
        return <ContentModerationPanel />;
      case 'transactions':
        return <TransactionOversightPanel />;
      case 'analytics':
        return <AnalyticsPanel />;
      case 'settings':
        return <SystemSettingsPanel />;
      default:
        return <MetricsDashboard />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Control Panel - Valikoo</title>
        <meta name="description" content="Administrative dashboard for managing the Valikoo marketplace platform" />
      </Helmet>
      <div className="min-h-screen bg-background">
        {/* Admin Header - Sticky */}
  <header className="sticky top-0 z-30 bg-card border-b border-border shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-foreground">Admin Control Panel</h1>
                <p className="text-sm text-muted-foreground">
                  Last updated: {new Date()?.toLocaleString()}
                </p>
              </div>
              {/* Notification Indicator */}
              <div className="flex items-center space-x-4">
                <button className="relative p-2 rounded-lg hover:bg-muted transition-smooth">
                  <span className="text-2xl">🔔</span>
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
                <div className="relative flex items-center space-x-2 cursor-pointer select-none">
                  <div
                    className="w-8 h-8 bg-primary rounded-full flex items-center justify-center"
                    onClick={() => setShowLogout((prev) => !prev)}
                    tabIndex={0}
                    onBlur={() => setTimeout(() => setShowLogout(false), 150)}
                  >
                    <span className="text-white text-sm">👑</span>
                  </div>
                  <div className="hidden md:block" onClick={() => setShowLogout((prev) => !prev)} tabIndex={0}>
                    <p className="text-sm font-medium text-foreground">Admin User</p>
                    <p className="text-xs text-muted-foreground">Super Administrator</p>
                  </div>
                  {/* Logout Dropdown */}
                  {showLogout && (
                    <div className="absolute right-0 top-12 min-w-[140px] bg-card border border-border rounded-lg shadow-lg z-50">
                      <button
                        onClick={() => {
                          localStorage.removeItem('isAuthenticated');
                          localStorage.removeItem('userRole');
                          localStorage.removeItem('userEmail');
                          localStorage.removeItem('rememberMe');
                          localStorage.removeItem('socialLogin');
                          navigate('/login-screen');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/10 rounded-lg"
                      >
                        <span className="mr-2">🚪</span>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

  {/* Navigation Tabs - Sticky under header */}
  <nav className="bg-card border-b border-border sticky top-[72px] z-20">
          <div className="container mx-auto px-4">
            <div className="flex overflow-x-auto">
              {adminTabs?.map((tab) => (
                <button
                  key={tab?.id}
                  onClick={() => handleTabChange(tab?.id)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-smooth border-b-2 ${
                    activeTab === tab?.id
                      ? 'text-primary border-primary bg-primary/5' :'text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/30'
                  }`}
                >
                  <span className="text-lg">{tab?.icon}</span>
                  <span>{tab?.label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="pb-8">
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Main Content Area */}
              <div className="xl:col-span-3">
                {renderTabContent()}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <NotificationCenter
                  notifications={notifications}
                  onMarkAsRead={handleNotificationRead}
                />
                
                {/* Quick Actions */}
                <div className="bg-card rounded-lg border border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted transition-smooth">
                      <span className="text-xl">🚨</span>
                      <div className="text-left">
                        <p className="text-sm font-medium text-foreground">Emergency Broadcast</p>
                        <p className="text-xs text-muted-foreground">Send system-wide notification</p>
                      </div>
                    </button>
                    
                    <button className="w-full flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted transition-smooth">
                      <span className="text-xl">📊</span>
                      <div className="text-left">
                        <p className="text-sm font-medium text-foreground">Generate Report</p>
                        <p className="text-xs text-muted-foreground">Create custom analytics report</p>
                      </div>
                    </button>
                    
                    <button className="w-full flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted transition-smooth">
                      <span className="text-xl">🔧</span>
                      <div className="text-left">
                        <p className="text-sm font-medium text-foreground">System Maintenance</p>
                        <p className="text-xs text-muted-foreground">Schedule maintenance window</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* System Health */}
                <div className="bg-card rounded-lg border border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">System Health</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Server Status</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                        <span className="text-sm text-success font-medium">Operational</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Database</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                        <span className="text-sm text-success font-medium">Healthy</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Payment Gateway</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-warning rounded-full"></div>
                        <span className="text-sm text-warning font-medium">Slow Response</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">CDN</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                        <span className="text-sm text-success font-medium">Fast</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminControlPanel;