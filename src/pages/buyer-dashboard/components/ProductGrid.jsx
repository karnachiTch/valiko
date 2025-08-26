import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import api from '../../../api';

const ProductGrid = () => {
  const [savedProducts, setSavedProducts] = useState(new Set());
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchProducts = async () => {
      try {
        const res = await api.get('/api/products');
        if (!mounted) return;
        const items = Array.isArray(res.data) ? res.data : (res.data?.products || []);
        console.log('[ProductGrid] Fetched products:', res.data);
        setProducts(items);
      } catch (e) {
        console.error('[ProductGrid] fetch error', e);
        setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchProducts();
    return () => { mounted = false; };
  }, []);

  const toggleSave = (productId) => {
    console.log('Toggling save for product ID:', productId);
    setSavedProducts(prev => {
      const newSaved = new Set(prev);
      if (newSaved?.has(productId)) {
        newSaved?.delete(productId);
      } else {
        newSaved?.add(productId);
      }
      return newSaved;
    });
  };

  const handleRequest = async (productId) => {
    console.log('Requesting product ID:', productId);
    try {
      const token = localStorage.getItem('accessToken');
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
      const response = await fetch('/api/products/request', {
        method: 'POST',
        headers,
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        throw new Error('Failed to request product');
      }

      const data = await response.json();
      alert(data.message || 'Product request sent successfully!');
    } catch (e) {
      console.error('Failed to request product:', e);
      alert(e.message || 'An error occurred while requesting the product.');
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Available Products</h2>
          <p className="text-sm text-muted-foreground">{products?.length} products found</p>
        </div>
        <div className="flex items-center space-x-2">
          <select className="px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground">
            <option>Sort by: Newest</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Rating</option>
            <option>Travel Date</option>
          </select>
        </div>
      </div>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
        {products?.map((product) => {
      // normalize travelDate for safe rendering (backend may send string or object)
      let displayTravel = '';
      try {
        const raw = product?.travelDate ?? product?.travelDates ?? '';
        if (!raw) displayTravel = '';
        else if (typeof raw === 'string') displayTravel = raw;
        else if (typeof raw === 'object') {
          const sd = raw.startDate || raw.departure || raw.departureDate;
          const ed = raw.endDate || raw.arrival || raw.arrivalDate;
          displayTravel = sd && ed ? `${sd} → ${ed}` : (sd || ed || '');
        }
      } catch (e) {
        displayTravel = '';
      }
      console.log('[ProductGrid] Travel data for product:', product?.id, product?.travelDate, product?.departure, product?.arrival);
      return (
      <div key={product?.id} className="bg-background rounded-lg border border-border overflow-hidden hover:shadow-card transition-smooth md:min-h-[720px]">
            <div className="relative">
              <Image
                src={product?.image}
                alt={product?.name}
        className="w-full h-64 md:h-80 object-cover"
              />
              <button
                onClick={() => toggleSave(product?.id)}
                className={`absolute top-3 right-3 p-2 rounded-full transition-smooth ${
                  savedProducts?.has(product?.id)
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-background/80 text-foreground hover:bg-background'
                }`}
              >
                <Icon name="Heart" size={16} />
              </button>
              <div className="absolute bottom-3 left-3 bg-background/90 px-2 py-1 rounded-md">
                <span className="text-xs font-medium text-foreground">{product?.category}</span>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-foreground text-lg flex-1 mr-2">{product?.name}</h3>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{product?.price}</p>
                  <p className="text-xs text-muted-foreground line-through">{product?.originalPrice}</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-3">{product?.description}</p>

              <div className="flex items-center space-x-2 mb-3">
                <Image
                  src={product?.travelerAvatar}
                  alt={product?.travelerName}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm text-foreground">{product?.travelerName}</span>
                <div className="flex items-center space-x-1">
                  <Icon name="Star" size={12} className="text-accent fill-current" />
                  <span className="text-xs text-muted-foreground">{product?.rating} ({product?.reviews})</span>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Icon name="Plane" size={12} />
                  <span>{product?.departure} → {product?.arrival}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Icon name="Calendar" size={12} />
                  <span>{displayTravel}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Icon name="Package" size={12} />
                  <span>{product?.quantity}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => toggleSave(product?.id)}
                  className="w-full sm:w-auto flex-1 text-sm"
                >
                  <Icon name="MessageCircle" size={14} className="mr-2" />
                  Message
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRequest(product?.id)}
                  className="w-full sm:w-auto flex-1 text-sm"
                >
                  Request
                </Button>

                <div className="mt-1 sm:mt-0 sm:ml-3 ml-auto text-xs text-muted-foreground px-3 py-1 bg-background/50 rounded-md">
                  {product?.category || product?.category?.name || (product?.tags && product.tags[0]) || product?.meta?.category || '—'}
                </div>
              </div>
            </div>
          </div>
        )
      })}
      </div>
      <div className="flex justify-center mt-8">
        <Button variant="outline">
          Load More Products
        </Button>
      </div>
    </div>
  );
};

export default ProductGrid;