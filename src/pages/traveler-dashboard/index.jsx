import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleBasedNavigation from '../../components/ui/RoleBasedNavigation';
import MetricsCard from './components/MetricsCard';

import ActiveListingCard from './components/ActiveListingCard';
import UpcomingTripCard from './components/UpcomingTripCard';
import BuyerRequestCard from './components/BuyerRequestCard';
import RecentActivityFeed from './components/RecentActivityFeed';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import api from '../../api';

const TravelerDashboard = () => {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for dashboard metrics

  // بيانات من الخادم
  const [user, setUser] = useState(null);
  const [dashboardMetrics, setDashboardMetrics] = useState([]);
  const [activeListings, setActiveListings] = useState([]);
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [fulfillingIds, setFulfillingIds] = useState([]);


  // دالة fetchAll متاحة للاستخدام في أي مكان
  const fetchAll = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const headers = { Authorization: `Bearer ${token}` };
      // بيانات المستخدم
      const userRes = await api.get('/api/auth/me', { headers });
      setUser(userRes.data);
      // الإحصائيات
      const statsRes = await api.get('/api/dashboard/stats', { headers });
  // الرحلات القادمة
  const tripsRes = await api.get('/api/dashboard/upcoming-trips', { headers });
  console.log('upcoming trips from backend:', tripsRes.data);
      // العروض النشطة فقط
      const listingsRes = await api.get('/api/dashboard/active-listings', { headers });
      // الإشعارات
      const notifRes = await api.get('/api/dashboard/notifications', { headers });
      // recentActivities: يمكن ربطها مع notifications أو endpoint خاص لاحقاً
      // حساب trendValue للرحلات القادمة فقط (دون تغيير value)
      const previousTripsCount = statsRes.data.previousUpcomingTrips || 0; // إذا كانت متوفرة
      const currentTripsCount = tripsRes.data.length;
      const trendValue = currentTripsCount - previousTripsCount;
      setUser(userRes.data);
      setUpcomingTrips(tripsRes.data);
      setActiveListings(listingsRes.data);
      setNotifications(notifRes.data);
      setRecentActivities([]);
      setDashboardMetrics([
        { title: 'Active Listings', value: listingsRes.data.length, icon: 'Package', trend: 'up', trendValue: '+3', color: 'primary' },
        { title: 'Pending Requests', value: statsRes.data.pendingRequests, icon: 'MessageCircle', trend: 'up', trendValue: '+2', color: 'warning' },
        { title: 'Upcoming Trips', value: tripsRes.data.length, icon: 'Plane', trend: 'neutral', trendValue: `${trendValue > 0 ? '+' : ''}${trendValue}` , color: 'accent' },
        { title: 'Total Earnings', value: `$${statsRes.data.totalEarnings}`, icon: 'DollarSign', trend: 'up', trendValue: '+$320', color: 'success' }
      ]);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);


  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAll();
    setIsRefreshing(false);
  };

  const handleEditListing = (listingId) => {
    navigate(`/product-listing-creation?edit=${listingId}`);
  };

  // بعد Fulfill أو تعديل منتج، قم بتحديث البيانات
  const handleAfterEditOrFulfill = () => {
    fetchAll();
  };

  const handleViewRequests = (listingId) => {
    console.log('View requests for listing:', listingId);
  };

  const handleMarkFulfilled = async (listingId) => {
    if (!listingId) return;
    try {
      setFulfillingIds(prev => [...prev, listingId]);
      const token = localStorage.getItem('accessToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      // send product id as JSON body
      const res = await api.post('/api/products/mark-fulfilled', { product_id: listingId }, { headers });
      setActiveListings(prev => (prev || []).map(l => l?.id === listingId ? { ...l, status: 'fulfilled', isActive: false } : l));
      try { alert(res?.data?.msg || 'Marked as fulfilled'); } catch (e) {}
      handleAfterEditOrFulfill(); // تحديث البيانات بعد Fulfill
    } catch (err) {
      console.error('Failed to mark fulfilled', err);
      const serverMsg = err?.response?.data?.detail || err?.response?.data?.msg || err?.message;
      try { alert(serverMsg || 'Failed to mark listing as fulfilled'); } catch (e) {}
    } finally {
      setFulfillingIds(prev => (prev || []).filter(id => id !== listingId));
    }
  };

  const handleAcceptRequest = (requestId) => {
    console.log('Accept request:', requestId);
  };

  const handleDeclineRequest = (requestId) => {
    console.log('Decline request:', requestId);
  };

  const handleViewProfile = (buyerId) => {
    console.log('View buyer profile:', buyerId);
  };

  useEffect(() => {
    // Set page title
    document.title = 'Traveler Dashboard - Valikoo';
  }, []);

  return (
    <div className="min-h-screen bg-background">
  <RoleBasedNavigation userRole="traveler" user={user} />
      {/* Main Content */}
      <div className="pt-16 lg:pt-16 pb-20 lg:pb-8">
        <div className="container mx-auto px-4 py-6">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.fullName || 'Traveler'}!</h1>
              <p className="text-muted-foreground">Manage your listings and upcoming trips</p>
            </div>
            <Button
              variant="outline"
              iconName="RefreshCw"
              onClick={handleRefresh}
              loading={isRefreshing}
              className="hidden sm:flex"
            >
              Refresh
            </Button>
          </div>

          {/* Mobile Tab Navigation */}
          <div className="lg:hidden mb-6">
            <div className="flex space-x-1 bg-muted p-1 rounded-lg">
              {[
                { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
                { id: 'listings', label: 'Listings', icon: 'Package' },
                { id: 'trips', label: 'Trips', icon: 'Plane' },
                { id: 'requests', label: 'Requests', icon: 'MessageCircle' }
              ]?.map((tab) => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-md text-sm font-medium transition-smooth ${
                    activeTab === tab?.id
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon name={tab?.icon} size={16} />
                  <span className="hidden sm:inline">{tab?.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:grid lg:grid-cols-12 lg:gap-6">
            {/* Left Sidebar - Metrics & Quick Actions */}
            <div className="lg:col-span-3 space-y-6">
              <div className="grid grid-cols-1 gap-4">
                {dashboardMetrics?.map((metric, index) => (
                  <MetricsCard 
                    key={index} 
                    title={metric.title}
                    value={metric.value}
                    icon={metric.icon}
                    trend={metric.trend}
                    trendValue={metric.trendValue}
                    color={metric.color}
                  />
                ))}
              </div>

            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-6 space-y-6">
              {/* Active Listings */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Active Listings</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Plus"
                    onClick={() => navigate('/product-listing-creation')}
                  >
                    Add New
                  </Button>
                </div>
                <div className="space-y-4">
                  {activeListings?.map((listing) => (
                    <ActiveListingCard
                      key={listing?.id}
                      listing={listing}
                      onEdit={handleEditListing}
                      onViewRequests={handleViewRequests}
                      onMarkFulfilled={handleMarkFulfilled}
                      isFulfilling={fulfillingIds.includes(listing?.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Upcoming Trips */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Upcoming Trips</h2>
                <div className="grid grid-cols-1 gap-4">
                  {upcomingTrips?.slice(0, 2)?.map((trip) => (
                    <UpcomingTripCard key={`${trip?.id}-${trip?.departureDate || ''}-${trip?.returnDate || ''}`} trip={trip} />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar - Activity & Requests */}
            <div className="lg:col-span-3 space-y-6">
              <RecentActivityFeed activities={recentActivities?.slice(0, 5)} />
              
              <div>
                <h3 className="font-semibold text-foreground mb-4">Recent Requests</h3>
                <div className="space-y-4">
                  {/* يمكنك ربط الطلبات الحقيقية هنا لاحقاً إذا أضفت endpoint خاص بها */}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {dashboardMetrics?.map((metric, index) => (
                    <MetricsCard 
                      key={index} 
                      title={metric.title}
                      value={metric.value}
                      icon={metric.icon}
                      trend={metric.trend}
                      trendValue={metric.trendValue}
                      color={metric.color}
                    />
                  ))}
                </div>

                <RecentActivityFeed activities={recentActivities?.slice(0, 3)} />
              </div>
            )}

            {activeTab === 'listings' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Your Listings</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Plus"
                    onClick={() => navigate('/product-listing-creation')}
                  >
                    Add New
                  </Button>
                </div>
                {activeListings?.map((listing) => (
                  <ActiveListingCard
                    key={listing?.id}
                    listing={listing}
                    onEdit={handleEditListing}
                    onViewRequests={handleViewRequests}
                    onMarkFulfilled={handleMarkFulfilled}
                  />
                ))}
              </div>
            )}

            {activeTab === 'trips' && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Upcoming Trips</h2>
                {upcomingTrips?.map((trip) => (
                  <UpcomingTripCard key={`${trip?.id}-${trip?.departureDate || ''}-${trip?.returnDate || ''}`} trip={trip} />
                ))}
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Buyer Requests</h2>
                {/* يمكنك ربط الطلبات الحقيقية هنا لاحقاً إذا أضفت endpoint خاص بها */}
              </div>
            )}
          </div>

          {/* Pull to Refresh for Mobile */}
          <div className="lg:hidden mt-8">
            <Button
              variant="outline"
              iconName="RefreshCw"
              onClick={handleRefresh}
              loading={isRefreshing}
              fullWidth
            >
              Pull to Refresh
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelerDashboard;