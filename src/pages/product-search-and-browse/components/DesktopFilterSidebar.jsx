import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';

const DesktopFilterSidebar = ({ filters, onFiltersChange = null, onApply = null, onReset = null, onResetFilters = null }) => {
  const [expandedSections, setExpandedSections] = useState({
    location: true,
    category: true,
    price: true,
    dates: true,
    traveler: true,
    pickup: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev?.[section]
    }));
  };

  const applyFilters = (newFilters) => {
    if (typeof onFiltersChange === 'function') return onFiltersChange(newFilters);
    if (typeof onApply === 'function') return onApply(newFilters);
    // no-op if neither provided
    return null;
  };

  const resetFilters = () => {
    if (typeof onReset === 'function') return onReset();
    if (typeof onResetFilters === 'function') return onResetFilters();
    return null;
  };

  const airportOptions = [
    { value: 'dxb', label: 'Dubai International (DXB)' },
    { value: 'jfk', label: 'John F. Kennedy (JFK)' },
    { value: 'lhr', label: 'London Heathrow (LHR)' },
    { value: 'cdg', label: 'Charles de Gaulle (CDG)' },
    { value: 'nrt', label: 'Tokyo Narita (NRT)' },
    { value: 'sin', label: 'Singapore Changi (SIN)' },
    { value: 'hnd', label: 'Tokyo Haneda (HND)' },
    { value: 'fra', label: 'Frankfurt (FRA)' }
  ];

  const categoryOptions = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'fashion', label: 'Fashion & Clothing' },
    { value: 'cosmetics', label: 'Beauty & Cosmetics' },
    { value: 'food', label: 'Food & Beverages' },
    { value: 'books', label: 'Books & Media' },
    { value: 'sports', label: 'Sports & Outdoors' },
    { value: 'jewelry', label: 'Jewelry & Accessories' },
    { value: 'home', label: 'Home & Garden' }
  ];

  const currencyOptions = [
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'AED', label: 'UAE Dirham (AED)' }
  ];

  const FilterSection = ({ title, sectionKey, children }) => (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-smooth"
      >
        <span className="font-medium text-foreground">{title}</span>
        <Icon 
          name={expandedSections?.[sectionKey] ? "ChevronUp" : "ChevronDown"} 
          size={16} 
        />
      </button>
      {expandedSections?.[sectionKey] && (
        <div className="px-4 pb-4 space-y-4">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="hidden lg:block w-80 bg-card border-r border-border h-full overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Filters</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            iconName="RotateCcw"
          >
            Reset
          </Button>
        </div>
      </div>
      {/* Filter Sections */}
      <div className="divide-y divide-border">
        {/* Location Filters */}
          <FilterSection title="Location & Route" sectionKey="location">
          <Select
            label="Departure Airport"
            placeholder="Select departure airport"
            options={airportOptions}
            value={filters?.departureAirport}
            onChange={(value) => applyFilters({ ...filters, departureAirport: value })}
            searchable
          />
          <Select
            label="Arrival Airport"
            placeholder="Select arrival airport"
            options={airportOptions}
            value={filters?.arrivalAirport}
            onChange={(value) => applyFilters({ ...filters, arrivalAirport: value })}
            searchable
          />
          <div className="pt-2">
            <Input
              label="Product Name"
              placeholder="Search by product name"
              value={filters?.q}
              onChange={(e) => applyFilters({ ...filters, q: e?.target?.value })}
            />
          </div>
        </FilterSection>

        {/* Category Filters */}
          <FilterSection title="Product Category" sectionKey="category">
          <Select
            label="Category"
            placeholder="Select product category"
            options={categoryOptions}
            value={filters?.category}
            onChange={(value) => applyFilters({ ...filters, category: value })}
          />
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Subcategories</label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {[
                'smartphones',
                'laptops',
                'audio',
                'gaming',
                'smartwatches'
              ].map((key) => {
                const labelMap = {
                  smartphones: 'Smartphones & Tablets',
                  laptops: 'Laptops & Computers',
                  audio: 'Audio & Headphones',
                  gaming: 'Gaming Accessories',
                  smartwatches: 'Smart Watches'
                };
                const checked = Array.isArray(filters?.subcategories) && filters.subcategories.includes(key);
                return (
                  <Checkbox
                    key={key}
                    label={labelMap[key]}
                    checked={checked}
                    onChange={(e) => {
                      const next = new Set(filters?.subcategories || []);
                      if (e.target.checked) next.add(key); else next.delete(key);
                      applyFilters({ ...filters, subcategories: Array.from(next) });
                    }}
                  />
                );
              })}
            </div>
          </div>
        </FilterSection>

        {/* Price Filters */}
          <FilterSection title="Price Range" sectionKey="price">
          <Select
            label="Currency"
            options={currencyOptions}
            value={filters?.currency}
            onChange={(value) => applyFilters({ ...filters, currency: value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Min Price"
              type="number"
              placeholder="0"
              value={filters?.minPrice}
              onChange={(e) => applyFilters({ ...filters, minPrice: e?.target?.value })}
            />
            <Input
              label="Max Price"
              type="number"
              placeholder="1000"
              value={filters?.maxPrice}
              onChange={(e) => applyFilters({ ...filters, maxPrice: e?.target?.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Quick Price Ranges</label>
            <div className="space-y-1">
              {[
                { key: 'under50', label: 'Under $50', min: '', max: '50' },
                { key: '50-200', label: '$50 - $200', min: '50', max: '200' },
                { key: '200-500', label: '$200 - $500', min: '200', max: '500' },
                { key: '500-1000', label: '$500 - $1000', min: '500', max: '1000' },
                { key: 'over1000', label: 'Over $1000', min: '1000', max: '' }
              ].map((r) => {
                const isChecked = (filters?.minPrice === (r.min || '') && filters?.maxPrice === (r.max || '')) ||
                  (r.min === '' && filters?.maxPrice === r.max) ||
                  (r.max === '' && filters?.minPrice === r.min);
                return (
                  <Checkbox
                    key={r.key}
                    label={r.label}
                    checked={!!isChecked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        applyFilters({ ...filters, minPrice: r.min || '', maxPrice: r.max || '' });
                      } else {
                        applyFilters({ ...filters, minPrice: '', maxPrice: '' });
                      }
                    }}
                  />
                );
              })}
            </div>
          </div>
        </FilterSection>

        {/* Date Filters */}
          <FilterSection title="Travel Dates" sectionKey="dates">
          <Input
            label="Start Date"
            type="date"
            value={filters?.startDate}
            onChange={(e) => applyFilters({ ...filters, startDate: e?.target?.value })}
          />
          <Input
            label="End Date"
            type="date"
            value={filters?.endDate}
            onChange={(e) => applyFilters({ ...filters, endDate: e?.target?.value })}
          />
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Quick Date Ranges</label>
            <div className="space-y-1">
              {[
                { key: '7', label: 'Next 7 days', days: 7 },
                { key: '30', label: 'Next 30 days', days: 30 },
                { key: '90', label: 'Next 3 months', days: 90 },
                { key: '180', label: 'Next 6 months', days: 180 }
              ].map((r) => {
                const computeDate = (d) => {
                  const dt = new Date();
                  dt.setDate(dt.getDate() + d);
                  return dt.toISOString().slice(0, 10);
                };
                const future = computeDate(r.days);
                const isChecked = filters?.endDate === future;
                return (
                  <Checkbox
                    key={r.key}
                    label={r.label}
                    checked={!!isChecked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const start = new Date().toISOString().slice(0, 10);
                        applyFilters({ ...filters, startDate: start, endDate: future });
                      } else {
                        applyFilters({ ...filters, startDate: '', endDate: '' });
                      }
                    }}
                  />
                );
              })}
            </div>
          </div>
        </FilterSection>

        {/* Traveler Filters */}
        <FilterSection title="Traveler Preferences" sectionKey="traveler">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Minimum Rating</label>
            <div className="space-y-1">
              {[5,4,3,2].map((r) => (
                <Checkbox
                  key={r}
                  label={`${r}${r === 5 ? ' Stars' : '+ Stars'}`}
                  checked={Number(filters?.minRating || 0) >= r}
                  onChange={(e) => {
                    if (e.target.checked) applyFilters({ ...filters, minRating: String(r) });
                    else applyFilters({ ...filters, minRating: '' });
                  }}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Traveler Type</label>
            <div className="space-y-1">
              {['verified','frequent','business','new'].map((t) => (
                <Checkbox
                  key={t}
                  label={t.replace(/^[a-z]/, (s) => s.toUpperCase()) + ' Travelers'}
                  checked={Array.isArray(filters?.travelerTypes) && filters.travelerTypes.includes(t)}
                  onChange={(e) => {
                    const next = new Set(filters?.travelerTypes || []);
                    if (e.target.checked) next.add(t); else next.delete(t);
                    applyFilters({ ...filters, travelerTypes: Array.from(next) });
                  }}
                />
              ))}
            </div>
          </div>
        </FilterSection>

        {/* Pickup Options */}
        <FilterSection title="Pickup & Delivery" sectionKey="pickup">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Pickup Options</label>
            <div className="space-y-1">
              {[
                { key: 'airport', label: 'Airport pickup available' },
                { key: 'hotel', label: 'Hotel delivery available' },
                { key: 'city', label: 'City center meetup' },
                { key: 'delivery', label: 'Home delivery' },
                { key: 'office', label: 'Office delivery' }
              ].map((opt) => (
                <Checkbox
                  key={opt.key}
                  label={opt.label}
                  checked={Array.isArray(filters?.pickupOptions) && filters.pickupOptions.includes(opt.key)}
                  onChange={(e) => {
                    const next = new Set(filters?.pickupOptions || []);
                    if (e.target.checked) next.add(opt.key); else next.delete(opt.key);
                    applyFilters({ ...filters, pickupOptions: Array.from(next) });
                  }}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Delivery Timeframe</label>
            <div className="space-y-1">
              {[
                { key: 'same_day', label: 'Same day delivery' },
                { key: 'next_day', label: 'Next day delivery' },
                { key: '3_days', label: 'Within 3 days' },
                { key: '1_week', label: 'Within a week' }
              ].map((d) => (
                <Checkbox
                  key={d.key}
                  label={d.label}
                  checked={filters?.deliveryTimeframe === d.key}
                  onChange={(e) => {
                    if (e.target.checked) applyFilters({ ...filters, deliveryTimeframe: d.key });
                    else applyFilters({ ...filters, deliveryTimeframe: '' });
                  }}
                />
              ))}
            </div>
          </div>
        </FilterSection>
      </div>
    </div>
  );
};

export default DesktopFilterSidebar;