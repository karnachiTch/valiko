import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import api from '../../../api';

const FeaturedProductsCarousel = () => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/api/products?featured=true');
        if (!mounted) return;
        const items = Array.isArray(res.data) ? res.data : (res.data?.products || []);
        console.log('[FeaturedProductsCarousel] Fetched products:', res.data);
        setFeaturedProducts(items);
      } catch (e) {
        console.error('[FeaturedProductsCarousel] fetch error', e);
        setFeaturedProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchFeatured();
    return () => { mounted = false; };
  }, []);

  const scroll = (direction) => {
    const container = scrollRef?.current;
    const scrollAmount = 300;
    
    if (direction === 'left') {
      container.scrollLeft -= scrollAmount;
    } else {
      container.scrollLeft += scrollAmount;
    }
    
    setTimeout(() => {
      setCanScrollLeft(container?.scrollLeft > 0);
      setCanScrollRight(container?.scrollLeft < container?.scrollWidth - container?.clientWidth);
    }, 100);
  };

  const toggleSave = (productId) => {
    // Mock save functionality
    console.log('Toggle save for product:', productId);
  };

  const handleRequestProduct = async (productId) => {
    try {
      console.log('Requesting product with ID:', productId, 'to URL:', '/api/products/request');
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

  // normalize featuredProducts travelDate into string to avoid rendering objects
  const normalizedFeatured = (featuredProducts || []).map(p => {
    try {
      const raw = p?.travelDate ?? p?.travelDates ?? '';
      if (!raw) return { ...p, travelDate: '' };
      if (typeof raw === 'string') return { ...p, travelDate: raw };
      if (typeof raw === 'object') {
        const sd = raw.startDate || raw.departure || raw.departureDate;
        const ed = raw.endDate || raw.arrival || raw.arrivalDate;
        return { ...p, travelDate: sd && ed ? `${sd} → ${ed}` : (sd || ed || '') };
      }
      return { ...p, travelDate: '' };
    } catch (e) {
      return { ...p, travelDate: '' };
    }
  });

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Featured Products</h2>
          <p className="text-sm text-muted-foreground">Trending items from your preferred regions</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`p-2 rounded-lg border border-border transition-smooth ${
              canScrollLeft 
                ? 'hover:bg-muted text-foreground' 
                : 'text-muted-foreground cursor-not-allowed'
            }`}
          >
            <Icon name="ChevronLeft" size={16} />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`p-2 rounded-lg border border-border transition-smooth ${
              canScrollRight 
                ? 'hover:bg-muted text-foreground' 
                : 'text-muted-foreground cursor-not-allowed'
            }`}
          >
            <Icon name="ChevronRight" size={16} />
          </button>
        </div>
      </div>
      <div 
        ref={scrollRef}
        className="flex space-x-4 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {loading ? (
          <div className="py-8 text-muted-foreground">Loading featured products...</div>
        ) : (
          normalizedFeatured.map((product) => (
          <div key={product?.id} className="flex-shrink-0 w-72 bg-background rounded-lg border border-border overflow-hidden hover:shadow-card transition-smooth">
            <div className="relative">
              <Image
                src={product?.image}
                alt={product?.name}
                className="w-full h-48 object-cover"
              />
              <button
                onClick={() => toggleSave(product?.id)}
                className={`absolute top-3 right-3 p-2 rounded-full transition-smooth ${
                  product?.isSaved 
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
                <h3 className="font-medium text-foreground line-clamp-2">{product?.name}</h3>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{product?.price}</p>
                  <p className="text-xs text-muted-foreground line-through">{product?.originalPrice}</p>
                </div>
              </div>

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

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Icon name="Plane" size={12} />
                  <span>{product?.departure} → {product?.arrival}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Icon name="Calendar" size={12} />
                  <span>{product?.travelDate}</span>
                </div>
              </div>

              <Button 
                variant="default" 
                size="sm" 
                fullWidth
                onClick={() => handleRequestProduct(product?.id)}
              >
                Request Product
              </Button>
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FeaturedProductsCarousel;