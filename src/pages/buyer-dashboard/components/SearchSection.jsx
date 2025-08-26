import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';

const SearchSection = ({ onSearch, onFilterChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);

  const filterOptions = [
    { id: 'electronics', label: 'Electronics', count: 45 },
    { id: 'fashion', label: 'Fashion', count: 32 },
    { id: 'beauty', label: 'Beauty', count: 28 },
    { id: 'food', label: 'Food & Beverages', count: 19 },
    { id: 'books', label: 'Books', count: 15 },
    { id: 'sports', label: 'Sports', count: 12 }
  ];

  const locationFilters = [
    { id: 'europe', label: 'Europe', count: 67 },
    { id: 'asia', label: 'Asia', count: 54 },
    { id: 'america', label: 'North America', count: 43 },
    { id: 'oceania', label: 'Oceania', count: 21 }
  ];

  const handleSearch = (e) => {
    e?.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const toggleFilter = (filterId, type = 'category') => {
    const filterKey = `${type}-${filterId}`;
    let newFilters;
    
    if (activeFilters?.includes(filterKey)) {
      newFilters = activeFilters?.filter(f => f !== filterKey);
    } else {
      newFilters = [...activeFilters, filterKey];
    }
    
    setActiveFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    if (onFilterChange) {
      onFilterChange([]);
    }
  };

  const suggestions = [
    "Swiss chocolate",
    "Japanese electronics",
    "French perfume",
    "Italian leather",
    "German tools"
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground mb-2">Find Products</h2>
        
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <Input
              type="search"
              placeholder="Search for products, brands, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e?.target?.value)}
              className="pl-10 pr-12"
            />
            <Icon 
              name="Search" 
              size={18} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-md hover:bg-muted transition-smooth"
            >
              <Icon name="ArrowRight" size={16} className="text-muted-foreground" />
            </button>
          </div>
          
          {searchQuery && (
            <div className="absolute top-full left-0 right-0 bg-card border border-border rounded-lg mt-1 shadow-modal z-10">
              {suggestions?.filter(s => s?.toLowerCase()?.includes(searchQuery?.toLowerCase()))?.slice(0, 5)?.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSearchQuery(suggestion)}
                    className="w-full text-left px-4 py-2 hover:bg-muted transition-smooth first:rounded-t-lg last:rounded-b-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <Icon name="Search" size={14} className="text-muted-foreground" />
                      <span className="text-sm text-foreground">{suggestion}</span>
                    </div>
                  </button>
                ))}
            </div>
          )}
        </form>
      </div>
      {/* Active Filters */}
      {activeFilters?.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Active Filters</span>
            <button
              onClick={clearAllFilters}
              className="text-xs text-muted-foreground hover:text-foreground transition-smooth"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeFilters?.map((filter) => {
              const [type, id] = filter?.split('-');
              const filterData = type === 'category' 
                ? filterOptions?.find(f => f?.id === id)
                : locationFilters?.find(f => f?.id === id);
              
              return (
                <span
                  key={filter}
                  className="inline-flex items-center space-x-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-xs"
                >
                  <span>{filterData?.label}</span>
                  <button
                    onClick={() => toggleFilter(id, type)}
                    className="hover:bg-primary/20 rounded-full p-0.5 transition-smooth"
                  >
                    <Icon name="X" size={10} />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
      {/* Filter Chips */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-medium text-foreground mb-2">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {filterOptions?.map((filter) => {
              const isActive = activeFilters?.includes(`category-${filter?.id}`);
              return (
                <button
                  key={filter?.id}
                  onClick={() => toggleFilter(filter?.id, 'category')}
                  className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-sm transition-smooth ${
                    isActive
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-border hover:bg-muted'
                  }`}
                >
                  <span>{filter?.label}</span>
                  <span className={`text-xs ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {filter?.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-foreground mb-2">Regions</h3>
          <div className="flex flex-wrap gap-2">
            {locationFilters?.map((filter) => {
              const isActive = activeFilters?.includes(`location-${filter?.id}`);
              return (
                <button
                  key={filter?.id}
                  onClick={() => toggleFilter(filter?.id, 'location')}
                  className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-sm transition-smooth ${
                    isActive
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-border hover:bg-muted'
                  }`}
                >
                  <span>{filter?.label}</span>
                  <span className={`text-xs ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {filter?.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchSection;