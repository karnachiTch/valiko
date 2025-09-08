import React, { useState, useEffect } from 'react';
import RoleBasedNavigation from '../../components/ui/RoleBasedNavigation';
import SearchHeader from './components/SearchHeader';
import FilterChips from './components/FilterChips';
import AdvancedFiltersPanel from './components/AdvancedFiltersPanel';
import SortAndResults from './components/SortAndResults';
import DesktopFilterSidebar from './components/DesktopFilterSidebar';
import ProductGrid from './components/ProductGrid';
import ProductList from './components/ProductList';

const ProductSearchAndBrowse = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentSort, setCurrentSort] = useState('relevance');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  // Filters are empty by default; only set when user interacts
  const defaultFilters = {
    departureAirport: '',
    region: '',
    country: '',
    arrivalAirport: '',
    category: '',
    subcategories: [],
    minPrice: '',
    maxPrice: '',
    currency: '',
    startDate: '',
    endDate: '',
    minRating: '',
    travelerTypes: [],
    pickupOptions: [],
    deliveryTimeframe: '',
    sort: ''
  };
  const [filters, setFilters] = useState(defaultFilters);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('buyer');
  // Reactive product fetching: call /api/products when filters/search/sort change (debounced)

  // Sync filters.q to searchQuery if changed from filter panels
  useEffect(() => {
    if (filters.q !== undefined && filters.q !== searchQuery) {
      setSearchQuery(filters.q);
    }
    // eslint-disable-next-line
  }, [filters.q]);

  useEffect(() => {
    let mounted = true;
    let timer = null;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // build query params
        const params = new URLSearchParams();

        // Only send searchQuery if user typed something
        if (searchQuery && searchQuery.trim() !== '') params.set('q', searchQuery);
        // Only send sort if user changed it
        if (currentSort && currentSort !== 'relevance') params.set('sort', currentSort);
        // Only send filters that are not empty/default
        Object.keys(filters || {}).forEach((k) => {
          const v = filters[k];
          if (v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0)) return;
          // Don't send default currency/sort unless user set them
          if (k === 'currency' && v === 'USD') return;
          if (k === 'sort' && v === 'relevance') return;
          if (Array.isArray(v)) params.set(k, v.join(',')); else params.set(k, String(v));
        });

        const url = `/api/products${params.toString() ? `?${params.toString()}` : ''}`;
        const res = await import('../../api').then(m => m.default.get(url));
        if (!mounted) return;
        const payload = res.data;
        const items = Array.isArray(payload) ? payload : (payload?.products || payload?.results || []);
  setProducts(items);
  setHasMore(Array.isArray(items) ? items.length > 0 : false);
  console.log('[ProductSearch] products:', items);
  console.log('[ProductSearch] filters:', filters);
  console.log('[ProductSearch] searchQuery:', searchQuery);
      } catch (err) {
        if (!mounted) return;
        setProducts([]);
        setHasMore(false);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // debounce requests to avoid spamming API on rapid input changes
    timer = setTimeout(() => {
      fetchProducts();
    }, 350);

    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [filters, searchQuery, currentSort]);

  useEffect(() => {
    // جلب بيانات المستخدم من /api/profile لتمرير avatar الحقيقي
    const fetchProfile = async () => {
      try {
        const res = await import('../../api').then(m => m.default.get('/api/profile'));
        setUser(res.data);
        setUserRole(res?.data?.role || res?.data?.userRole || localStorage.getItem('userRole') || 'buyer');
      } catch (err) {
        setUser(null);
      }
    };
    fetchProfile();
  }, []);
  const [products, setProducts] = useState([]);

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  const handleVoiceSearch = () => {
    console.log('Voice search activated');
  };

  const handleFilterRemove = (filterId) => {
    console.log('Removing filter:', filterId);
    setFilters(prev => {
      const next = { ...prev };
      switch (filterId) {
        case 'region': case 'country': case 'departureAirport': case 'arrivalAirport': case 'category':
        case 'deliveryTimeframe': case 'sort': case 'q':
          next[filterId] = '';
          break;
        case 'subcategories': case 'pickupOptions': case 'travelerTypes':
          next[filterId] = [];
          break;
        case 'price':
          next.minPrice = ''; next.maxPrice = '';
          break;
        case 'dates':
          next.startDate = ''; next.endDate = '';
          break;
        default:
          break;
      }
      return next;
    });
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    // Only set currentSort if user actually changed it
    if (newFilters?.sort && newFilters.sort !== '') setCurrentSort(newFilters.sort);
    console.log('Applying filters:', newFilters);
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    setCurrentSort('relevance');
  };
    
      return (
        <div className="min-h-screen bg-gray-50 font-sans">
          {/* شريط علوي ثابت */}
          <div className="fixed top-0 left-0 w-full z-50 shadow-sm bg-white">
            <RoleBasedNavigation user={user} userRole={userRole} />
          </div>
          {/* محتوى الصفحة */}
          <div className="pt-20 max-w-7xl mx-auto px-4">
            {/* شريط البحث */}
            <div className="mb-6">
              <div className="rounded-2xl shadow-md bg-white p-4">
                <SearchHeader
                  searchQuery={searchQuery}
                  onSearchChange={handleSearchChange}
                  onVoiceSearch={handleVoiceSearch}
                />
              </div>
            </div>
            {/* شرائح الفلاتر */}
            <FilterChips filters={filters} onRemove={handleFilterRemove} />
            {/* نافذة الفلاتر المتقدمة */}
            <AdvancedFiltersPanel
              show={showAdvancedFilters}
              filters={filters}
              onApply={handleApplyFilters}
              onReset={handleResetFilters}
              onClose={() => setShowAdvancedFilters(false)}
            />
            {/* شريط الفرز وعدد النتائج */}
            <SortAndResults
              currentSort={currentSort}
              setCurrentSort={setCurrentSort}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              loading={loading}
              hasMore={hasMore}
              products={products}
            />
            {/* تخطيط شبكي: الفلاتر يسار، المنتجات يمين */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
              <div className="lg:col-span-3 order-2 lg:order-1">
                {viewMode === 'grid' ? (
                  <ProductGrid products={products} viewMode={viewMode} loading={loading} />
                ) : (
                  <ProductList products={products} loading={loading} />
                )}
              </div>
              <div className="lg:col-span-1 order-1 lg:order-2">
                <DesktopFilterSidebar
                  filters={filters}
                  onApply={handleApplyFilters}
                  onReset={handleResetFilters}
                />
              </div>
            </div>
          </div>
        </div>
      );
    };
    export default ProductSearchAndBrowse;