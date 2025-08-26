import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import RoleBasedNavigation from '../../components/ui/RoleBasedNavigation';
import MetricsCard from './components/MetricsCard';
import FeaturedProductsCarousel from './components/FeaturedProductsCarousel';
import SearchSection from './components/SearchSection';
import ProductGrid from './components/ProductGrid';
import SavedItemsSection from './components/SavedItemsSection';
import RecentRequestsPanel from './components/RecentRequestsPanel';

const BuyerDashboard = () => {
  const [currentLanguage, setCurrentLanguage] = useState('EN');
  const [user, setUser] = useState(null);
  const [metricsData, setMetricsData] = useState([]);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage) setCurrentLanguage(savedLanguage);

    const fetchAll = async () => {
      try {
        const api = await import('../../api').then(m => m.default);
        const token = localStorage.getItem('accessToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const userRes = await api.get('/api/auth/me', { headers });
        setUser(userRes.data);

        // fetch dashboard stats for buyer
        const statsRes = await api.get('/api/dashboard/stats', { headers });
        const s = statsRes.data || {};
        const mapped = [
          { title: 'Active Requests', value: (s.activeRequests !== undefined && s.activeRequests !== null) ? s.activeRequests : 0, subtitle: 'Open requests', icon: 'ShoppingBag', trend: 'up', trendValue: '', color: 'primary' },
          { title: 'Saved Products', value: (s.savedProducts !== undefined && s.savedProducts !== null) ? s.savedProducts : 0, subtitle: 'Items in wishlist', icon: 'Heart', trend: 'up', trendValue: '', color: 'accent' },
          { title: 'Completed Purchases', value: (s.completedPurchases !== undefined && s.completedPurchases !== null) ? s.completedPurchases : 0, subtitle: 'Successful transactions', icon: 'CheckCircle', trend: 'up', trendValue: '', color: 'success' },
          { title: 'Total Spent', value: s.totalSpent ? `$${s.totalSpent}` : '$0', subtitle: 'This year', icon: 'DollarSign', trend: 'up', trendValue: '', color: 'warning' }
        ];
        setMetricsData(mapped);
      } catch (err) {
        console.error('BuyerDashboard fetch error', err);
      }
    };
    fetchAll();
  }, []);

  // metricsData is populated from API into state

  const handleSearch = (query) => {
    console.log('Search query:', query);
    // Mock search functionality
  };

  const handleFilterChange = (filters) => {
    console.log('Active filters:', filters);
    // Mock filter functionality
  };

  return (
    <>
      <Helmet>
        <title>Buyer Dashboard - Valikoo</title>
        <meta name="description" content="Discover and request international products through trusted travelers on Valikoo marketplace" />
      </Helmet>
      <div className="min-h-screen bg-background">
  <RoleBasedNavigation userRole="buyer" user={user} />
        
        {/* Main Content */}
        <main className="lg:pt-16 pb-20 lg:pb-8">
          <div className="container mx-auto px-4 py-6 space-y-8">
            
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 border border-border">
              <div className="flex items-center justify-between">
                <div>
                <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.fullName || 'Traveler'}!</h1>

                  <p className="text-muted-foreground">
                    Discover amazing products from travelers around the world
                  </p>
                </div>
                <div className="hidden md:block text-right">
                  <p className="text-sm text-muted-foreground">Today's Date</p>
                  <p className="font-medium text-foreground">
                    {new Date()?.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {metricsData?.map((metric, index) => (
                <MetricsCard
                  key={index}
                  title={metric?.title}
                  value={metric?.value}
                  subtitle={metric?.subtitle}
                  icon={metric?.icon}
                  trend={metric?.trend}
                  trendValue={metric?.trendValue}
                  color={metric?.color}
                />
              ))}
            </div>

            {/* Featured Products Carousel */}
            <FeaturedProductsCarousel />

            {/* Search Section */}
            <SearchSection 
              onSearch={handleSearch}
              onFilterChange={handleFilterChange}
            />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Product Grid - Takes 2 columns on xl screens */}
              <div className="xl:col-span-2">
                <ProductGrid />
              </div>

              {/* Sidebar Content */}
              <div className="space-y-8">
                <SavedItemsSection />
                <RecentRequestsPanel />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="flex flex-col items-center space-y-2 p-4 rounded-lg border border-border hover:bg-muted transition-smooth">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">Browse All</span>
                </button>
                <button className="flex flex-col items-center space-y-2 p-4 rounded-lg border border-border hover:bg-muted transition-smooth">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">💝</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">Gift Items</span>
                </button>
                <button className="flex flex-col items-center space-y-2 p-4 rounded-lg border border-border hover:bg-muted transition-smooth">
                  <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🏷️</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">Deals</span>
                </button>
                <button className="flex flex-col items-center space-y-2 p-4 rounded-lg border border-border hover:bg-muted transition-smooth">
                  <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">Requests</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default BuyerDashboard;