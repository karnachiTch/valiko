import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import RoleBasedNavigation from '../../components/ui/RoleBasedNavigation';
import MetricsCard from './components/MetricsCard';
import FeaturedProductsCarousel from './components/FeaturedProductsCarousel';
import SearchSection from './components/SearchSection';
import ProductGrid from './components/ProductGrid';
import SavedItemsSection from './components/SavedItemsSection';
import RecentRequestsPanel from './components/RecentRequestsPanel';
import CreateProductRequestForm from './components/CreateProductRequestForm';
import { FiShoppingBag, FiHeart, FiCheckCircle, FiDollarSign, FiClipboard } from 'react-icons/fi';

const iconMap = {
  ShoppingBag: <FiShoppingBag className="text-4xl" />,
  Heart: <FiHeart className="text-4xl" />,
  CheckCircle: <FiCheckCircle className="text-4xl" />,
  DollarSign: <FiDollarSign className="text-4xl" />,
  ClipboardList: <FiClipboard className="text-4xl" />,
};

const BuyerDashboard = () => {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('EN');
  const [user, setUser] = useState(null);
  const [metricsData, setMetricsData] = useState([]);

  // جلب بيانات المستخدم من /api/profile لتمرير avatar الحقيقي
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const api = await import('../../api').then(m => m.default);
        const token = localStorage.getItem('accessToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await api.get('/api/profile', { headers });
        setUser(res.data);
      } catch (err) {
        setUser(null);
      }
    };
    fetchProfile();
  }, []);

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

        // fetch buyer-created requests (type=buyer_request)
        let buyerRequestsCount = 0;
        try {
          const buyerRequestsRes = await api.get('/api/requests?type=buyer_request', { headers });
          if (Array.isArray(buyerRequestsRes.data)) {
            buyerRequestsCount = buyerRequestsRes.data.length;
          } else if (buyerRequestsRes.data?.requests) {
            buyerRequestsCount = buyerRequestsRes.data.requests.length;
          }
        } catch (e) {
          buyerRequestsCount = 0;
        }

        // fetch active traveler requests (type=traveler_request, status=pending)
        let activeTravelerRequestsCount = 0;
        try {
          const travelerRequestsRes = await api.get('/api/requests?type=traveler_request&status=pending', { headers });
          if (Array.isArray(travelerRequestsRes.data)) {
            activeTravelerRequestsCount = travelerRequestsRes.data.length;
          } else if (travelerRequestsRes.data?.requests) {
            activeTravelerRequestsCount = travelerRequestsRes.data.requests.length;
          }
        } catch (e) {
          activeTravelerRequestsCount = 0;
        }

        const mapped = [
          { title: 'Active Requests', value: activeTravelerRequestsCount, subtitle: 'Open traveler requests', icon: 'ShoppingBag', trend: 'up', trendValue: '', color: 'primary' },
          { title: 'Saved Products', value: (s.savedProducts !== undefined && s.savedProducts !== null) ? s.savedProducts : 0, subtitle: 'Items in wishlist', icon: 'Heart', trend: 'up', trendValue: '', color: 'accent' },
          { title: 'Completed Purchases', value: (s.completedPurchases !== undefined && s.completedPurchases !== null) ? s.completedPurchases : 0, subtitle: 'Successful transactions', icon: 'CheckCircle', trend: 'up', trendValue: '', color: 'success' },
          { title: 'Total Spent', value: s.totalSpent ? `$${s.totalSpent}` : '$0', subtitle: 'This year', icon: 'DollarSign', trend: 'up', trendValue: '', color: 'warning' },
          { title: 'My Orders', value: buyerRequestsCount, subtitle: 'Requests you created', icon: 'ClipboardList', trend: 'up', trendValue: '', color: 'info' },
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
            <div className="relative rounded-2xl overflow-hidden border border-border shadow-lg bg-gradient-to-br from-blue-100 via-white/60 to-blue-50 backdrop-blur-md py-10 px-8 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex flex-col items-start gap-2">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 drop-shadow-lg">Welcome back, {user?.fullName || 'Traveler'}!</h1>
              </div>
              <div className="flex flex-col items-center gap-2">
                <button
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 text-white font-bold shadow-lg hover:from-blue-600 hover:to-blue-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  onClick={() => setShowRequestModal(true)}
                  title="Create a new product request"
                >
                  <span>Create Product Request</span>
                </button>
              </div>
              <div className="flex flex-col items-end bg-white/70 rounded-xl px-4 py-2 shadow-md">
                <p className="text-sm text-gray-500">Today's Date</p>
                <p className="font-bold text-gray-900 text-lg">
                  {new Date()?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Metrics Cards */}
            <section className="w-full my-8">
              <div className="rounded-2xl bg-gradient-to-br from-blue-50 via-white/80 to-blue-100 shadow-xl border border-blue-100 p-8">
                <h2 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                  <FiShoppingBag className="text-blue-500 text-3xl animate-bounce" />
                Overview
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                  {metricsData?.map((metric, index) => (
                    <div key={index} className="flex flex-col items-center justify-center bg-white/80 rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all duration-200">
                      <div className={`mb-2 ${metric.color === 'primary' ? 'text-blue-500' : metric.color === 'accent' ? 'text-pink-500' : metric.color === 'success' ? 'text-green-500' : metric.color === 'warning' ? 'text-yellow-500' : 'text-indigo-500'} animate-fade-in`}>
                        {iconMap[metric.icon]}
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                      <div className="text-sm text-gray-500 font-medium mt-1">{metric.title}</div>
                      <div className="text-xs text-gray-400 mt-1">{metric.subtitle}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

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

            {/* Modal for Create Product Request */}
            {showRequestModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative mt-12">
                  <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowRequestModal(false)}
                    aria-label="Close"
                  >
                    {/* SVG X icon for better visibility */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <CreateProductRequestForm onRequestCreated={() => setShowRequestModal(false)} onClose={() => setShowRequestModal(false)} />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default BuyerDashboard;