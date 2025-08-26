import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import api from '../../../api';

const SavedItemsPage = () => {
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState(() => new Set());
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get('/api/saved-items');
        if (!mounted) return;
        // backend returns items with shape { id, product: {id,title,image,price}, savedAt }
        const list = res.data || [];
        // enrich product info by fetching product details where possible
        const enriched = await Promise.all(list.map(async (s) => {
          const productId = s.product?.id;
          let prod = s.product || {};
          if (productId) {
            try {
              const pRes = await api.get(`/api/products/${productId}`);
              prod = pRes?.data || prod;
            } catch (e) {
              // ignore product fetch errors, keep minimal info
            }
          }
            // normalize travelDate: backend may return a string or an object { startDate, endDate }
            const rawTravel = prod?.travelDate ?? prod?.travelDates ?? '';
            let travelDateStr = '';
            try {
              if (!rawTravel) travelDateStr = '';
              else if (typeof rawTravel === 'string') travelDateStr = rawTravel;
              else if (typeof rawTravel === 'object') {
                const sd = rawTravel.startDate || rawTravel.departure || rawTravel.departureDate || rawTravel.start;
                const ed = rawTravel.endDate || rawTravel.arrival || rawTravel.arrivalDate || rawTravel.end;
                travelDateStr = sd && ed ? `${sd} → ${ed}` : (sd || ed || '');
              } else {
                travelDateStr = '';
              }
            } catch (e) {
              travelDateStr = '';
            }

            return {
              id: s.id,
              productId: productId,
              name: prod?.title || s.product?.title || 'Unnamed product',
              price: prod?.price ?? s.product?.price ?? null,
              image: prod?.image || s.product?.image || '',
              savedDate: s.savedAt || s.createdAt,
              travelerName: prod?.user?.fullName || prod?.traveler || '',
              departure: prod?.departureAirport || prod?.departure || '',
              arrival: prod?.arrivalAirport || prod?.arrival || '',
              travelDate: travelDateStr,
              status: prod?.status || prod?.availability || 'available'
            };
        }));
        setSavedItems(enriched);
      } catch (e) {
        console.error('[SavedItemsSection] load error', e);
        setSavedItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false };
  }, []);

  const removeSavedItem = async (itemId) => {
    // itemId here is saved-item.id (backend saved item id) but API expects product_id
    const prev = savedItems;
    const item = savedItems.find(i => i.id === itemId);
    if (!item) return;
    const productId = item.productId;
    // optimistic UI
    setSavedItems(prevItems => prevItems.filter(i => i.id !== itemId));
    try {
      // backend expects product_id in body
      await api.delete('/api/saved-items', { data: { product_id: productId } });
    } catch (e) {
      console.error('[SavedItemsSection] remove failed', e);
      setSavedItems(prev);
    }
  };

  const removeSelected = async () => {
    const prev = savedItems;
    const toRemove = Array.from(selected);
    if (toRemove.length === 0) return;
    // optimistic update
    setSavedItems(prevItems => prevItems.filter(i => !toRemove.includes(i.id)));
    setSelected(new Set());
    try {
      for (const id of toRemove) {
        const item = prev.find(i => i.id === id);
        if (!item) continue;
        await api.delete('/api/saved-items', { data: { product_id: item.productId } });
      }
    } catch (e) {
      console.error('[SavedItemsSection] bulk remove failed', e);
      setSavedItems(prev);
    }
  };

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const goToProduct = (productId) => {
    if (!productId) return;
    navigate(`/product-detail-view/${productId}`);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
            <Icon name="CheckCircle" size={10} className="mr-1" />
            Available
          </span>
        );
      case 'limited':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
            <Icon name="AlertCircle" size={10} className="mr-1" />
            Limited
          </span>
        );
      case 'sold_out':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-error/10 text-error">
            <Icon name="XCircle" size={10} className="mr-1" />
            Sold Out
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Saved Items</h2>
          <p className="text-sm text-muted-foreground">{savedItems?.length} items saved</p>
        </div>
        <div className="flex items-center space-x-2">
          {editMode ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => { setEditMode(false); setSelected(new Set()); }}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={removeSelected} disabled={selected.size === 0}>
                Remove ({selected.size})
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
              <Icon name="Settings" size={14} className="mr-2" />
              Manage
            </Button>
          )}
        </div>
      </div>
      {savedItems?.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Heart" size={24} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No saved items yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Start saving products you're interested in to keep track of them
          </p>
          <Button variant="default">
            Browse Products
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {savedItems?.map((item) => (
            <div key={item?.id} className="flex items-center space-x-4 p-4 bg-background rounded-lg border border-border hover:shadow-card transition-smooth">
              {editMode && (
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={selected.has(item?.id)}
                  onChange={() => toggleSelect(item?.id)}
                />
              )}
              <Image
                src={item?.image}
                alt={item?.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-foreground mb-1">{item?.name}</h3>
                <p className="text-xs text-muted-foreground mb-1">{item?.travelDate}</p>
                <p className="text-xs text-muted-foreground">{item?.departure} → {item?.arrival}</p>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(item?.status)}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => goToProduct(item?.productId)}
                >
                  View
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeSavedItem(item?.id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedItemsPage;