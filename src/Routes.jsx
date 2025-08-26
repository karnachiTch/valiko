import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import TravelerDashboard from './pages/traveler-dashboard';
import BuyerDashboard from './pages/buyer-dashboard';
import ProductSearchAndBrowse from './pages/product-search-and-browse';
import LoginScreen from './pages/login-screen';
import RegistrationScreen from './pages/registration-screen';
import ProductListingCreation from './pages/product-listing-creation';
import ProductDetailView from './pages/product-detail-view';
import MessagingSystem from './pages/messaging-system';
import SavedItemsPage from './pages/buyer-dashboard/components/SavedItemsSection';
import UserProfileManagement from './pages/user-profile-management';
import BuyerProfileManagement from './pages/buyer-profile-management';
import TravelerProfileManagement from './pages/traveler-profile-management';
import AdminControlPanel from './pages/admin-control-panel';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from './hooks/useAuth';

// Simple auth guard for dashboards
function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();
  const { loading, isAuthenticated, user } = useAuth();
  const userRole = (user && user.role) || localStorage.getItem('userRole');

  // while validating token, render a small loader to avoid transient redirects
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-sm text-muted-foreground">Checking authentication…</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login-screen" state={{ from: location }} replace />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/login-screen" replace />;
  }

  return children;
}
const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<LoginScreen />} />
        <Route path="/login-screen" element={<LoginScreen />} />
        <Route path="/registration-screen" element={<RegistrationScreen />} />
        <Route path="/traveler-dashboard" element={
          <ProtectedRoute allowedRoles={['traveler']}>
            <TravelerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/buyer-dashboard" element={
          <ProtectedRoute allowedRoles={['buyer']}>
            <BuyerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/product-search-and-browse" element={
          <ProtectedRoute>
            <ProductSearchAndBrowse />
          </ProtectedRoute>
        } />
        <Route path="/product-listing-creation" element={
          <ProtectedRoute allowedRoles={['traveler']}>
            <ProductListingCreation />
          </ProtectedRoute>
        } />
  <Route path="/product-detail-view/:id" element={
    <ProtectedRoute>
      <ProductDetailView />
    </ProtectedRoute>
  } />
        <Route path="/messaging-system" element={<MessagingSystem />} />
        <Route path="/saved-items" element={
          <ProtectedRoute allowedRoles={['buyer']}>
            <SavedItemsPage />
          </ProtectedRoute>
        } />
        <Route path="/user-profile-management" element={<UserProfileManagement />} />
        <Route path="/buyer-profile-management" element={
          <ProtectedRoute allowedRoles={['buyer']}>
            <BuyerProfileManagement />
          </ProtectedRoute>
        } />
        <Route path="/traveler-profile-management" element={
          <ProtectedRoute allowedRoles={['traveler']}>
            <TravelerProfileManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin-control-panel" element={<AdminControlPanel />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;