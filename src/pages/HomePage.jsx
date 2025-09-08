import React, { useEffect, useState, useRef } from "react";
import { MdLocalShipping, MdAccountBalanceWallet, MdGroups, MdHeadsetMic } from "react-icons/md";
import LoginForm from "./login-screen/components/LoginForm";
import { useNavigate } from "react-router-dom";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import api from "../api";

// بيانات قسم المتسوقين (Shoppers)
const shopperStepsData = [
  {
    title: "Tell us about the item you are looking for",
    description: "With valikoo, you can get any item from around the world. To get started, create an order for a product you want and include details such as where a traveler can buy it and how much it costs.",
    imageUrl: "https://images.unsplash.com/photo-1526925539332-aa3b66e35444?q=80&w=2565&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Wait for travelers to make delivery offers",
    description: "Once you publish your order, we'll share it with our entire traveler community. Then, travelers heading to your city will bid to deliver it by making an offer.",
    imageUrl: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Agree on a monetary reward for your traveler",
    description: "valikoo auto-calculates all applicable taxes and fees, including the monetary reward you agree to pay your traveler for delivering your item. If your traveler doesn't deliver your order for any reason, you will receive a full refund.",
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=2680&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Meet with your traveler and receive your item",
    description: "Coordinate a time and public place to meet your traveler. When you receive your item, make sure to confirm delivery so that your traveler gets paid.",
    imageUrl: "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

// بيانات قسم المسافرين (Travelers)
const travelerStepsData = [
  {
    title: "Find an order you can deliver and make an offer",
    description: "Search for orders based on where are traveling to next. Make an offer and set your traveler reward—the amount of money your shopper will pay you for delivering their item.",
    imageUrl: "https://images.pexels.com/photos/21014/pexels-photo.jpg?auto=compress&w=600&h=400&fit=crop",
  },
  {
    title: "Confirm order details with your shopper",
    description: "Use valikoo's messenger to confirm order details with your shopper like the size and color of the item. You can also ask if they have other orders they'd like delivered.",
    imageUrl: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&w=600&h=400&fit=crop",
  },
  {
    title: "Buy the item with your own money",
    description: "This way, you know exactly what you are bringing. Upon delivery, you will be reimbursed for the price of the item and paid your reward.",
    imageUrl: "https://images.unsplash.com/photo-1523381294911-8d3cead13475?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Deliver your shopper's order and get paid",
    description: "Coordinate a time and public place to meet your shopper. When your shopper confirms that they received their order, we'll transfer payment to your account on file.",
    imageUrl: "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

// المكون الرئيسي HowItWorksSection
const HowItWorksSection = () => {
  const [activeTab, setActiveTab] = useState('shoppers');

  const tabBaseStyles = "px-6 py-3 text-lg font-semibold rounded-t-lg transition-colors duration-300 focus:outline-none";
  const activeTabStyles = "text-blue-600 border-b-4 border-blue-600 bg-blue-50";
  const inactiveTabStyles = "text-gray-500 hover:text-blue-600 hover:bg-gray-100";

  return (
    <section className="bg-gray-50 px-8 py-12">
      <div className="max-w-6xl mx-auto">
        <h3 className="text-center text-6xl sm:text-6xl font-extrabold mb-8 text-gray-800">
          How Valikoo Works
        </h3>
        
        {/* أزرار التبويب (Tabs) */}
        <div className="flex justify-center border-b-2 border-gray-200">
          <button
            onClick={() => setActiveTab('shoppers')}
            className={`${tabBaseStyles} ${activeTab === 'shoppers' ? activeTabStyles : inactiveTabStyles}`}
          >
            For Shoppers
          </button>
          <button
            onClick={() => setActiveTab('travelers')}
            className={`${tabBaseStyles} ${activeTab === 'travelers' ? activeTabStyles : inactiveTabStyles}`}
          >
            For Travelers
          </button>
        </div>
        {/* عرض المحتوى بناءً على التبويب النشط */}
        <div>
          {activeTab === 'shoppers' && <HowItWorksContent steps={shopperStepsData} />}
          {activeTab === 'travelers' && <HowItWorksContent steps={travelerStepsData} />}
        </div>
      </div>
    </section>
  );
};

// مكون لعرض خطوات العمل
const HowItWorksContent = ({ steps }) => (
  <div className="space-y-16 mt-12 sm:mt-16 animate-fade-in">
    {/* نص Valikoo التوضيحي أعلى خطوات المتسوقين فقط */}
    {steps === shopperStepsData && (
      <div className="mb-8 text-center text-gray-700 text-lg max-w-3xl mx-auto">
        Valikoo is the go-to way to shop for products that aren't available in your country or are too expensive to buy locally. You can order just about anything on Valikoo, from baby clothes and kids toys to tech gadgets and nutritional supplements.
      </div>
    )}
    {/* نص Valikoo التوضيحي أعلى خطوات المسافرين فقط */}
    {steps === travelerStepsData && (
      <div className="mb-8 text-center text-gray-700 text-lg max-w-3xl mx-auto">
        Subsidize your trip every time your travel with Valikoo. Our travelers usually deliver a handful of items and earn upwards of $300 per trip. Not only will you make money traveling, you'll meet amazing locals along the way
      </div>
    )}
    {steps.map((step, index) => (
      <div
        key={index}
        className={`flex flex-col-reverse gap-8 md:flex-row md:items-center md:gap-12 ${
          index % 2 !== 0 ? 'md:flex-row-reverse' : ''
        }`}
      >
        {/* Text Content */}
        <div className="md:w-1/2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
            <span className="text-gray-300 text-7xl lg:text-8xl font-black">
              {index + 1}
            </span>
            <div className="pl-4">
              <h4 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                {step.title}
              </h4>
            </div>
          </div>
          <p className="text-gray-600 sm:text-lg leading-relaxed max-w-md mx-auto md:mx-0">
            {step.description}
          </p>
        </div>
        {/* Image Content */}
        <div className="md:w-1/2">
          <img
            src={step.imageUrl}
            alt={step.title}
            className="rounded-2xl object-cover w-full h-64 md:h-80 shadow-2xl transform hover:scale-105 transition-transform duration-500 ease-in-out"
            onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400/d3e3f5/333?text=Image+Not+Found'; }}
          />
        </div>
      </div>
    ))}
  </div>
);

export default function HomePage() {
  // جلب جميع المنتجات والطلبات عند التحميل الأول
  const [products, setProducts] = useState([]);
  const [buyerRequests, setBuyerRequests] = useState([]);
  const [displayedBuyerRequests, setDisplayedBuyerRequests] = useState([]);
  const [buyerPageIndex, setBuyerPageIndex] = useState(1);
  const [buyerItemsPerPage] = useState(3);
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [processedPageIndex, setProcessedPageIndex] = useState(1);
  const [processedItemsPerPage] = useState(3);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    // جلب المنتجات
    api.get('/api/products')
      .then((res) => {
        const data = res.data;
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (data && Array.isArray(data.value)) {
          setProducts(data.value);
        } else if (data && Array.isArray(data.products)) {
          setProducts(data.products);
        } else if (data && Array.isArray(data.results)) {
          setProducts(data.results);
        } else {
          setProducts([]);
        }
      })
      .catch(() => setProducts([]));
    // جلب طلبيات المشترين فقط
    api.get('/api/requests?type=buyer_request')
      .then((res) => {
        const data = res.data;
        if (Array.isArray(data)) {
          setBuyerRequests(data);
        } else if (data && Array.isArray(data.requests)) {
          setBuyerRequests(data.requests);
        } else {
          setBuyerRequests([]);
        }
      })
      .catch(() => setBuyerRequests([]));
  }, []);

  // initialize displayedBuyerRequests when buyerRequests are loaded
  useEffect(() => {
    setBuyerPageIndex(1);
    if (Array.isArray(buyerRequests) && buyerRequests.length > 0) {
      const shuffled = [...buyerRequests].sort(() => 0.5 - Math.random());
      setDisplayedBuyerRequests(shuffled.slice(0, buyerItemsPerPage));
    } else {
      setDisplayedBuyerRequests([]);
    }
  }, [buyerRequests]);

  // تغيير الطلبيات تلقائياً كل 10 ثواني
  useEffect(() => {
    if (!Array.isArray(buyerRequests) || buyerRequests.length === 0) return;
    const interval = setInterval(() => {
      const shuffled = [...buyerRequests].sort(() => 0.5 - Math.random());
      setDisplayedBuyerRequests(shuffled.slice(0, buyerItemsPerPage));
    }, 10000);
    return () => clearInterval(interval);
  }, [buyerRequests]);

  // initialize displayedProducts for processed (traveler) products
  useEffect(() => {
    setProcessedPageIndex(1);
    const travelerProducts = Array.isArray(products) ? products.filter(p => p.type !== 'buyer_request') : [];
    if (travelerProducts.length > 0) {
      const shuffled = [...travelerProducts].sort(() => 0.5 - Math.random());
      setDisplayedProducts(shuffled.slice(0, processedItemsPerPage));
    } else {
      setDisplayedProducts([]);
    }
  }, [products]);

  // تغيير المنتجات تلقائياً كل 10 ثواني (processed orders)
  useEffect(() => {
    const travelerProducts = Array.isArray(products) ? products.filter(p => p.type !== 'buyer_request') : [];
    if (travelerProducts.length === 0) return;
    const interval = setInterval(() => {
      const shuffled = [...travelerProducts].sort(() => 0.5 - Math.random());
      setDisplayedProducts(shuffled.slice(0, processedItemsPerPage));
    }, 10000);
    return () => clearInterval(interval);
  }, [products]);

  // load more function (appends next page)
  // load more function (appends next page) - only used for mobile scroll, keep logic but use processedPageIndex
  const loadMore = () => {
    if (isLoadingMore) return;
    if (!Array.isArray(products)) return;
    const travelerProducts = products.filter(p => p.type !== 'buyer_request');
    if (displayedProducts.length >= travelerProducts.length) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      const nextPage = processedPageIndex + 1;
      const nextSlice = travelerProducts.slice(0, nextPage * processedItemsPerPage);
      setDisplayedProducts(nextSlice);
      setProcessedPageIndex(nextPage);
      setIsLoadingMore(false);
    }, 120);
  };

  // attach scroll listener to horizontal container (mobile-only)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      if (typeof window === 'undefined') return;
      if (window.innerWidth >= 768) return; // only on small screens
      // if near end (within 100px) load more
      if (el.scrollWidth - el.scrollLeft - el.clientWidth < 100) {
        loadMore();
      }
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [containerRef.current, displayedProducts, products, processedPageIndex]);

  return (
    <div className="font-sans">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 shadow-sm font-bold fixed top-0 left-0 w-full bg-white z-50">
        <h1 className="text-2xl font-bold">Valikoo</h1>
        <nav className="flex space-x-6 text-xl">
          <a href="#" className="hover:text-[#FF914D]">Order</a>
          <a href="#" className="hover:text-[#FF914D]">Travel</a>
        </nav>
        <button
          onClick={() => setShowLogin(true)}
          className="bg-[#FF914D] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#FF7A33]">
          Sign in
        </button>
      {/* Login Modal Overlay */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm animate-fade-in-fast">
          <div className="relative w-full max-w-md mx-auto animate-modal-pop">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none z-10"
              onClick={() => setShowLogin(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <LoginForm />
          </div>
        </div>
      )}

      </header>

      {/* Hero */}
      <section className="flex flex-col md:flex-row items-center justify-between px-8 py-20 bg-gray-50">
        <div className="max-w-lg">
          <h2 className="text-3xl md:text-6xl font-bold mb-4">
            From clicks to trips, everywhere awaits.
          </h2>
          <p className="text-gray-600 mb-6">
            Valikoo connects shoppers and travelers to help each other across the world.
          </p>
          <div className="flex gap-4">
            <button className="bg-blue-600 text-white px-5 py-2 rounded-lg">
              Order with Valikoo
            </button>
            <button className="border border-blue-600 text-blue-600 px-5 py-2 rounded-lg">
              Travel with Valikoo
            </button>
          </div>
        </div>
        <img
          src="/assets/images/Valikoo1.svg"
          alt="Valikoo Hero"
          width={700}
          height={250}
          className="mt-16 md:mt-0 rounded-lg shadow-md object-cover hidden md:block"
        />
      </section>


      {/* Recent Orders - Buyer Requests Only (rotating cards) */}
      <section className="px-8 py-12">
        <h3 className="text-center text-5xl font-bold mb-8">Recent Orders</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayedBuyerRequests.length > 0 ? displayedBuyerRequests.map((req, i) => {
            const id = req._id || req.id || i;
            return (
              <div key={id} className="bg-yellow-50 border border-yellow-200 rounded-xl shadow-lg p-6 flex flex-col gap-4 animate-fade-in">
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={typeof req.image === 'string' && req.image.match(/^([A-Za-z0-9+/=]+)$/) && req.image.length > 100 ? `data:image/jpeg;base64,${req.image}` : req.image || '/assets/images/no_image.png'}
                    alt={req.product_name || 'Product'}
                    className="w-20 h-20 object-cover rounded-xl border-2 border-yellow-300 shadow"
                    onError={e => { e.target.onerror=null; e.target.src='/assets/images/no_image.png'; }}
                  />
                  <div>
                    <div className="font-bold text-lg text-yellow-800">{req.product_name}</div>
                    <div className="text-sm text-gray-500">{req.category}</div>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-700 font-semibold">Description:</span>
                  <span className="text-gray-600">{req.description}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">Quantity:</span>
                  <span className="text-yellow-700 font-bold">{req.quantity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">Request Type:</span>
                  <span className="text-yellow-600 font-bold">Buyer</span>
                </div>
              </div>
            );
          }) : (
            <div className="text-center text-muted-foreground col-span-3">No buyer requests found.</div>
          )}
        </div>
      </section>

      {/* Processed Orders - Traveler Products Only */}
      <section className="px-8 py-12">
        <h3 className="text-center text-5xl font-bold mb-8">Processed Orders</h3>
        <div
          ref={containerRef}
          className="px-4 pb-4 md:pb-0 relative scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          style={{
            WebkitOverflowScrolling: 'touch',
            display: window.innerWidth < 768 ? 'block' : 'grid',
            gridTemplateColumns: window.innerWidth >= 768 ? 'repeat(3, 1fr)' : 'unset',
            gap: '1rem',
          }}
        >
          {displayedProducts?.length > 0 ? (
            displayedProducts.filter(order => order.type !== 'buyer_request').map((order, i) => {
              const id = order.id || order._id || i;
              return (
                <div
                  key={id}
                  onClick={() => {
                    if (typeof window !== 'undefined' && window.innerWidth < 768) {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      setTimeout(() => navigate(`/product-detail-view/${id}`), 300);
                      return;
                    }
                    navigate(`/product-detail-view/${id}`);
                  }}
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-transform duration-300 transform hover:scale-105 overflow-hidden cursor-pointer w-full min-w-[240px] max-w-xs md:max-w-sm md:mx-auto mx-auto mb-6 border border-gray-100 relative group"
                >
                  {/* شارة حالة المنتج */}
                  <span className="absolute top-3 left-3 bg-gradient-to-r from-blue-500 via-sky-400 to-blue-300 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
                    {order.status === 'fulfilled' ? 'Fulfilled' : order.status === 'available' ? 'Available' : 'Active'}
                  </span>
                  {/* صورة المنتج */}
                  <div className="flex justify-center items-center bg-gradient-to-tr from-gray-100 via-blue-50 to-gray-200 p-4">
                    <img
                      loading="lazy"
                      src={(() => {
                        const img = order.image || (order.images && order.images[0]);
                        if (!img) return '/assets/images/no_image.png';
                        if (typeof img === 'string') return img;
                        if (img.url) return img.url;
                        if (img.file && img.file.url) return img.file.url;
                        return '/assets/images/no_image.png';
                      })()}
                      alt={order.title || order.name || "Order"}
                      onError={(e) => { e.currentTarget.src = '/assets/images/no_image.png'; }}
                      className="w-32 h-32 object-cover rounded-2xl border-4 border-blue-200 group-hover:border-blue-400 transition-all duration-300 shadow-md"
                    />
                  </div>
                  {/* بيانات المسافر والمشتري */}
                  <div className="flex justify-around items-center py-4 gap-2 bg-gradient-to-r from-white via-blue-50 to-white">
                    {/* المسافر */}
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full border-4 border-sky-300 bg-white flex items-center justify-center shadow group-hover:border-blue-500 transition-all duration-300">
                        <img
                          loading="lazy"
                          src={order.travelerAvatar || order.traveler?.avatar || '/assets/images/no_image.png'}
                          alt={order.travelerName || order.traveler?.name || "Traveler"}
                          onError={(e) => { e.currentTarget.src = '/assets/images/no_image.png'; }}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                      </div>
                      <span className="mt-2 px-3 py-1 text-white text-xs rounded-full bg-gradient-to-r from-blue-400 to-blue-600 shadow">
                        earned ${order.travelerEarnings || order.traveler?.earnings || 0}
                      </span>
                      <p className="mt-2 font-semibold text-blue-700 text-sm">
                        {order.travelerName || order.traveler?.fullName || order.traveler?.name || order.traveler?.email || "Traveler"}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {order.traveler?.location || order.travelerLocation || order.traveler_user?.location || order.traveler?.profileLocation || "No location"}
                      </p>
                    </div>
                    {/* أيقونة الطائرة */}
                    <PaperAirplaneIcon className="h-7 w-7 text-blue-400 group-hover:text-blue-600 transition-transform duration-300 rotate-45" />
                    {/* المشتري */}
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full border-4 border-green-300 bg-white flex items-center justify-center shadow group-hover:border-green-500 transition-all duration-300">
                        <img
                          loading="lazy"
                          src={order.buyerAvatar || order.buyer?.avatar || '/assets/images/no_image.png'}
                          alt={order.buyerName || order.buyer?.fullName || order.buyer?.name || order.buyer?.email || "Buyer"}
                          onError={(e) => { e.currentTarget.src = '/assets/images/no_image.png'; }}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                      </div>
                      <span className="mt-2 px-3 py-1 text-white text-xs rounded-full bg-gradient-to-r from-green-400 to-green-600 shadow">
                        saved ${order.buyerSavings || order.buyer?.savings || 0}
                      </span>
                      <p className="mt-2 font-semibold text-green-700 text-sm">
                        {order.buyerName || order.buyer?.fullName || order.buyer?.name || order.buyer?.email || "Buyer"}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {order.buyer?.location || order.buyerLocation || "No location"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-muted-foreground col-span-3">No completed orders found.</div>
          )}
          {/* Scroll Indicator (mobile only) */}
          <div className="md:hidden w-full absolute left-0 -bottom-2 flex justify-center pointer-events-none">
            <div className="h-2 w-24 bg-gray-300 rounded-full opacity-70 animate-pulse" />
          </div>
        </div>
        {/* Mobile loading indicator */}
        {typeof window !== 'undefined' && window.innerWidth < 768 && isLoadingMore && (
          <div className="w-full flex justify-center mt-2">
            <div className="px-3 py-1 text-sm text-muted-foreground bg-gray-100 rounded">Loading more...</div>
          </div>
        )}
      </section>

  
  <HowItWorksSection />

      {/* Users Love Valikoo */}
      {/*
      <section className="px-8 py-12">
        <h3 className="text-center text-2xl font-bold mb-8">
          Our users love Valikoo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border rounded-lg shadow-sm p-4">
              <img
                src="https://via.placeholder.com/250x180"
                alt="Story"
                className="rounded mb-4"
              />
              <p className="text-sm">User story {i}</p>
            </div>
          ))}
        </div>
      </section>
      */}



      {/* Shope Banner Section - Full Image Background */}
      <section
        className="relative w-full flex items-center min-h-[300px] md:min-h-[340px]"
        style={{
          backgroundImage: "url('/assets/images/shope.svg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-[#d3e3f5] bg-opacity-60" />
        <div className="relative z-10 flex flex-col items-start justify-center w-full max-w-7xl px-8 py-16 md:py-20 mx-auto">
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-4xl font-extrabold text-[#1e293b] mb-4 drop-shadow-lg">
              Introducing Valikoo Shope
            </h2>
            <p className="text-[#334155] text-lg md:text-xl mb-6 max-w-xl drop-shadow">
              Our new shopping experience lets you discover and order unique products from around the world, delivered by trusted travelers. Available globally, safe and easy.
            </p>
            <button className="bg-orange-400 hover:bg-orange-600 text-white text-lg font-medium px-8 py-3 rounded transition shadow">
              Learn more
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      
      <section className="bg-gray-50 px-8 py-12">
        <h3 className="text-center text-5xl font-bold mb-8">
          Nous sommes fiers de la qualité de nos services
        </h3>
        <p className="text-gray-600 mb-6  text-2xl text-center">
            C'est un moyen sûr, facile et amusant de gagner de l'argent en voyageant dans le monde entier.
          </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          
          {/* Guaranteed delivery */}
          <div className="p-6 bg-white rounded-lg shadow flex flex-col items-center">
            <div className="w-28 h-28 flex items-center justify-center rounded-full bg-gradient-to-tr from-blue-400 via-sky-300 to-blue-100 mb-4">
              {/* أيقونة توصيل مضمون */}
              <MdLocalShipping className="text-blue-500" style={{ fontSize: 64 }} />
            </div>
            <p className="font-semibold text-lg mb-2">Guaranteed delivery</p>
            <p className="text-gray-500 text-sm">If a traveler cancels your order or delivers an item in bad condition, we will issue a full refund and aim to match you with a new traveler.</p>
          </div>
          
          {/* No Hidden Fees */}
          <div className="p-6 bg-white rounded-lg shadow flex flex-col items-center">
            <div className="w-28 h-28 flex items-center justify-center rounded-full bg-gradient-to-tr from-pink-400 via-fuchsia-300 to-pink-100 mb-4">
              {/* أيقونة محفظة/رسوم */}
              <MdAccountBalanceWallet className="text-pink-500" style={{ fontSize: 64 }} />
            </div>
            <p className="font-semibold text-lg mb-2">No Hidden Fees</p>
            <p className="text-gray-500 text-sm">We calculate all applicable taxes and fees before you publish your order, so you know exactly how much you are paying.</p>
          </div>
          {/* Community of Verified Shoppers and Travelers */}
          <div className="p-6 bg-white rounded-lg shadow flex flex-col items-center">
            <div className="w-28 h-28 flex items-center justify-center rounded-full bg-gradient-to-tr from-green-400 via-emerald-300 to-green-100 mb-4">
              {/* أيقونة مجتمع */}
              <MdGroups className="text-green-500" style={{ fontSize: 64 }} />
            </div>
            <p className="font-semibold text-lg mb-2">Community of Verified Shoppers and Travelers</p>
            <p className="text-gray-500 text-sm">Trust is our top priority, and we work hard to ensure that our community treats all members with the utmost respect.</p>
          </div>
          {/* 24/7 Customer Care */}
          <div className="p-6 bg-white rounded-lg shadow flex flex-col items-center col-span-1 md:col-span-3 mx-auto" style={{maxWidth:'400px'}}>
            <div className="w-28 h-28 flex items-center justify-center rounded-full bg-gradient-to-tr from-purple-400 via-indigo-300 to-purple-100 mb-4">
              {/* أيقونة دعم العملاء */}
              <MdHeadsetMic className="text-purple-500" style={{ fontSize: 64 }} />
            </div>
            <p className="font-semibold text-lg mb-2">24/7 Customer Care</p>
            <p className="text-gray-500 text-sm text-center">Our dedicated team is on hand to resolve any issue that arises throughout the order and delivery process.</p>
          </div>
        </div>
      </section>

      {/* Join Community Banner */}
      <section
        className="relative w-full flex items-center justify-center min-h-[300px] md:min-h-[340px]"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1500&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="relative z-10 flex flex-col items-center justify-center w-full py-16">
          <h2 className="text-white text-3xl md:text-4xl font-extrabold mb-8 text-center drop-shadow-lg">
            Join our global community
          </h2>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button
              className="bg-sky-500 hover:bg-sky-600 text-white text-lg font-medium px-8 py-3 rounded transition mb-2 md:mb-0"
              onClick={() => navigate('/registration-screen')}
            >
              Shop overseas products
            </button>
            <button
              className="bg-sky-500 hover:bg-sky-600 text-white text-lg font-medium px-8 py-3 rounded transition"
              onClick={() => navigate('/registration-screen')}
            >
              Make money traveling
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <h4 className="font-bold text-lg mb-2">Valikoo</h4>
            <p className="text-sm text-gray-400">
              Join our global community and start shopping or traveling today.
            </p>
          </div>
          <div className="flex space-x-6 mt-6 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white">About</a>
            <a href="#" className="text-gray-400 hover:text-white">Help</a>
            <a href="#" className="text-gray-400 hover:text-white">Privacy</a>
          </div>
        </div>
        <p className="text-center text-xs text-gray-500 mt-8">
          © 2025 Valikoo. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
