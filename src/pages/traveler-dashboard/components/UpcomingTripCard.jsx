import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import api from '../../../api';

const UpcomingTripCard = ({ trip }) => {
  const [showModal, setShowModal] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [manageLoading, setManageLoading] = useState(false);
  const [availableListings, setAvailableListings] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const navigate = useNavigate();

  const openModal = async (e) => {
    e && e.stopPropagation && e.stopPropagation();
    // debugging: log trip id and request URL so we can correlate with backend 404
    try {
      console.debug('[UpcomingTripCard] openModal clicked, trip.id=', trip?.id);
      const tokenPresent = !!localStorage.getItem('accessToken');
      console.debug('[UpcomingTripCard] token present=', tokenPresent);
      console.debug('[UpcomingTripCard] requesting', `/api/trips/${trip?.id}`);
    } catch (err) {
      // ignore logging failures
    }
    setShowModal(true);
    setLoadingProducts(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await api.get(`/api/trips/${trip?.id}`, { headers });
      setProducts(Array.isArray(res.data?.products) ? res.data.products : []);
  // initialize selectedIds based on currently linked products
  try { setSelectedIds(new Set(Array.isArray(res.data?.product_ids) ? res.data.product_ids : [])); } catch (e) {}
    } catch (err) {
      console.error('[UpcomingTripCard] failed to load trip products', err);
      setError(err?.response?.data?.detail || err?.message || 'Failed to load products');
    } finally {
      setLoadingProducts(false);
    }
  };

  const openManage = async (e) => {
    e && e.stopPropagation && e.stopPropagation();
    setShowManageModal(true);
    setManageLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
  // fetch user's active listings to choose from, but exclude listings linked to other trips
  const query = trip?.id ? `?trip_id=${encodeURIComponent(trip.id)}` : '';
  const res = await api.get(`/api/dashboard/active-listings${query}`, { headers });
      const listings = Array.isArray(res.data) ? res.data : [];
      setAvailableListings(listings);
      // preselect those already linked
      const currentLinked = Array.isArray(products) ? products.map(p => p.id) : [];
      setSelectedIds(new Set(currentLinked));
    } catch (err) {
      console.error('[UpcomingTripCard] failed to fetch listings for manage modal', err);
      setAvailableListings([]);
    } finally {
      setManageLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const saveManage = async () => {
    setManageLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const before = new Set((products || []).map(p => p.id));
      const after = new Set(Array.from(selectedIds || []));
      const toAdd = Array.from(after).filter(x => !before.has(x));
      const toRemove = Array.from(before).filter(x => !after.has(x));
      if (toAdd.length === 0 && toRemove.length === 0) {
        setShowManageModal(false);
        setManageLoading(false);
        return;
      }
      await api.patch(`/api/trips/${trip?.id}`, { add: toAdd, remove: toRemove }, { headers });
      // refresh trip products
      const refreshed = await api.get(`/api/trips/${trip?.id}`, { headers });
      setProducts(Array.isArray(refreshed.data?.products) ? refreshed.data.products : []);
      setSelectedIds(new Set(Array.isArray(refreshed.data?.product_ids) ? refreshed.data.product_ids : []));
      setShowManageModal(false);
    } catch (err) {
      console.error('[UpcomingTripCard] failed to save manage changes', err);
      alert('Failed to update trip associations');
    } finally {
      setManageLoading(false);
    }
  };

  // دالة ذكية لتنسيق أي قيمة تاريخ
  const formatAnyDate = (date) => {
    if (!date) return '';
    // إذا كان رقم (timestamp)
    if (typeof date === 'number') {
      const d = new Date(date);
      if (!isNaN(d)) return d.toLocaleDateString('en-GB');
    }
    // إذا كان نص
    if (typeof date === 'string') {
      // جرب تحويله مباشرة
      let d = new Date(date);
      if (!isNaN(d)) return d.toLocaleDateString('en-GB');
      // جرب إذا كان فقط تاريخ بدون وقت
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        d = new Date(date + 'T00:00:00Z');
        if (!isNaN(d)) return d.toLocaleDateString('en-GB');
      }
    }
    // إذا كان Date
    if (date instanceof Date && !isNaN(date)) {
      return date.toLocaleDateString('en-GB');
    }
    return date;
  };

  const getDaysUntilTrip = (departureDate) => {
    const today = new Date();
    const departure = new Date(departureDate);
    const diffTime = departure - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntil = getDaysUntilTrip(trip?.departureDate);

  return (
    <>
    <div
      className="bg-card rounded-lg border border-border p-4 shadow-card cursor-pointer"
      onClick={openModal}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openModal(e); }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground">{trip?.route}</h3>
        <span className="text-sm text-muted-foreground">
          {daysUntil > 0 ? `${daysUntil} days` : 'Today'}
        </span>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="Plane" size={16} className="text-primary" />
            <span className="text-sm text-foreground">{trip?.departureAirport}</span>
          </div>
          <Icon name="ArrowRight" size={16} className="text-muted-foreground" />
          <div className="flex items-center space-x-2">
            <Icon name="MapPin" size={16} className="text-success" />
            <span className="text-sm text-foreground">{trip?.arrivalAirport}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{formatAnyDate(trip?.departureDate)}</span>
          <span>→</span>
          <span>{formatAnyDate(trip?.returnDate)}</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center space-x-1">
            <Icon name="Package" size={14} />
            <span className="text-sm text-muted-foreground">
              {trip?.associatedListings} listings
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="Users" size={14} />
            <span className="text-sm text-muted-foreground">
              {trip?.potentialBuyers} interested
            </span>
          </div>
        </div>
      </div>

  </div>

  {showModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-card rounded-xl shadow-2xl p-6 w-full max-w-2xl relative flex flex-col">
          <button
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground focus:outline-none"
            onClick={() => setShowModal(false)}
            aria-label="Close"
          >
            <Icon name="X" size={24} />
          </button>
          <h3 className="text-xl font-bold mb-4 text-center">Products for: {trip?.route}</h3>
          <div className="overflow-y-auto max-h-[60vh]">
            {loadingProducts ? (
              <p className="text-muted-foreground text-center">Loading products...</p>
            ) : error ? (
              <p className="text-red-500 text-center">{error}</p>
            ) : products.length === 0 ? (
              <p className="text-muted-foreground text-center">No products linked to this trip.</p>
            ) : (
              <ul className="space-y-3">
                {products.map((p) => (
                  <li key={p.id} className="p-3 border rounded-lg flex items-center justify-between gap-3 bg-muted/40">
                    <div className="flex items-center gap-3">
                      {p.image ? (
                        <img src={p.image} alt={p.title || ''} className="w-16 h-16 object-cover rounded" />
                      ) : (
                        <div className="w-16 h-16 bg-muted rounded flex items-center justify-center text-xs">No Image</div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-foreground">{p.title}</div>
                        <div className="text-xs text-muted-foreground">{p.price ? `$${p.price}` : ''}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="px-3 py-1 text-sm border rounded hover:bg-muted/40"
                        onClick={() => navigate(`/product/${p.id}`)}
                      >
                        View Product
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mt-4 flex justify-end">
            <button className="px-3 py-2 border rounded mr-2" onClick={openManage}>Manage Products</button>
            <button className="px-3 py-2 bg-primary text-white rounded" onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      </div>
  )}

    {showManageModal && (
      <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-card rounded-xl shadow-2xl p-6 w-full max-w-3xl relative flex flex-col">
          <button className="absolute top-3 right-3 text-muted-foreground hover:text-foreground" onClick={() => setShowManageModal(false)}>
            <Icon name="X" size={24} />
          </button>
          <h3 className="text-lg font-bold mb-4">Manage Products for {trip?.route}</h3>
          <div className="overflow-y-auto max-h-[60vh]">
            {manageLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : (
              <ul className="space-y-2">
                {availableListings.map(l => (
                  <li key={l.id} className="p-2 border rounded flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={selectedIds.has(l.id)} onChange={() => toggleSelect(l.id)} />
                      <div>
                        <div className="text-sm font-medium">{l.title}</div>
                        <div className="text-xs text-muted-foreground">{l.destination} • {l.price ? `$${l.price}` : ''}</div>
                      </div>
                    </div>
                    <div>
                      <button className="px-3 py-1 text-sm border rounded" onClick={() => navigate(`/product/${l.id}`)}>View</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button className="px-3 py-2 border rounded" onClick={() => setShowManageModal(false)}>Cancel</button>
            <button className="px-3 py-2 bg-primary text-white rounded" onClick={saveManage} disabled={manageLoading}>{manageLoading ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      </div>
    )}
  </>
  );
};

export default UpcomingTripCard;