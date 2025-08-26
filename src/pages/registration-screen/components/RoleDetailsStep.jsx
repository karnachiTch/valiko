import React from 'react';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const RoleDetailsStep = ({ formData, setFormData, errors }) => {
  // Mock data for dropdowns
  const countries = [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'ca', label: 'Canada' },
    { value: 'au', label: 'Australia' },
    { value: 'de', label: 'Germany' },
    { value: 'fr', label: 'France' },
    { value: 'jp', label: 'Japan' },
    { value: 'sg', label: 'Singapore' },
    { value: 'ae', label: 'United Arab Emirates' },
    { value: 'in', label: 'India' }
  ];

  const airports = [
    { value: 'jfk', label: 'John F. Kennedy International Airport (JFK) - New York' },
    { value: 'lhr', label: 'Heathrow Airport (LHR) - London' },
    { value: 'dxb', label: 'Dubai International Airport (DXB) - Dubai' },
    { value: 'nrt', label: 'Narita International Airport (NRT) - Tokyo' },
    { value: 'cdg', label: 'Charles de Gaulle Airport (CDG) - Paris' },
    { value: 'fra', label: 'Frankfurt Airport (FRA) - Frankfurt' },
    { value: 'sin', label: 'Singapore Changi Airport (SIN) - Singapore' },
    { value: 'syd', label: 'Sydney Kingsford Smith Airport (SYD) - Sydney' },
    { value: 'yyz', label: 'Toronto Pearson International Airport (YYZ) - Toronto' },
    { value: 'del', label: 'Indira Gandhi International Airport (DEL) - Delhi' }
  ];

  const productCategories = [
    { value: 'electronics', label: 'Electronics & Gadgets' },
    { value: 'fashion', label: 'Fashion & Clothing' },
    { value: 'beauty', label: 'Beauty & Cosmetics' },
    { value: 'food', label: 'Food & Beverages' },
    { value: 'books', label: 'Books & Media' },
    { value: 'sports', label: 'Sports & Outdoor' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'toys', label: 'Toys & Games' },
    { value: 'health', label: 'Health & Wellness' },
    { value: 'automotive', label: 'Automotive' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field, checked) => {
    setFormData(prev => ({ ...prev, [field]: checked }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          {formData?.role === 'traveler' ? 'Traveler Details' : 'Buyer Preferences'}
        </h2>
        <p className="text-muted-foreground">
          {formData?.role === 'traveler' ?'Tell us about your travel patterns' :'Let us know what you\'re looking for'
          }
        </p>
      </div>
      {formData?.role === 'traveler' ? (
        <div className="space-y-4">
          <Select
            label="Primary Departure Country"
            placeholder="Select your home country"
            options={countries}
            value={formData?.departureCountry || ''}
            onChange={(value) => handleInputChange('departureCountry', value)}
            error={errors?.departureCountry}
            searchable
            required
          />

          <Select
            label="Frequent Departure Airports"
            placeholder="Select airports you frequently travel from"
            options={airports}
            value={formData?.departureAirports || []}
            onChange={(value) => handleInputChange('departureAirports', value)}
            error={errors?.departureAirports}
            multiple
            searchable
            description="You can select multiple airports"
          />

          <Select
            label="Frequent Destination Countries"
            placeholder="Select countries you frequently visit"
            options={countries}
            value={formData?.destinationCountries || []}
            onChange={(value) => handleInputChange('destinationCountries', value)}
            error={errors?.destinationCountries}
            multiple
            searchable
            description="This helps buyers find you for specific regions"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <Select
            label="Your Location (Country)"
            placeholder="Select your country"
            options={countries}
            value={formData?.buyerCountry || ''}
            onChange={(value) => handleInputChange('buyerCountry', value)}
            error={errors?.buyerCountry}
            searchable
            required
          />

          <Select
            label="Preferred Product Categories"
            placeholder="Select categories you're interested in"
            options={productCategories}
            value={formData?.preferredCategories || []}
            onChange={(value) => handleInputChange('preferredCategories', value)}
            error={errors?.preferredCategories}
            multiple
            searchable
            description="This helps us show you relevant products"
          />

          <Select
            label="Preferred Source Countries"
            placeholder="Select countries you want products from"
            options={countries}
            value={formData?.sourceCountries || []}
            onChange={(value) => handleInputChange('sourceCountries', value)}
            error={errors?.sourceCountries}
            multiple
            searchable
            description="Leave empty to see products from all countries"
          />
        </div>
      )}
      <div className="space-y-4 pt-6 border-t border-border">
        <Checkbox
          label="I agree to the Terms of Service"
          checked={formData?.agreeToTerms || false}
          onChange={(e) => handleCheckboxChange('agreeToTerms', e?.target?.checked)}
          error={errors?.agreeToTerms}
          required
        />

        <Checkbox
          label="I agree to the Privacy Policy"
          checked={formData?.agreeToPrivacy || false}
          onChange={(e) => handleCheckboxChange('agreeToPrivacy', e?.target?.checked)}
          error={errors?.agreeToPrivacy}
          required
        />

        <Checkbox
          label="I want to receive email updates about new features and opportunities"
          checked={formData?.emailUpdates || false}
          onChange={(e) => handleCheckboxChange('emailUpdates', e?.target?.checked)}
          description="You can change this preference later in your account settings"
        />
      </div>
    </div>
  );
};

export default RoleDetailsStep;