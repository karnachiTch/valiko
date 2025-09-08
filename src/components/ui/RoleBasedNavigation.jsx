import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

import NotificationIndicator from './NotificationIndicator';
import NotificationCenter from '../../pages/admin-control-panel/components/NotificationCenter';
import api from '../../api';

const RoleBasedNavigation = ({ userRole = 'traveler', isCollapsed = false, user = null, unreadMessages = 0 }) => {
  const location = useLocation();
  const navigate = useNavigate();
  // determine effective role: prefer explicit user.role, then localStorage, then prop
  const effectiveRole = (user && user.role) || localStorage.getItem('userRole') || userRole;
  // derive a displayUser: prefer prop `user`, else try to read a stored `user` JSON from localStorage
  let storedUser = null;
  try {
    const raw = typeof window !== 'undefined' && localStorage.getItem('user');
    storedUser = raw ? JSON.parse(raw) : null;
  } catch (e) {
    storedUser = null;
  }
  const displayUser = user || storedUser;
  // Logout handler
  const handleLogout = () => {
    // Clear all local/session storage related to auth
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('socialLogin');
    localStorage.removeItem('accessToken');
    // If you store any other keys, clear them here
    sessionStorage.clear();
    // Optionally clear all localStorage (uncomment if you want to remove everything)
    // localStorage.clear();
  navigate('/');
    // Force reload to clear any cached state
    window.location.reload();
  };
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadNotifications = notifications.filter(n => n?.unread).length;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await api.get('/api/dashboard/notifications', { headers });
        setNotifications(res.data || []);
      } catch (err) {
        setNotifications([]);
      }
    };
    fetchNotifications();
  }, []);

  const travelerNavItems = [
    { label: 'Dashboard', path: '/traveler-dashboard', icon: 'LayoutDashboard' },
    { label: 'Create Listing', path: '/product-listing-creation', icon: 'Plus', onlyFor: 'traveler' },
    { label: 'Browse Products', path: '/product-search-and-browse', icon: 'Search' },
  { label: 'Messages', path: '/messaging-system', icon: 'MessageCircle' },
  ];

  const buyerNavItems = [
    { label: 'Dashboard', path: '/buyer-dashboard', icon: 'LayoutDashboard' },
    { label: 'Browse Products', path: '/product-search-and-browse', icon: 'Search' },
    { label: 'Saved Items', path: '/saved-items', icon: 'Heart' },
  { label: 'Messages', path: '/messaging-system', icon: 'MessageCircle' },
  ];

  let navigationItems = effectiveRole === 'traveler' ? travelerNavItems : buyerNavItems;
  // فلترة العناصر الخاصة بالمسافر فقط
  // إزالة Create Listing من أي قائمة ليست للمسافر
  navigationItems = navigationItems.filter(item => {
    // لا تظهر Create Listing إلا للمسافر فقط
    if ((effectiveRole !== 'traveler' && item.label === 'Create Listing') || (effectiveRole !== 'traveler' && item.path === '/product-listing-creation')) return false;
    // لا تظهر "Saved Items" للمسافر
    if (effectiveRole === 'traveler' && (item.label === 'Saved Items' || item.path === '/saved-items')) return false;
    if (item.onlyFor && item.onlyFor !== effectiveRole) return false;
    return true;
  });

  const isActivePath = (path) => location?.pathname === path;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const [showProfile, setShowProfile] = useState(false);
  return (
    <>
      {/* Desktop Navigation */}
      <header className="hidden lg:block fixed top-0 left-0 right-0 bg-card border-b border-border z-200">
        <div className="px-4 h-16">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="Globe" size={20} color="white" />
              </div>
              <span className="text-xl font-semibold text-foreground">
                Valikoo
              </span>
            </Link>

            {/* Navigation Items */}
            <nav className="flex items-center space-x-1">
              {navigationItems?.map((item) => (
                <Link
                  key={item?.path}
                  to={item?.path}
                  className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg transition-smooth ${
                    isActivePath(item?.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon name={item?.icon} size={18} />
                  <span className="font-medium">{item?.label}</span>
                  {(() => {
                    const badgeValue = item?.path === '/messaging-system' ? unreadMessages : item?.badge;
                    return badgeValue > 0 ? (
                      <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {badgeValue}
                      </span>
                    ) : null;
                  })()}
                </Link>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <NotificationIndicator
                  count={unreadNotifications}
                  onClick={() => setShowNotifications((v) => !v)}
                  className=""
                  size={20}
                />
                {showNotifications && (
                  <div className="absolute right-0 mt-2 min-w-[340px] z-50">
                    <NotificationCenter
                      notifications={notifications}
                      onMarkAsRead={() => {}}
                    />
                  </div>
                )}
              </div>
              <div className="group relative flex items-center">
                <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted transition-smooth" onClick={() => setShowProfile(!showProfile)} title="Profile">
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                    <Icon name="User" size={16} color="white" />
                  </div>
                </button>
                {showProfile && displayUser && (
                  <div className="absolute right-0 top-12 min-w-[220px] bg-card border border-border rounded-lg shadow-lg z-50 p-4">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center overflow-hidden">
                        {displayUser?.avatar ? (
                          <img
                            src={displayUser.avatar}
                            alt="Profile"
                            className="w-full h-full object-cover rounded-full"
                            onError={e => { e.target.onerror=null; e.target.src="/assets/images/no_image.png"; }}
                          />
                        ) : (
                          <Icon name="User" size={24} color="white" />
                        )}
                      </div>
                      <div className="text-lg font-bold">{displayUser.fullName}</div>
                      <div className="text-sm text-muted-foreground">{displayUser.email}</div>
                      <div className="text-xs text-accent">{displayUser.role}</div>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={() => {
                          setShowProfile(false);
                          // use effectiveRole (derived from prop/user/localStorage) to decide target
                          if (effectiveRole === 'traveler') {
                            navigate('/traveler-profile-management');
                          } else {
                            navigate('/buyer-profile-management');
                          }
                        }}
                        
                        className="w-full text-left px-4 py-2 text-sm hover:bg-muted rounded-lg mb-2"
                      >
                        <Icon name="User" size={16} className="inline mr-2" />Profile                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/10 rounded-lg"
                      >
                        <Icon name="LogOut" size={16} className="inline mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
    </div>
  </header>
      {/* Mobile Navigation */}
  <div className="lg:hidden">
        {/* Mobile Header */}
        <header className="fixed top-0 left-0 right-0 bg-card border-b border-border z-200">
          <div className="px-4 h-14">
            <div className="flex items-center justify-between h-full">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                  <Icon name="Globe" size={14} color="white" />
                </div>
                <span className="text-lg font-semibold text-foreground">
                  Valikoo
                </span>
              </Link>

              <div className="flex items-center space-x-2">
                <div className="relative">
                  <NotificationIndicator
                    count={unreadNotifications}
                    onClick={() => setShowNotifications((v) => !v)}
                    className=""
                    size={18}
                  />
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 min-w-[340px] z-50">
                      <NotificationCenter
                        notifications={notifications}
                        onMarkAsRead={() => {}}
                      />
                    </div>
                  )}
                </div>
                <button
                  className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center relative group"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <Icon name="LogOut" size={14} color="white" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-200">
          <div className="flex items-center justify-around h-18 px-2">
            {navigationItems?.map((item) => (
              <Link
                key={item?.path}
                to={item?.path}
                className={`relative flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-lg transition-smooth ${
                  isActivePath(item?.path)
                    ? 'text-primary' :'text-muted-foreground'
                }`}
              >
                <Icon name={item?.icon} size={20} />
                <span className="text-xs font-medium">{item?.label}</span>
                {item?.badge && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {item?.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </nav>
    </div>
  </>);
};

export default RoleBasedNavigation;