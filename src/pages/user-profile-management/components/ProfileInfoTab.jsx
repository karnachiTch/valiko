import React, { useState, useEffect } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const ProfileInfoTab = ({ profileData, onUpdate, userRole }) => {
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    languages: [],
    phone: '',
    website: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [newLanguage, setNewLanguage] = useState('');

  useEffect(() => {
    setFormData({
      name: profileData?.name || '',
      bio: profileData?.bio || '',
      location: profileData?.location || '',
      languages: profileData?.languages || [],
      phone: profileData?.phone || '',
      website: profileData?.website || ''
    });
  }, [profileData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddLanguage = () => {
    if (newLanguage?.trim() && !formData?.languages?.includes(newLanguage?.trim())) {
      const updatedLanguages = [...formData?.languages, newLanguage?.trim()];
      setFormData(prev => ({ ...prev, languages: updatedLanguages }));
      setNewLanguage('');
    }
  };

  const handleRemoveLanguage = (languageToRemove) => {
    const updatedLanguages = formData?.languages?.filter(lang => lang !== languageToRemove);
    setFormData(prev => ({ ...prev, languages: updatedLanguages }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    onUpdate(formData);
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            value={formData?.name}
            onChange={(e) => handleChange('name', e?.target?.value)}
            placeholder={profileData?.name ? profileData.name : "Enter your full name"}
            required
          />
          <Input
            label="Phone Number"
            type="tel"
            value={formData?.phone}
            onChange={(e) => handleChange('phone', e?.target?.value)}
            placeholder={profileData?.phone ? profileData.phone : ""}
          />
          <Input
            label="Location"
            value={formData?.location}
            onChange={(e) => handleChange('location', e?.target?.value)}
            placeholder={profileData?.location ? profileData.location : " "}
          />
          <Input
            label="Website"
            type="url"
            value={formData?.website}
            onChange={(e) => handleChange('website', e?.target?.value)}
            placeholder={profileData?.website ? profileData.website : " "}
          />
        </div>
        
        <div className="mt-4">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Bio
          </label>
          <textarea
            value={formData?.bio}
            onChange={(e) => handleChange('bio', e?.target?.value)}
            placeholder={profileData?.bio ? profileData.bio : "Tell us about yourself..."}
            rows={4}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {formData?.bio?.length || 0}/500 characters
          </p>
        </div>
      </div>

      {/* Languages */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Languages Spoken</h3>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {formData?.languages?.map((language, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
            >
              <span>{language}</span>
              <button
                onClick={() => handleRemoveLanguage(language)}
                className="text-primary hover:text-primary/70"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="flex space-x-2">
          <Input
            placeholder="Add a language"
            value={newLanguage}
            onChange={(e) => setNewLanguage(e?.target?.value)}
            onKeyPress={(e) => e?.key === 'Enter' && handleAddLanguage()}
          />
          <Button onClick={handleAddLanguage} disabled={!newLanguage?.trim()}>
            Add
          </Button>
        </div>
      </div>

      {/* Role-Specific Sections */}
      {userRole === 'traveler' && (
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Travel Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Frequent Routes
              </label>
              <textarea
                placeholder="e.g., New York ↔ London, Paris ↔ Tokyo"
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Travel Style
              </label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <option>Frequent Business Travel</option>
                <option>Leisure Travel</option>
                <option>Mixed Travel</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          loading={isLoading}
          className="min-w-24"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default ProfileInfoTab;