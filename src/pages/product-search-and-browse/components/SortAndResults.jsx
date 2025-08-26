import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Select from '../../../components/ui/Select';

const SortAndResults = ({ totalResults = 0, currentSort = 'relevance', onSortChange = null, setCurrentSort = null, viewMode = 'grid', onViewModeChange = null, setViewMode = null }) => {
  const sortOptions = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'date_newest', label: 'Travel Date: Soonest' },
  { value: 'date_latest', label: 'Travel Date: Latest' },
  { value: 'rating', label: 'Highest Rated Travelers' },
  { value: 'newest', label: 'Recently Added' }
  ];

  const formatResultsCount = (count) => {
    if (count === 0) return 'No results';
    if (count === 1) return '1 result';
    return `${count?.toLocaleString()} results`;
  };

  return (
    <div className="bg-background border-b border-border">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Results Count */}
          <div className="flex items-center space-x-4">
            <p className="text-sm text-muted-foreground">
              {formatResultsCount(totalResults)} found
            </p>
            
            {/* View Mode Toggle - Desktop Only */}
            <div className="hidden lg:flex items-center space-x-1 bg-muted rounded-lg p-1">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-1.5 rounded-md transition-smooth ${
                  viewMode === 'grid' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name="Grid3X3" size={16} />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`p-1.5 rounded-md transition-smooth ${
                  viewMode === 'list' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name="List" size={16} />
              </button>
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground hidden sm:block">Sort by:</span>
            <div className="w-48">
              <Select
                options={sortOptions}
                value={currentSort}
                onChange={(v) => {
                  if (typeof onSortChange === 'function') onSortChange(v);
                  else if (typeof setCurrentSort === 'function') setCurrentSort(v);
                }}
                placeholder="Sort by..."
              />
            </div>
          </div>
        </div>

        {/* Mobile View Mode Toggle */}
        <div className="lg:hidden mt-3 flex items-center justify-center">
          <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md transition-smooth ${
                viewMode === 'grid' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name="Grid3X3" size={16} />
              <span className="text-sm">Grid</span>
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md transition-smooth ${
                viewMode === 'list' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name="List" size={16} />
              <span className="text-sm">List</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SortAndResults;