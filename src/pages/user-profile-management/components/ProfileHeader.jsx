import React, { useState } from 'react';
import Button from '../../../components/ui/Button';

const ProfileHeader = ({ profileData, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(profileData?.name || '');

  const handleAvatarChange = (event) => {
    const file = event?.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onUpdate({ avatar: e?.target?.result });
      };
      reader?.readAsDataURL(file);
    }
  };

  const handleNameSave = () => {
    onUpdate({ name: tempName });
    setIsEditing(false);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 mb-6">
      <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
        {/* Avatar Section */}
        <div className="relative group">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-4 border-background shadow-lg">
            {profileData?.avatar ? (
              <img 
                src={profileData?.avatar} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-4xl md:text-5xl">👤</span>
            )}
          </div>
          
          {/* Edit Overlay */}
          <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-smooth cursor-pointer">
            <span className="text-white text-sm font-medium">Edit</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Profile Info */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-2">
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e?.target?.value)}
                  className="text-2xl font-bold bg-background border border-border rounded-md px-3 py-1"
                />
                <Button size="sm" onClick={handleNameSave}>Save</Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setIsEditing(false);
                    setTempName(profileData?.name || '');
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {profileData?.name}
                </h1>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 hover:bg-muted rounded transition-smooth"
                >
                  <span className="text-sm">✏️</span>
                </button>
              </div>
            )}
            
            {profileData?.verified && (
              <div className="flex items-center space-x-1 text-success">
                <span className="text-lg">✅</span>
                <span className="text-sm font-medium">Verified</span>
              </div>
            )}
          </div>

          <p className="text-muted-foreground mb-2">{profileData?.email}</p>
          
          {profileData?.bio && (
            <p className="text-foreground max-w-lg">{profileData?.bio}</p>
          )}

          <div className="flex flex-wrap gap-2 mt-4">
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <span>📍</span>
              <span>{profileData?.location}</span>
            </div>
            
            {profileData?.languages?.length > 0 && (
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <span>🌐</span>
                <span>{profileData?.languages?.join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Ring */}
        <div className="hidden md:flex flex-col items-center">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeDasharray="176"
                strokeDashoffset="44"
                className="text-success"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-semibold text-foreground">75%</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Profile Complete</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;