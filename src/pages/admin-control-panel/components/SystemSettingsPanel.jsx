import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const SystemSettingsPanel = () => {
  const [settings, setSettings] = useState({
    platform: {
      maintenance_mode: false,
      registration_open: true,
      api_rate_limit: 1000,
      max_file_size: 10,
      session_timeout: 30
    },
    fees: {
      transaction_fee_percentage: 3.5,
      minimum_transaction_fee: 0.50,
      maximum_transaction_fee: 50.00,
      currency_conversion_fee: 2.5,
      refund_processing_fee: 2.00
    },
    regions: {
      enabled_regions: ['North America', 'Europe', 'Asia', 'Australia'],
      restricted_countries: ['Country A', 'Country B'],
      currency_support: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY']
    },
    features: {
      real_time_messaging: true,
      automated_moderation: true,
      payment_escrow: true,
      user_verification: true,
      review_system: true,
      mobile_notifications: true
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSettingChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev?.[section],
        [key]: value
      }
    }));
  };

  const handleArraySettingAdd = (section, key, value) => {
    if (value?.trim() && !settings?.[section]?.[key]?.includes(value?.trim())) {
      setSettings(prev => ({
        ...prev,
        [section]: {
          ...prev?.[section],
          [key]: [...prev?.[section]?.[key], value?.trim()]
        }
      }));
    }
  };

  const handleArraySettingRemove = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev?.[section],
        [key]: prev?.[section]?.[key]?.filter(item => item !== value)
      }
    }));
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Settings saved:', settings);
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Platform Configuration */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Platform Configuration</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">Maintenance Mode</p>
                <p className="text-xs text-muted-foreground">Temporarily disable user access</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings?.platform?.maintenance_mode}
                  onChange={(e) => handleSettingChange('platform', 'maintenance_mode', e?.target?.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">Open Registration</p>
                <p className="text-xs text-muted-foreground">Allow new user registrations</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings?.platform?.registration_open}
                  onChange={(e) => handleSettingChange('platform', 'registration_open', e?.target?.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="API Rate Limit (per hour)"
              type="number"
              value={settings?.platform?.api_rate_limit}
              onChange={(e) => handleSettingChange('platform', 'api_rate_limit', parseInt(e?.target?.value))}
            />
            <Input
              label="Max File Size (MB)"
              type="number"
              value={settings?.platform?.max_file_size}
              onChange={(e) => handleSettingChange('platform', 'max_file_size', parseInt(e?.target?.value))}
            />
            <Input
              label="Session Timeout (minutes)"
              type="number"
              value={settings?.platform?.session_timeout}
              onChange={(e) => handleSettingChange('platform', 'session_timeout', parseInt(e?.target?.value))}
            />
          </div>
        </div>
      </div>

      {/* Fee Structure */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Fee Structure Management</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="Transaction Fee (%)"
            type="number"
            step="0.1"
            value={settings?.fees?.transaction_fee_percentage}
            onChange={(e) => handleSettingChange('fees', 'transaction_fee_percentage', parseFloat(e?.target?.value))}
          />
          <Input
            label="Minimum Transaction Fee ($)"
            type="number"
            step="0.01"
            value={settings?.fees?.minimum_transaction_fee}
            onChange={(e) => handleSettingChange('fees', 'minimum_transaction_fee', parseFloat(e?.target?.value))}
          />
          <Input
            label="Maximum Transaction Fee ($)"
            type="number"
            step="0.01"
            value={settings?.fees?.maximum_transaction_fee}
            onChange={(e) => handleSettingChange('fees', 'maximum_transaction_fee', parseFloat(e?.target?.value))}
          />
          <Input
            label="Currency Conversion Fee (%)"
            type="number"
            step="0.1"
            value={settings?.fees?.currency_conversion_fee}
            onChange={(e) => handleSettingChange('fees', 'currency_conversion_fee', parseFloat(e?.target?.value))}
          />
          <Input
            label="Refund Processing Fee ($)"
            type="number"
            step="0.01"
            value={settings?.fees?.refund_processing_fee}
            onChange={(e) => handleSettingChange('fees', 'refund_processing_fee', parseFloat(e?.target?.value))}
          />
        </div>

        <div className="mt-4 p-4 bg-accent/10 rounded-lg">
          <h4 className="text-sm font-medium text-accent mb-2">Fee Calculator Preview</h4>
          <div className="text-xs text-muted-foreground">
            <p>For a $100 transaction: Fee = ${(100 * settings?.fees?.transaction_fee_percentage / 100)?.toFixed(2)}</p>
            <p>For a $10 transaction: Fee = ${Math.max(10 * settings?.fees?.transaction_fee_percentage / 100, settings?.fees?.minimum_transaction_fee)?.toFixed(2)} (minimum applied)</p>
          </div>
        </div>
      </div>

      {/* Geographic Controls */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Geographic Region Controls</h3>
        
        <div className="space-y-6">
          {/* Enabled Regions */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Enabled Regions</h4>
            <div className="flex flex-wrap gap-2 mb-2">
              {settings?.regions?.enabled_regions?.map((region, index) => (
                <div key={index} className="flex items-center space-x-2 bg-success/10 text-success px-3 py-1 rounded-full text-sm">
                  <span>{region}</span>
                  <button
                    onClick={() => handleArraySettingRemove('regions', 'enabled_regions', region)}
                    className="text-success hover:text-success/70"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                placeholder="Add region"
                onKeyPress={(e) => {
                  if (e?.key === 'Enter') {
                    handleArraySettingAdd('regions', 'enabled_regions', e?.target?.value);
                    e.target.value = '';
                  }
                }}
              />
              <Button 
                onClick={(e) => {
                  const input = e?.target?.parentElement?.querySelector('input');
                  if (input?.value) {
                    handleArraySettingAdd('regions', 'enabled_regions', input?.value);
                    input.value = '';
                  }
                }}
              >
                Add
              </Button>
            </div>
          </div>

          {/* Restricted Countries */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Restricted Countries</h4>
            <div className="flex flex-wrap gap-2 mb-2">
              {settings?.regions?.restricted_countries?.map((country, index) => (
                <div key={index} className="flex items-center space-x-2 bg-destructive/10 text-destructive px-3 py-1 rounded-full text-sm">
                  <span>{country}</span>
                  <button
                    onClick={() => handleArraySettingRemove('regions', 'restricted_countries', country)}
                    className="text-destructive hover:text-destructive/70"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                placeholder="Add restricted country"
                onKeyPress={(e) => {
                  if (e?.key === 'Enter') {
                    handleArraySettingAdd('regions', 'restricted_countries', e?.target?.value);
                    e.target.value = '';
                  }
                }}
              />
              <Button 
                variant="destructive"
                onClick={(e) => {
                  const input = e?.target?.parentElement?.querySelector('input');
                  if (input?.value) {
                    handleArraySettingAdd('regions', 'restricted_countries', input?.value);
                    input.value = '';
                  }
                }}
              >
                Add
              </Button>
            </div>
          </div>

          {/* Supported Currencies */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Supported Currencies</h4>
            <div className="flex flex-wrap gap-2">
              {settings?.regions?.currency_support?.map((currency, index) => (
                <div key={index} className="flex items-center space-x-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                  <span>{currency}</span>
                  <button
                    onClick={() => handleArraySettingRemove('regions', 'currency_support', currency)}
                    className="text-primary hover:text-primary/70"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Feature Flags */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Feature Flags</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(settings?.features)?.map(([feature, enabled]) => (
            <div key={feature} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {feature?.replace('_', ' ')?.replace(/\b\w/g, l => l?.toUpperCase())}
                </p>
                <p className="text-xs text-muted-foreground">
                  {feature === 'real_time_messaging' && 'Enable instant messaging between users'}
                  {feature === 'automated_moderation' && 'AI-powered content moderation'}
                  {feature === 'payment_escrow' && 'Secure payment holding system'}
                  {feature === 'user_verification' && 'Identity verification requirement'}
                  {feature === 'review_system' && 'User rating and review functionality'}
                  {feature === 'mobile_notifications' && 'Push notifications for mobile apps'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => handleSettingChange('features', feature, e?.target?.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Save Changes */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline">
          Reset to Defaults
        </Button>
        <Button 
          onClick={handleSaveSettings}
          loading={isLoading}
          className="min-w-32"
        >
          Save Settings
        </Button>
      </div>

      {/* System Information */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">System Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Platform Version:</span>
            <span className="ml-2 font-medium text-foreground">v2.4.1</span>
          </div>
          <div>
            <span className="text-muted-foreground">Last Updated:</span>
            <span className="ml-2 font-medium text-foreground">Aug 10, 2024</span>
          </div>
          <div>
            <span className="text-muted-foreground">Environment:</span>
            <span className="ml-2 font-medium text-success">Production</span>
          </div>
          <div>
            <span className="text-muted-foreground">Database Version:</span>
            <span className="ml-2 font-medium text-foreground">PostgreSQL 15.3</span>
          </div>
          <div>
            <span className="text-muted-foreground">Cache Status:</span>
            <span className="ml-2 font-medium text-success">Redis Online</span>
          </div>
          <div>
            <span className="text-muted-foreground">Storage:</span>
            <span className="ml-2 font-medium text-foreground">AWS S3</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsPanel;