import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import RoleBasedNavigation from '../../components/ui/RoleBasedNavigation';
import ProfileHeader from './components/ProfileHeader';
import ProfileInfoTab from './components/ProfileInfoTab';
import AccountSettingsTab from './components/AccountSettingsTab';
import PreferencesTab from './components/PreferencesTab';
import PaymentMethodsSection from './components/PaymentMethodsSection';
import AccountStatsSection from './components/AccountStatsSection';

const UserProfileManagement = () => {
  const [currentLanguage, setCurrentLanguage] = useState('EN');
  const [activeTab, setActiveTab] = useState('profile');
  const [userRole, setUserRole] = useState('buyer'); // Mock user role
  const [profileData, setProfileData] = useState({});
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    }
    // جلب بيانات المستخدم من API
    const fetchUser = async () => {
      try {
        const res = await import('../../api').then(m => m.default.get('/api/auth/me'));
        setUser(res.data);
      } catch (err) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: 'User' },
    { id: 'settings', label: 'Account Settings', icon: 'Settings' },
    { id: 'preferences', label: 'Preferences', icon: 'Heart' },
  ];

  const handleProfileUpdate = (updatedData) => {
    setProfileData(prev => ({ ...prev, ...updatedData }));
    // Auto-save functionality would go here
    console.log('Profile updated:', updatedData);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <ProfileInfoTab
            profileData={profileData}
            onUpdate={handleProfileUpdate}
            userRole={userRole}
          />
        );
      case 'settings':
        return (
          <AccountSettingsTab
            profileData={profileData}
            onUpdate={handleProfileUpdate}
          />
        );
      case 'preferences':
        return (
          <PreferencesTab
            userRole={userRole}
            onUpdate={handleProfileUpdate}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>User Profile Management - Valikoo</title>
        <meta name="description" content="Manage your Valikoo profile, account settings, and preferences" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <RoleBasedNavigation userRole={userRole} />
  <RoleBasedNavigation userRole={userRole} user={user} />
        
        {/* Main Content */}
        <main className="lg:pt-16 pb-20 lg:pb-8">
          <div className="container mx-auto px-4 py-6 max-w-4xl">
            
            {/* Profile Header */}
            <ProfileHeader
              profileData={profileData}
              onUpdate={handleProfileUpdate}
            />

            {/* Navigation Tabs */}
            <div className="bg-card rounded-lg border border-border mb-6">
              <div className="flex overflow-x-auto">
                {tabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => handleTabChange(tab?.id)}
                    className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-smooth border-b-2 ${
                      activeTab === tab?.id
                        ? 'text-primary border-primary bg-primary/5' :'text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/30'
                    }`}
                  >
                    <span className="text-lg">
                      {tab?.icon === 'User' && '👤'}
                      {tab?.icon === 'Settings' && '⚙️'}
                      {tab?.icon === 'Heart' && '💖'}
                    </span>
                    <span>{tab?.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Main Content Area */}
              <div className="xl:col-span-2">
                {renderTabContent()}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <AccountStatsSection userRole={userRole} />
                <PaymentMethodsSection />
              </div>
            </div>

            {/* Additional Actions */}
            <div className="mt-8 bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Additional Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted transition-smooth">
                  <span className="text-2xl">📊</span>
                  <div className="text-left">
                    <p className="font-medium text-foreground">Export Data</p>
                    <p className="text-sm text-muted-foreground">Download your account data</p>
                  </div>
                </button>
                <button className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted transition-smooth">
                  <span className="text-2xl">❓</span>
                  <div className="text-left">
                    <p className="font-medium text-foreground">Help Center</p>
                    <p className="text-sm text-muted-foreground">Get support and answers</p>
                  </div>
                </button>
                <button className="flex items-center space-x-3 p-4 rounded-lg border border-destructive text-destructive hover:bg-destructive/5 transition-smooth">
                  <span className="text-2xl">⚠️</span>
                  <div className="text-left">
                    <p className="font-medium">Deactivate Account</p>
                    <p className="text-sm text-muted-foreground">Temporarily disable your account</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default UserProfileManagement;