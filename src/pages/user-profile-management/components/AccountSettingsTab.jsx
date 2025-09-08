import React, { useState } from 'react';

import Button from '../../../components/ui/Button';

const AccountSettingsTab = ({ profileData, onUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSettings, setEmailSettings] = useState(profileData?.emailSettings || {
    newListings: true,
    priceAlerts: true,
    messages: true,
    marketing: false
  });
  const [pushSettings, setPushSettings] = useState(profileData?.pushSettings || {
    newMessages: true,
    orderUpdates: true,
    promotions: false
  });
  const [privacySettings, setPrivacySettings] = useState(profileData?.privacySettings || {
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowContact: true
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(profileData?.twoFactorEnabled || false);

  // تحديث الحقول عند تغير profileData
  React.useEffect(() => {
    if (profileData?.emailSettings) setEmailSettings(profileData.emailSettings);
    if (profileData?.pushSettings) setPushSettings(profileData.pushSettings);
    if (profileData?.privacySettings) setPrivacySettings(profileData.privacySettings);
    if (profileData?.twoFactorEnabled !== undefined) setTwoFactorEnabled(profileData.twoFactorEnabled);
  }, [profileData]);

  const handleEmailChange = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Email change requested');
    setIsLoading(false);
  };

  const handlePasswordChange = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Password change requested');
    setIsLoading(false);
  };

  const handleToggle2FA = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setTwoFactorEnabled(!twoFactorEnabled);
    setIsLoading(false);
  };

  const handleEmailNotificationChange = (setting) => {
    setEmailSettings(prev => ({
      ...prev,
      [setting]: !prev?.[setting]
    }));
  };

  const handlePushNotificationChange = (setting) => {
    setPushSettings(prev => ({
      ...prev,
      [setting]: !prev?.[setting]
    }));
  };

  const handlePrivacyChange = (setting, value) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    // إرسال جميع الإعدادات المجمعة إلى onUpdate
    await onUpdate({
      emailSettings,
      pushSettings,
      privacySettings,
      twoFactorEnabled
    });
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Account Security */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Account Security</h3>
        
        <div className="space-y-4">
          {/* Email */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="font-medium text-foreground">Email Address</p>
              <p className="text-sm text-muted-foreground">{profileData?.email}</p>
            </div>
            <Button variant="outline" onClick={handleEmailChange} loading={isLoading}>
              Change Email
            </Button>
          </div>

          {/* Password */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="font-medium text-foreground">Password</p>
              <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
            </div>
            <Button variant="outline" onClick={handlePasswordChange} loading={isLoading}>
              Change Password
            </Button>
          </div>

          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="font-medium text-foreground">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">
                {twoFactorEnabled ? 'Enabled - Your account is protected' : 'Add an extra layer of security'}
              </p>
            </div>
            <Button
              variant={twoFactorEnabled ? 'destructive' : 'default'}
              onClick={handleToggle2FA}
              loading={isLoading}
            >
              {twoFactorEnabled ? 'Disable' : 'Enable'}
            </Button>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Notification Preferences</h3>
        
        {/* Email Notifications */}
        <div className="mb-6">
          <h4 className="font-medium text-foreground mb-3">Email Notifications</h4>
          <div className="space-y-3">
            {Object.entries(emailSettings)?.map(([setting, enabled]) => (
              <div key={setting} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {setting === 'newListings' && 'New Listings'}
                    {setting === 'priceAlerts' && 'Price Alerts'}
                    {setting === 'messages' && 'New Messages'}
                    {setting === 'marketing' && 'Marketing Updates'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {setting === 'newListings' && 'Get notified when new products match your interests'}
                    {setting === 'priceAlerts' && 'Receive alerts when prices drop on saved items'}
                    {setting === 'messages' && 'Notifications for new messages and responses'}
                    {setting === 'marketing' && 'Promotional emails and platform updates'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() => handleEmailNotificationChange(setting)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Push Notifications */}
        <div>
          <h4 className="font-medium text-foreground mb-3">Push Notifications</h4>
          <div className="space-y-3">
            {Object.entries(pushSettings)?.map(([setting, enabled]) => (
              <div key={setting} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {setting === 'newMessages' && 'New Messages'}
                    {setting === 'orderUpdates' && 'Order Updates'}
                    {setting === 'promotions' && 'Promotions'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {setting === 'newMessages' && 'Instant notifications for new messages'}
                    {setting === 'orderUpdates' && 'Updates on your order status'}
                    {setting === 'promotions' && 'Special offers and deals'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() => handlePushNotificationChange(setting)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Privacy Settings</h3>
        <div className="space-y-4">
          {/* Profile Visibility */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Profile Visibility
            </label>
            <select
              value={privacySettings?.profileVisibility}
              onChange={(e) => handlePrivacyChange('profileVisibility', e?.target?.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="public">Public - Visible to everyone</option>
              <option value="members">Members Only - Visible to registered users</option>
              <option value="private">Private - Only visible in transactions</option>
            </select>
          </div>
          {/* Contact Information Visibility */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Show Email Address</p>
                <p className="text-xs text-muted-foreground">Allow others to see your email in your profile</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacySettings?.showEmail}
                  onChange={() => handlePrivacyChange('showEmail', !privacySettings?.showEmail)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Show Phone Number</p>
                <p className="text-xs text-muted-foreground">Allow others to see your phone number in your profile</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacySettings?.showPhone}
                  onChange={() => handlePrivacyChange('showPhone', !privacySettings?.showPhone)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Allow Direct Contact</p>
                <p className="text-xs text-muted-foreground">Allow other users to contact you directly</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacySettings?.allowContact}
                  onChange={() => handlePrivacyChange('allowContact', !privacySettings?.allowContact)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
      {/* زر الحفظ */}
      <div className="flex justify-end pt-6">
        <Button variant="default" onClick={handleSave} loading={isLoading}>
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default AccountSettingsTab;