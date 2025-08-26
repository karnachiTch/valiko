// إدارة الملف الشخصي للمسافر فقط
import React, { useState, useEffect } from 'react';
import RoleBasedNavigation from '../../components/ui/RoleBasedNavigation';
import ProfileHeader from './components/ProfileHeader';
import ProfileInfoTab from './components/ProfileInfoTab';
import AccountSettingsTab from './components/AccountSettingsTab';
import PreferencesTab from './components/PreferencesTab';
import PaymentMethodsSection from './components/PaymentMethodsSection';
import AccountStatsSection from './components/AccountStatsSection';

const TravelerProfileManagement = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({});
  const [user, setUser] = useState(null);

  useEffect(() => {
   const fetchUser = async () => {
      try {
        const res = await import('../../api').then(m => m.default.get('/api/auth/me'));
        setUser(res.data);
        setProfileData({
          name: res.data.fullName || res.data.name || '',
          email: res.data.email || '',
          avatar: res.data.avatar || '',
          bio: res.data.bio || '',
          location: res.data.location || '',
          languages: res.data.languages || [],
          phone: res.data.phone || '',
          website: res.data.website || '',
          verified: res.data.verified || false
        });
      } catch (err) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const tabs = [
    { id: 'profile', label: 'Account Information', icon: 'User' },
    { id: 'settings', label: 'Account Settings', icon: 'Settings' },
    { id: 'preferences', label: 'Preferences', icon: 'Heart' },
  ];

  const saveProfileToDatabase = async (updatedData) => {
    try {
      console.log('Updated data being sent:', updatedData);
      const token = localStorage.getItem('accessToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await import('../../api').then(m => m.default.put('/api/profile', updatedData, { headers }));
      console.log('Profile saved successfully:', res.data);
      // إعادة جلب البيانات من الخادم بعد الحفظ
      const userRes = await import('../../api').then(m => m.default.get('/api/auth/me', { headers }));
      setUser(userRes.data);
      setProfileData({
        name: userRes.data.fullName || userRes.data.name || '',
        email: userRes.data.email || '',
        avatar: userRes.data.avatar || '',
        bio: userRes.data.bio || '',
        location: userRes.data.location || '',
        languages: userRes.data.languages || [],
        phone: userRes.data.phone || '',
        website: userRes.data.website || '',
        verified: userRes.data.verified || false
      });
    } catch (err) {
      console.error('Failed to save profile:', err);
    }
  };

  const handleProfileUpdate = (updatedData) => {
    setProfileData(prev => ({ ...prev, ...updatedData }));
    saveProfileToDatabase(updatedData);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <ProfileInfoTab profileData={profileData} onUpdate={handleProfileUpdate} userRole="traveler" />
        );
      case 'settings':
        return (
          <AccountSettingsTab profileData={profileData} onUpdate={handleProfileUpdate} />
        );
      case 'preferences':
        return (
          <PreferencesTab userRole="traveler" onUpdate={handleProfileUpdate} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNavigation userRole="traveler" user={user} />
      <main className="lg:pt-16 pb-20 lg:pb-8">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <ProfileHeader profileData={profileData} onUpdate={handleProfileUpdate} />
          <div className="bg-card rounded-lg border border-border mb-6">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-smooth border-b-2 ${activeTab === tab.id ? 'text-primary border-primary bg-primary/5' :'text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/30'}`}
                >
                  <span className="text-lg">
                    {tab.icon === 'User' && '👤'}
                    {tab.icon === 'Settings' && '⚙️'}
                    {tab.icon === 'Heart' && '💖'}
                  </span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
              {renderTabContent()}
            </div>
            <div className="space-y-6">
              <AccountStatsSection userRole="traveler" />
              <PaymentMethodsSection />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TravelerProfileManagement;
