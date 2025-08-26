import React from 'react';
import Icon from '../../../components/AppIcon';

const humanize = (key, value) => {
  if (!value && value !== 0) return '';
  switch (key) {
    case 'departureAirport': return `From: ${value}`;
    case 'arrivalAirport': return `To: ${value}`;
    case 'region': return `Region: ${value}`;
    case 'country': return `Country: ${value}`;
    case 'category': return `Category: ${value}`;
    case 'subcategories': return `Sub: ${Array.isArray(value) ? value.join(', ') : value}`;
    case 'minPrice': return `$${value}`;
    case 'maxPrice': return `$${value}`;
    case 'price': return value;
    case 'startDate': return `From: ${value}`;
    case 'endDate': return `To: ${value}`;
    case 'pickupOptions': return `Pickup: ${Array.isArray(value) ? value.join(', ') : value}`;
    case 'travelerTypes': return `Traveler: ${Array.isArray(value) ? value.join(', ') : value}`;
    case 'deliveryTimeframe': return `Delivery: ${value}`;
    case 'sort': return `Sort: ${value}`;
    default: return `${key}: ${value}`;
  }
};

const buildChipsFromFilters = (filters) => {
  if (!filters) return [];
  const chips = [];
  const fields = ['region','country','departureAirport','arrivalAirport','category','subcategories','minPrice','maxPrice','startDate','endDate','pickupOptions','travelerTypes','deliveryTimeframe','sort'];
  fields.forEach((k) => {
    const v = filters[k];
    if (v === '' || v === null || v === undefined) return;
    if (Array.isArray(v) && v.length === 0) return;
    // present a single chip for price range
    if (k === 'minPrice' && filters.maxPrice) return; // handled with maxPrice
    if (k === 'maxPrice' && (filters.minPrice || filters.maxPrice)) {
      const label = `$${filters.minPrice || '0'} - $${filters.maxPrice || '∞'}`;
      chips.push({ id: 'price', label, removable: true });
      return;
    }
    if (k === 'startDate' && filters.endDate) return; // handled with endDate
    if (k === 'endDate' && (filters.startDate || filters.endDate)) {
      const label = `${filters.startDate || 'Any'} → ${filters.endDate}`;
      chips.push({ id: 'dates', label, removable: true });
      return;
    }
    const label = humanize(k, v);
    if (label) chips.push({ id: k, label, removable: true });
  });
  return chips;
};

const FilterChips = ({ filters, onRemove, onShowAdvancedFilters }) => {
  const filterChips = buildChipsFromFilters(filters);
  const totalActiveFilters = filterChips?.length || 0;

  return (
    <div className="bg-background border-b border-border">
      <div className="px-4 py-3">
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
          {/* Advanced Filters Button */}
          <button
            onClick={onShowAdvancedFilters}
            className="flex items-center space-x-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg whitespace-nowrap"
          >
            <Icon name="Filter" size={16} />
            <span className="text-sm font-medium">Filters</span>
            {totalActiveFilters > 0 && (
              <span className="bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalActiveFilters}
              </span>
            )}
          </button>

          {/* Active Filter Chips */}
          {filterChips?.map((chip) => (
            <div
              key={chip?.id}
              className="flex items-center space-x-2 px-3 py-2 bg-muted rounded-lg whitespace-nowrap"
            >
              <span className="text-sm font-medium text-foreground">{chip?.label}</span>
              {chip?.removable && (
                <button
                  onClick={() => onRemove?.(chip?.id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Icon name="X" size={14} />
                </button>
              )}
            </div>
          ))}

          {/* Sort Button (light) */}
          <button className="flex items-center space-x-2 px-3 py-2 border border-border rounded-lg whitespace-nowrap hover:bg-muted">
            <Icon name="ArrowUpDown" size={16} />
            <span className="text-sm font-medium">Sort</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterChips;