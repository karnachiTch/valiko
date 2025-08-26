import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import AppImage from '../../../components/AppImage';

const TabbedContent = ({ product, isDesktop = false, onSelectPickup }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [fulfillmentMode, setFulfillmentMode] = useState('pickup'); // 'pickup' | 'delivery'
  const [selectedPickupIndex, setSelectedPickupIndex] = useState(0);
  const [pickupConfirmed, setPickupConfirmed] = useState(false);

  if (!product) return null;

  // Normalize pickup options early so we can prefer the selected option's location for the map
  const normalizedPickupOptions = Array.isArray(product?.pickupOptions)
    ? product.pickupOptions.map((opt, idx) => {
        if (typeof opt === 'string') {
          const name = opt;
          const label = opt[0]?.toUpperCase() + opt.slice(1);
          // Try to infer a location for common keywords when explicit location is missing
          let location = product?.pickupLocation || '';
          const lc = opt?.toLowerCase?.();
          if (!location && product?.route) {
            if (lc?.includes('airport')) {
              location = product.route.from ? `${product.route.from} airport` : '';
            } else if (lc?.includes('delivery')) {
              location = product.route.to ? `${product.route.to}` : '';
            }
          }
          return { name, label, location, __origIdx: idx };
        }
        return opt;
      })
    : [];

  // Keep selected index valid if options change
  useEffect(() => {
    if (normalizedPickupOptions.length && selectedPickupIndex >= normalizedPickupOptions.length) {
      setSelectedPickupIndex(0);
    }
  }, [product?.pickupOptions]);

  // Reset confirmation when user picks a different option or switches mode
  useEffect(() => {
    setPickupConfirmed(false);
  }, [selectedPickupIndex, fulfillmentMode]);

  const handleSelectPickup = () => {
    const opt = normalizedPickupOptions[selectedPickupIndex];
    if (!opt) return;
    setPickupConfirmed(true);
    if (typeof onSelectPickup === 'function') {
      try {
        onSelectPickup(opt);
      } catch (e) {
        // swallow callback errors
        // eslint-disable-next-line no-console
        console.error('onSelectPickup callback error', e);
      }
    }
  };

  const selectedPickup = normalizedPickupOptions[selectedPickupIndex];

  // Build a query for the map. Prefer selected pickup option, then explicit pickupLocation, fall back to route.
  const mapsQuery = selectedPickup?.location || product?.pickupLocation || (product?.route ? `${product.route.from} to ${product.route.to}` : '');
  const mapsEmbedUrl = mapsQuery ? `https://www.google.com/maps?q=${encodeURIComponent(mapsQuery)}&output=embed` : null;
  const mapsOpenUrl = mapsQuery ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}` : null;

  const tabs = [
    { id: 'details', label: 'Product Details', icon: 'FileText' },
    { id: 'traveler', label: 'Traveler Profile', icon: 'User' },
    { id: 'reviews', label: 'Reviews', icon: 'Star' }
  ];

  const TabButton = ({ tab, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-smooth border ${
        isActive
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground'
      }`}
    >
      <Icon name={tab?.icon} size={16} />
      <span>{tab?.label}</span>
    </button>
  );

  const ProductDetailsTab = () => (
    <div className="space-y-6">
      {/* Description */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Description</h3>
        <p className="text-muted-foreground leading-relaxed">
          {product?.description}
        </p>
      </div>

      

      {/* Interactive Map (Google Maps embed) */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Pickup Location</h3>
        <div className="bg-muted rounded-lg h-48 overflow-hidden relative">
          {mapsEmbedUrl ? (
            <>
              <iframe
                title="Pickup location map"
                src={mapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="absolute top-2 right-2 bg-card/70 backdrop-blur-sm rounded-md px-2 py-1 text-xs">
                <a href={mapsOpenUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">Open in Google Maps</a>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center p-4">
                <div className="text-center">
                <Icon name="MapPin" size={48} className="text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Interactive Map</p>
                <p className="text-sm text-muted-foreground">{product?.pickupLocation || (product?.route ? `${product.route.from} → ${product.route.to}` : 'لا يوجد عنوان محدد — تواصل مع المسافر')}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pickup & Delivery Options */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Pickup & Delivery Options</h3>

        <div className="flex items-center space-x-2 mb-4">
          <button
            onClick={() => setFulfillmentMode('pickup')}
            className={`px-3 py-1 rounded-md font-medium border ${fulfillmentMode === 'pickup' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground'}`}>
            Pickup
          </button>
          <button
            onClick={() => setFulfillmentMode('delivery')}
            className={`px-3 py-1 rounded-md font-medium border ${fulfillmentMode === 'delivery' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground'}`}>
            Delivery
          </button>
        </div>

        {fulfillmentMode === 'pickup' ? (
          <div className="space-y-3">
            {normalizedPickupOptions && normalizedPickupOptions.length > 0 ? (
              normalizedPickupOptions.map((opt, idx) => (
                <label key={idx} className={`flex items-center justify-between p-3 border rounded-lg ${selectedPickupIndex === idx ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="pickupOption"
                      checked={selectedPickupIndex === idx}
                      onChange={() => setSelectedPickupIndex(idx)}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-foreground">{opt?.label || opt?.name || `Pickup ${idx + 1}`}</div>
                      <div className="text-sm text-muted-foreground">{opt?.location || opt?.address || product?.pickupLocation}</div>
                      {opt?.notes && <div className="text-sm text-muted-foreground mt-1">{opt?.notes}</div>}
                    </div>
                  </div>
                  <div className="text-right">
                    {opt?.fee ? <div className="font-medium">{opt.fee}</div> : <div className="text-sm text-muted-foreground">Free</div>}
                    {opt?.time && <div className="text-xs text-muted-foreground">{opt.time}</div>}
                  </div>
                </label>
              ))
            ) : (
              <div className="p-3 border border-border rounded-lg bg-card text-muted-foreground">No pickup options listed. Contact the traveler to arrange pickup.</div>
            )}

            <div className="pt-2">
              <button
                onClick={handleSelectPickup}
                disabled={pickupConfirmed}
                className={`px-4 py-2 rounded-md font-medium ${pickupConfirmed ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground'}`}>
                {pickupConfirmed ? 'Selected ' : 'Select Pickup Option'}
              </button>
              {pickupConfirmed && (
                <div className="text-sm text-success mt-2">✅ The delivery point has been selected.</div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Delivery mode - show delivery details or fallback */}
            {product?.deliveryOptions && product?.deliveryOptions.length > 0 ? (
              product.deliveryOptions.map((dopt, i) => (
                <div key={i} className="p-3 border border-border rounded-lg bg-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground">{dopt?.label || dopt?.name || `Delivery ${i + 1}`}</div>
                      <div className="text-sm text-muted-foreground">{dopt?.eta || dopt?.notes}</div>
                    </div>
                    <div className="text-right">
                      {dopt?.fee ? <div className="font-medium">{dopt.fee}</div> : <div className="text-sm text-muted-foreground">Contact for price</div>}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 border border-border rounded-lg bg-card text-muted-foreground">Delivery not listed — contact traveler to arrange pickup or delivery.</div>
            )}

            <div className="pt-2">
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium">Request Delivery</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const TravelerProfileTab = () => (
    <div className="space-y-6">
      {/* Traveler Header */}
      <div className="flex items-start space-x-4">
        <AppImage
          src={product?.traveler?.avatar}
          alt={product?.traveler?.name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-lg font-semibold text-foreground">
              {product?.traveler?.name}
            </h3>
            {product?.traveler?.verified && (
              <Icon name="BadgeCheck" size={16} className="text-primary" />
            )}
          </div>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Icon name="Star" size={14} className="text-warning fill-current" />
              <span>{product?.traveler?.rating}</span>
            </div>
            <span>{product?.traveler?.completionRate}% completion rate</span>
            <span>{product?.traveler?.reviewCount} reviews</span>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Icon name="MessageCircle" size={14} className="mr-2" />
          Message
        </Button>
      </div>

      {/* Travel History */}
      <div>
        <h4 className="text-base font-semibold text-foreground mb-3">Travel History</h4>
        <div className="space-y-3">
          {product?.traveler?.travelHistory?.map((route, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center space-x-2">
                <Icon name="Plane" size={14} className="text-muted-foreground" />
                <span className="text-foreground">{route?.route}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {route?.frequency} trips
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-muted rounded-lg">
          <p className="text-2xl font-bold text-foreground">{product?.traveler?.reviewCount}</p>
          <p className="text-sm text-muted-foreground">Total Reviews</p>
        </div>
        <div className="text-center p-4 bg-muted rounded-lg">
          <p className="text-2xl font-bold text-foreground">{product?.traveler?.completionRate}%</p>
          <p className="text-sm text-muted-foreground">Success Rate</p>
        </div>
        <div className="text-center p-4 bg-muted rounded-lg">
          <p className="text-2xl font-bold text-foreground">{product?.traveler?.rating}</p>
          <p className="text-sm text-muted-foreground">Rating</p>
        </div>
      </div>
    </div>
  );

  const ReviewsTab = () => (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">{product?.rating}</p>
            <div className="flex items-center mt-1">
              {[...Array(5)]?.map((_, i) => (
                <Icon 
                  key={i} 
                  name="Star" 
                  size={14} 
                  className={`${i < Math.floor(product?.rating) ? 'text-warning fill-current' : 'text-muted-foreground'}`} 
                />
              ))}
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              Based on {product?.reviewCount} reviews
            </p>
            <div className="space-y-1 mt-2">
              {[5, 4, 3, 2, 1]?.map((star) => (
                <div key={star} className="flex items-center space-x-2 text-xs">
                  <span className="text-muted-foreground w-2">{star}</span>
                  <div className="flex-1 bg-border rounded-full h-2">
                    <div 
                      className="bg-warning h-2 rounded-full" 
                      style={{ width: `${Math.random() * 80 + 20}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Individual Reviews */}
      <div className="space-y-4">
        {[1, 2, 3]?.map((review) => (
          <div key={review} className="border border-border rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AppImage
                src="/api/placeholder/40/40"
                alt="Reviewer"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-foreground">Anonymous User</p>
                    <div className="flex items-center space-x-1 mt-1">
                      {[...Array(5)]?.map((_, i) => (
                        <Icon 
                          key={i} 
                          name="Star" 
                          size={12} 
                          className={`${i < 4 ? 'text-warning fill-current' : 'text-muted-foreground'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date()?.toLocaleDateString()}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Excellent quality product and fast delivery. The traveler was very professional and communicative throughout the process.
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'traveler':
        return <TravelerProfileTab />;
      case 'reviews':
        return <ReviewsTab />;
      default:
        return <ProductDetailsTab />;
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 lg:p-6">
      {/* Tab Navigation */}
      <div className={`flex ${isDesktop ? 'flex-col space-y-2' : 'space-x-2 overflow-x-auto'} mb-6`}>
        {tabs?.map((tab) => (
          <TabButton
            key={tab?.id}
            tab={tab}
            isActive={activeTab === tab?.id}
            onClick={() => setActiveTab(tab?.id)}
          />
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default TabbedContent;