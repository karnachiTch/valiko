import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';

const SearchHeader = ({ searchQuery, onSearchChange, onVoiceSearch }) => {
  const [isListening, setIsListening] = useState(false);

  const handleVoiceSearch = () => {
    setIsListening(true);
    onVoiceSearch();
    setTimeout(() => setIsListening(false), 2000);
  };

  return (
    <div className="bg-card border-b border-border sticky top-0 z-50">
      <div className="px-4 py-3">
        <div className="relative">
          <Input
            type="search"
            placeholder="Search for products, destinations, or travelers..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e?.target?.value)}
            className="pr-12"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
            <button
              onClick={handleVoiceSearch}
              className={`p-1.5 rounded-lg transition-smooth ${
                isListening 
                  ? 'bg-accent text-accent-foreground' 
                  : 'hover:bg-muted text-muted-foreground'
              }`}
            >
              <Icon name="Mic" size={16} />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
              <Icon name="Search" size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchHeader;