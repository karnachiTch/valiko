import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const PreferencesTab = ({ userRole, onUpdate, profileData = {} }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currency, setCurrency] = useState(profileData?.currency || 'USD');
  const [language, setLanguage] = useState(profileData?.language || 'English');
  const [timeZone, setTimeZone] = useState(profileData?.timeZone || 'America/New_York');
  const [interests, setInterests] = useState(profileData?.interests || ['Electronics', 'Fashion', 'Books']);
  const [newInterest, setNewInterest] = useState('');
  const [travelerPrefs, setTravelerPrefs] = useState(profileData?.travelerPrefs || {
    pickupAvailability: true,
    maxItemWeight: '5',
    preferredRegions: ['Europe', 'Asia'],
    transportMethods: ['Airplane', 'Train']
  });
  const [buyerPrefs, setBuyerPrefs] = useState(profileData?.buyerPrefs || {
    deliveryAddresses: [
      { id: 1, label: 'Home', address: '123 Main St, New York, NY 10001', default: true },
      { id: 2, label: 'Work', address: '456 Business Ave, New York, NY 10002', default: false }
    ],
    budgetRange: { min: 50, max: 500 },
    preferredCategories: ['Electronics', 'Fashion', 'Home & Garden']
  });

  React.useEffect(() => {
    setCurrency(profileData?.currency || 'USD');
    setLanguage(profileData?.language || 'English');
    setTimeZone(profileData?.timeZone || 'America/New_York');
    setInterests(profileData?.interests || ['Electronics', 'Fashion', 'Books']);
    setTravelerPrefs(profileData?.travelerPrefs || {
      pickupAvailability: true,
      maxItemWeight: '5',
      preferredRegions: ['Europe', 'Asia'],
      transportMethods: ['Airplane', 'Train']
    });
    setBuyerPrefs(profileData?.buyerPrefs || {
      deliveryAddresses: [
        { id: 1, label: 'Home', address: '123 Main St, New York, NY 10001', default: true },
        { id: 2, label: 'Work', address: '456 Business Ave, New York, NY 10002', default: false }
      ],
      budgetRange: { min: 50, max: 500 },
      preferredCategories: ['Electronics', 'Fashion', 'Home & Garden']
    });
  }, [profileData]);

  const currencies = [
    'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'SAR', 'AED', 'KWD', 'QAR', 'EGP', 'DZD', 'TRY', 'CHF', 'SEK', 'NOK', 'DKK', 'RUB', 'INR', 'BRL', 'ZAR', 'SGD', 'HKD', 'MXN', 'PLN', 'THB', 'MYR', 'IDR', 'KRW'
  ];
  const languages = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Arabic', 'Turkish', 'Russian', 'Chinese', 'Japanese', 'Korean', 'Hindi', 'Urdu', 'Indonesian', 'Malay', 'Dutch', 'Polish', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Greek', 'Czech', 'Romanian', 'Hungarian', 'Thai', 'Vietnamese', 'Filipino', 'Bengali', 'Ukrainian', 'Serbian', 'Croatian', 'Slovak', 'Slovenian', 'Bulgarian', 'Hebrew', 'Persian', 'Swahili'
  ];
  const timeZones = [
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Australia/Sydney'
  ];

  const availableInterests = [
    'Electronics', 'Fashion', 'Books', 'Sports', 'Travel', 'Food',
    'Art', 'Music', 'Photography', 'Gaming', 'Health', 'Beauty',
    'Home & Garden', 'Automotive', 'Jewelry', 'Toys'
  ];

  const handleAddInterest = () => {
    if (newInterest?.trim() && !interests?.includes(newInterest?.trim())) {
      setInterests([...interests, newInterest?.trim()]);
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interestToRemove) => {
    setInterests(interests?.filter(interest => interest !== interestToRemove));
  };

  const handleAddAddress = () => {
    const newAddress = {
      id: Date.now(),
      label: 'New Address',
      address: '',
      default: false
    };
    setBuyerPrefs(prev => ({
      ...prev,
      deliveryAddresses: [...prev?.deliveryAddresses, newAddress]
    }));
  };

  const handleRemoveAddress = (addressId) => {
    setBuyerPrefs(prev => ({
      ...prev,
      deliveryAddresses: prev?.deliveryAddresses?.filter(addr => addr?.id !== addressId)
    }));
  };

  const handleSetDefaultAddress = (addressId) => {
    setBuyerPrefs(prev => ({
      ...prev,
      deliveryAddresses: prev?.deliveryAddresses?.map(addr => ({
        ...addr,
        default: addr?.id === addressId
      }))
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    await onUpdate({
      currency,
      language,
      timeZone,
      interests,
      travelerPrefs,
      buyerPrefs
    });
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* General Preferences */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">General Preferences</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e?.target?.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {currencies?.map(curr => (
                <option key={curr} value={curr}>{curr}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e?.target?.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {languages?.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Time Zone
            </label>
            <select
              value={timeZone}
              onChange={(e) => setTimeZone(e?.target?.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {timeZones?.map(tz => (
                <option key={tz} value={tz}>{tz?.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Interests */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Interests</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Help us show you relevant products by selecting your interests.
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {interests?.map((interest, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
            >
              <span>{interest}</span>
              <button
                onClick={() => handleRemoveInterest(interest)}
                className="text-primary hover:text-primary/70"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {availableInterests?.filter(interest => !interests?.includes(interest))?.map(interest => (
            <button
              key={interest}
              onClick={() => setInterests([...interests, interest])}
              className="px-3 py-1 text-sm border border-border rounded-full hover:bg-muted transition-smooth"
            >
              + {interest}
            </button>
          ))}
        </div>

        <div className="flex space-x-2">
          <Input
            placeholder="Add custom interest"
            value={newInterest}
            onChange={(e) => setNewInterest(e?.target?.value)}
            onKeyPress={(e) => e?.key === 'Enter' && handleAddInterest()}
          />
          <Button onClick={handleAddInterest} disabled={!newInterest?.trim()}>
            Add
          </Button>
        </div>
      </div>

      {/* Role-Specific Preferences */}
      {userRole === 'traveler' && (
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Travel Preferences</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Available for Pickup</p>
                <p className="text-xs text-muted-foreground">Allow buyers to request item pickups</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={travelerPrefs?.pickupAvailability}
                  onChange={() => setTravelerPrefs(prev => ({
                    ...prev,
                    pickupAvailability: !prev?.pickupAvailability
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Maximum Item Weight (kg)"
                type="number"
                value={travelerPrefs?.maxItemWeight}
                onChange={(e) => setTravelerPrefs(prev => ({
                  ...prev,
                  maxItemWeight: e?.target?.value
                }))}
                min="1"
                max="50"
              />
            </div>
          </div>
        </div>
      )}

      {userRole === 'buyer' && (
        <>
          {/* Delivery Addresses */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Delivery Addresses</h3>
            
            <div className="space-y-3">
              {buyerPrefs?.deliveryAddresses?.map((address) => (
                <div key={address?.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-foreground">{address?.label}</h4>
                      {address?.default && (
                        <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      {!address?.default && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetDefaultAddress(address?.id)}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveAddress(address?.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{address?.address}</p>
                </div>
              ))}
            </div>

            <Button onClick={handleAddAddress} className="mt-4">
              Add New Address
            </Button>
          </div>

          {/* Budget & Categories */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Shopping Preferences</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Budget Range
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Minimum ($)"
                    type="number"
                    value={buyerPrefs?.budgetRange?.min}
                    onChange={(e) => setBuyerPrefs(prev => ({
                      ...prev,
                      budgetRange: { ...prev?.budgetRange, min: e?.target?.value }
                    }))}
                    min="0"
                  />
                  <Input
                    label="Maximum ($)"
                    type="number"
                    value={buyerPrefs?.budgetRange?.max}
                    onChange={(e) => setBuyerPrefs(prev => ({
                      ...prev,
                      budgetRange: { ...prev?.budgetRange, max: e?.target?.value }
                    }))}
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Preferred Categories
                </label>
                <div className="flex flex-wrap gap-2">
                  {buyerPrefs?.preferredCategories?.map((category, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 bg-accent/10 text-accent px-3 py-1 rounded-full text-sm"
                    >
                      <span>{category}</span>
                      <button
                        onClick={() => setBuyerPrefs(prev => ({
                          ...prev,
                          preferredCategories: prev?.preferredCategories?.filter(cat => cat !== category)
                        }))}
                        className="text-accent hover:text-accent/70"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {/* زر الحفظ */}
      <div className="flex justify-end pt-6">
        <Button variant="default" onClick={handleSave} loading={isLoading}>
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default PreferencesTab;