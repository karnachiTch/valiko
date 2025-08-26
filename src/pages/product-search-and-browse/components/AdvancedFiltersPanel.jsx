import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';

const AdvancedFiltersPanel = ({ isOpen, show, onClose, onApplyFilters, onApply, onReset, liveSearch }) => {
  // Accept multiple prop names to be resilient against parent/child naming mismatches:
  // - `isOpen` or `show` to control visibility
  // - `onApplyFilters` or `onApply` to apply filters
  // - `onReset` to notify parent on reset
  const open = typeof isOpen !== 'undefined' ? isOpen : (typeof show !== 'undefined' ? show : false);
  const applyHandler = typeof onApplyFilters === 'function' ? onApplyFilters : (typeof onApply === 'function' ? onApply : () => {});
  const resetHandler = typeof onReset === 'function' ? onReset : () => {};
  const [expandedSections, setExpandedSections] = useState({
    location: true,
    category: false,
    price: false,
    dates: false,
    traveler: false
  });

  const [filters, setFilters] = useState({
    q: '', // keyword search
  departureAirport: '',
  region: '',
  country: '',
  arrivalAirport: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    currency: 'USD',
    startDate: '',
    endDate: '',
    minRating: '',
    pickupOptions: []
  });

  const [metadata, setMetadata] = useState({
    airports: [],
    categories: [],
    currencies: [],
  pickupChoices: [],
  regions: [],
  countries: []
  });

  const [errors, setErrors] = useState({});
  const liveSearchDebounce = useRef(null);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev?.[section]
    }));
  };

  const airportOptions = [
    { value: 'dxb', label: 'Dubai International (DXB)' },
    { value: 'jfk', label: 'John F. Kennedy (JFK)' },
    { value: 'lhr', label: 'London Heathrow (LHR)' },
    { value: 'cdg', label: 'Charles de Gaulle (CDG)' },
    { value: 'nrt', label: 'Tokyo Narita (NRT)' }
  ];

  const regionOptions = metadata.regions.length ? metadata.regions : [
    { value: 'north-america', label: 'North America' },
    { value: 'europe', label: 'Europe' },
    { value: 'middle-east', label: 'Middle East' },
    { value: 'asia', label: 'Asia' },
    { value: 'africa', label: 'Africa' }
  ];

  const countryOptions = metadata.countries.length ? metadata.countries : [
    { value: 'us', label: 'United States' },
    { value: 'gb', label: 'United Kingdom' },
    { value: 'ae', label: 'United Arab Emirates' },
    { value: 'fr', label: 'France' },
    { value: 'de', label: 'Germany' }
  ];

  const categoryOptions = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'fashion', label: 'Fashion & Clothing' },
    { value: 'cosmetics', label: 'Beauty & Cosmetics' },
    { value: 'food', label: 'Food & Beverages' },
    { value: 'books', label: 'Books & Media' },
    { value: 'sports', label: 'Sports & Outdoors' }
  ];

  const currencyOptions = [
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'AED', label: 'UAE Dirham (AED)' }
  ];

  const ratingOptions = [
    { value: '4', label: '4+ Stars' },
    { value: '3', label: '3+ Stars' },
    { value: '2', label: '2+ Stars' },
    { value: '1', label: '1+ Stars' }
  ];

  // Merge metadata fallbacks: prefer fetched metadata, otherwise static lists
  const effectiveAirportOptions = metadata.airports.length ? metadata.airports : airportOptions;
  const effectiveCategoryOptions = metadata.categories.length ? metadata.categories : categoryOptions;
  const effectiveCurrencyOptions = metadata.currencies.length ? metadata.currencies : currencyOptions;
  const pickupChoiceOptions = metadata.pickupChoices.length ? metadata.pickupChoices : [
    { value: 'airport', label: 'Airport pickup' },
    { value: 'hotel', label: 'Hotel delivery' },
    { value: 'city', label: 'City meetup' },
    { value: 'delivery', label: 'Delivery' }
  ];

  const handleApplyFilters = () => {
    // Validate
    const newErrors = {};
    const minP = Number(filters.minPrice || 0);
    const maxP = Number(filters.maxPrice || 0);
    if (filters.minPrice && filters.maxPrice && minP > maxP) {
      newErrors.price = 'Min price must be <= Max price';
    }
    if (filters.startDate && filters.endDate && new Date(filters.startDate) > new Date(filters.endDate)) {
      newErrors.dates = 'Start date must be before end date';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    // Build cleaned query object
    const cleaned = {};
    Object.keys(filters).forEach(k => {
      const v = filters[k];
      if (v !== '' && v !== null && !(Array.isArray(v) && v.length === 0)) cleaned[k] = v;
    });

    // Sync URL (shallow) for shareable links
    try {
      const url = new URL(window.location.href);
      const params = new URLSearchParams(url.search);
      Object.keys(cleaned).forEach(k => {
        params.set(k, Array.isArray(cleaned[k]) ? cleaned[k].join(',') : cleaned[k]);
      });
      const newUrl = `${url.pathname}?${params.toString()}`;
      window.history.replaceState({}, '', newUrl);
    } catch (e) {
      // ignore in non-browser env
    }

  applyHandler(cleaned);
  if (typeof onClose === 'function') onClose();
  };

  const handleResetFilters = () => {
    setFilters({
      q: '',
      departureAirport: '',
      arrivalAirport: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      currency: 'USD',
      startDate: '',
      endDate: '',
      minRating: '',
      pickupOptions: []
    });
    setErrors({});
    // notify parent if it wants to handle reset
    resetHandler();
  };

  // Try to fetch metadata (airports, categories, currencies, pickup choices)
  useEffect(() => {
    let mounted = true;
    const fetchMeta = async () => {
      try {
        const res = await fetch('/api/metadata');
        if (!res.ok) throw new Error('no metadata');
        const data = await res.json();
        if (!mounted) return;
        setMetadata({
          airports: data.airports || [],
          categories: data.categories || [],
          currencies: data.currencies || [],
          pickupChoices: data.pickupChoices || []
        });
      } catch (e) {
        // fallback to static sets
      }
    };
    fetchMeta();
    return () => { mounted = false; };
  }, []);

  // Optional live-search support: if parent passed liveSearch=true prop, call onApplyFilters with debounce when q changes
  // (we don't assume prop exists; check at runtime)
  useEffect(() => {
    // optional live-search: parent may pass liveSearch prop (boolean)
    if (!liveSearch) return;
    if (liveSearchDebounce.current) clearTimeout(liveSearchDebounce.current);
    liveSearchDebounce.current = setTimeout(() => {
      const cleaned = { q: filters.q };
      applyHandler(cleaned);
    }, 450);
    return () => clearTimeout(liveSearchDebounce.current);
  }, [filters.q, liveSearch]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
      <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Advanced Filters</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Location Filters */}
          {/* Product Name Search */}
          <div className="border-b border-border">
            <div className="px-4 pb-4">
              <Input
                label="Product Name"
                placeholder="Search by product name"
                value={filters?.q}
                onChange={(e) => setFilters(prev => ({ ...prev, q: e?.target?.value }))}
              />
            </div>
          </div>
          <div className="border-b border-border">
            <button
              onClick={() => toggleSection('location')}
              className="w-full flex items-center justify-between p-4 hover:bg-muted"
            >
              <span className="font-medium text-foreground">Location & Route</span>
              <Icon 
                name={expandedSections?.location ? "ChevronUp" : "ChevronDown"} 
                size={20} 
              />
            </button>
            {expandedSections?.location && (
              <div className="px-4 pb-4 space-y-4">
                <Select
                  label="Departure Airport"
                  placeholder="Select departure airport"
                  options={airportOptions}
                  value={filters?.departureAirport}
                  onChange={(value) => setFilters(prev => ({ ...prev, departureAirport: value }))}
                  searchable
                />
                <Select
                  label="Arrival Airport"
                  placeholder="Select arrival airport"
                  options={airportOptions}
                  value={filters?.arrivalAirport}
                  onChange={(value) => setFilters(prev => ({ ...prev, arrivalAirport: value }))}
                  searchable
                />
                <Select
                  label="Region"
                  placeholder="Select region"
                  options={regionOptions}
                  value={filters?.region}
                  onChange={(value) => setFilters(prev => ({ ...prev, region: value }))}
                />
                <Select
                  label="Country"
                  placeholder="Select country"
                  options={countryOptions}
                  value={filters?.country}
                  onChange={(value) => setFilters(prev => ({ ...prev, country: value }))}
                  searchable
                />
              </div>
            )}
          </div>

          {/* Category Filters */}
          <div className="border-b border-border">
            <button
              onClick={() => toggleSection('category')}
              className="w-full flex items-center justify-between p-4 hover:bg-muted"
            >
              <span className="font-medium text-foreground">Product Category</span>
              <Icon 
                name={expandedSections?.category ? "ChevronUp" : "ChevronDown"} 
                size={20} 
              />
            </button>
            {expandedSections?.category && (
              <div className="px-4 pb-4">
                <Select
                  label="Category"
                  placeholder="Select product category"
                  options={categoryOptions}
                  value={filters?.category}
                  onChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                />
              </div>
            )}
          </div>

          {/* Price Filters */}
          <div className="border-b border-border">
            <button
              onClick={() => toggleSection('price')}
              className="w-full flex items-center justify-between p-4 hover:bg-muted"
            >
              <span className="font-medium text-foreground">Price Range</span>
              <Icon 
                name={expandedSections?.price ? "ChevronUp" : "ChevronDown"} 
                size={20} 
              />
            </button>
            {expandedSections?.price && (
              <div className="px-4 pb-4 space-y-4">
                <Select
                  label="Currency"
                  options={currencyOptions}
                  value={filters?.currency}
                  onChange={(value) => setFilters(prev => ({ ...prev, currency: value }))}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Min Price"
                    type="number"
                    placeholder="0"
                    value={filters?.minPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e?.target?.value }))}
                  />
                  <Input
                    label="Max Price"
                    type="number"
                    placeholder="1000"
                    value={filters?.maxPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e?.target?.value }))}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Date Filters */}
          <div className="border-b border-border">
            <button
              onClick={() => toggleSection('dates')}
              className="w-full flex items-center justify-between p-4 hover:bg-muted"
            >
              <span className="font-medium text-foreground">Travel Dates</span>
              <Icon 
                name={expandedSections?.dates ? "ChevronUp" : "ChevronDown"} 
                size={20} 
              />
            </button>
            {expandedSections?.dates && (
              <div className="px-4 pb-4 space-y-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={filters?.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e?.target?.value }))}
                />
                <Input
                  label="End Date"
                  type="date"
                  value={filters?.endDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e?.target?.value }))}
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Quick Time Ranges</label>
                  <div className="space-y-1">
                    {[
                      { key: 'next_7', label: 'Next 7 days', days: 7 },
                      { key: 'next_30', label: 'Next 30 days', days: 30 },
                      { key: 'next_90', label: 'Next 3 months', days: 90 }
                    ].map((r) => {
                      const computeDate = (d) => {
                        const dt = new Date();
                        dt.setDate(dt.getDate() + d);
                        return dt.toISOString().slice(0, 10);
                      };
                      const future = computeDate(r.days);
                      const isChecked = filters?.endDate === future;
                      return (
                        <label key={r.key} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={!!isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                const start = new Date().toISOString().slice(0, 10);
                                setFilters(prev => ({ ...prev, startDate: start, endDate: future }));
                              } else {
                                setFilters(prev => ({ ...prev, startDate: '', endDate: '' }));
                              }
                            }}
                          />
                          <span className="text-sm">{r.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Traveler Filters */}
          <div className="border-b border-border">
            <button
              onClick={() => toggleSection('traveler')}
              className="w-full flex items-center justify-between p-4 hover:bg-muted"
            >
              <span className="font-medium text-foreground">Traveler Preferences</span>
              <Icon 
                name={expandedSections?.traveler ? "ChevronUp" : "ChevronDown"} 
                size={20} 
              />
            </button>
            {expandedSections?.traveler && (
              <div className="px-4 pb-4 space-y-4">
                <Select
                  label="Minimum Rating"
                  placeholder="Select minimum rating"
                  options={ratingOptions}
                  value={filters?.minRating}
                  onChange={(value) => setFilters(prev => ({ ...prev, minRating: value }))}
                />
                <Select
                  label="Sort By"
                  placeholder="Select sort order"
                  options={[
                    { value: 'relevance', label: 'Relevance' },
                    { value: 'price_asc', label: 'Price: Low to High' },
                    { value: 'price_desc', label: 'Price: High to Low' },
                    { value: 'rating', label: 'Best Rated' }
                  ]}
                  value={filters?.sort}
                  onChange={(value) => setFilters(prev => ({ ...prev, sort: value }))}
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Pickup Options</label>
                  <div className="space-y-2">
                    {pickupChoiceOptions.map((choice) => {
                      const checked = filters.pickupOptions.includes(choice.value);
                      return (
                        <label key={choice.value} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              setFilters(prev => {
                                const next = new Set(prev.pickupOptions || []);
                                if (e.target.checked) next.add(choice.value); else next.delete(choice.value);
                                return { ...prev, pickupOptions: Array.from(next) };
                              });
                            }}
                          />
                          <span className="text-sm">{choice.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-muted/50">
          <Button
            variant="outline"
            onClick={handleResetFilters}
          >
            Reset All
          </Button>
          <Button
            variant="default"
            onClick={handleApplyFilters}
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFiltersPanel;