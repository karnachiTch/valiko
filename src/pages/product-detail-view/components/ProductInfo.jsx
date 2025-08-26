import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const ProductInfo = ({ product, onSave, onShare, isSaved }) => {
  if (!product) return null;

  console.log('[ProductInfo] product data:', product);

  const hasPickupOptions = Array.isArray(product?.pickupOptions) && product.pickupOptions.length > 0;
  const pickupText = product?.pickupLocation || (hasPickupOptions ? (product?.pickupOptions[0]?.label || product?.pickupOptions[0]?.name || product?.pickupOptions[0] || 'Not specified') : null);
  const mapsQuery = product?.pickupLocation || (product?.route ? `${product.route.from} to ${product.route.to}` : '');

  // Defensive label for pickup option that may be string or object
  const getPickupLabel = (option) => {
    if (!option && option !== 0) return '';
    return typeof option === 'string'
      ? option
      : (option?.label || option?.name || option?.type || JSON.stringify(option));
  };

  const discountPercentage = product?.originalPrice 
    ? Math.round(((product?.originalPrice - product?.price) / product?.originalPrice) * 100)
    : 0;

  return (
    <div className="bg-card rounded-lg border border-border p-4 lg:p-6 space-y-4">
      {/* Header Actions */}
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-4">
          <h1 className="text-xl lg:text-2xl font-bold text-foreground mb-2">
            {product?.title}
          </h1>
          
          {/* Rating */}
          <div className="flex items-center space-x-2 mb-3">
            <div className="flex items-center space-x-1">
              <Icon name="Star" size={16} className="text-warning fill-current" />
              <span className="text-sm font-medium text-foreground">
                {product?.rating}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              ({product?.reviewCount} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-3">
            <span className="text-2xl lg:text-3xl font-bold text-foreground">
              ${product?.price ?? '—'}
            </span>
            {product?.originalPrice && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  ${product?.originalPrice}
                </span>
                <span className="bg-success/10 text-success px-2 py-1 rounded-md text-sm font-medium">
                  -{discountPercentage}%
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onSave}
            className={isSaved ? 'text-accent' : 'text-muted-foreground'}
          >
            <Icon name={isSaved ? 'Heart' : 'Heart'} size={20} className={isSaved ? 'fill-current' : ''} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onShare}
            className="text-muted-foreground"
          >
            <Icon name="Share2" size={20} />
          </Button>
        </div>
      </div>

      {/* Availability and Location */}
  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        <div className="flex items-center space-x-2">
          <Icon name="Package" size={16} className="text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">
              {product?.availability} available
            </p>
            <p className="text-xs text-muted-foreground">In stock</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Icon name="MapPin" size={16} className="text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">
      {pickupText || '—'}
            </p>
            <p className="text-xs text-muted-foreground">Pickup location</p>
          </div>
        </div>
      </div>

      {/* Explicit Pickup Location Row (clickable + embedded map fallback) */}
      {pickupText && (
        <div className="pt-4">
          <h4 className="text-sm font-semibold text-foreground mb-2">Pickup Location</h4>

          <div className="flex items-center justify-between p-3 border border-border rounded-md bg-card">
            <div className="flex items-start space-x-3">
              <Icon name="MapPin" size={18} className="text-muted-foreground mt-1" />
              <div>
                <div className="font-medium text-foreground">{product?.pickupLocation || (hasPickupOptions ? (product?.pickupOptions[0]?.label || product?.pickupOptions[0]?.name || product?.pickupOptions[0] || 'Not specified') : '')}</div>
                {product?.pickupNotes && (
                  <div className="text-sm text-muted-foreground mt-1">{product.pickupNotes}</div>
                )}

                {/* Show pickup option chips if present */}
                {hasPickupOptions && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {product.pickupOptions.map((opt, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded bg-muted text-foreground">{getPickupLabel(opt)}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-primary font-medium"
              >
                Open in Maps
              </a>
            </div>
          </div>

          {/* Embedded map (fallback) - uses simple maps query embed (no API key) */}
          {mapsQuery && (
            <div className="mt-3 h-48 rounded overflow-hidden border border-border">
              <iframe
                title="pickup-map"
                src={`https://www.google.com/maps?q=${encodeURIComponent(mapsQuery)}&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              />
            </div>
          )}
        </div>
      )}

      {/* Travel Timeline */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center space-x-2">
          <Icon name="Plane" size={16} />
          <span>Travel Timeline</span>
        </h3>
        {/** Resolve dates from multiple possible shapes: product.departureDate, product.travelDates.startDate, product.travelDate (string), etc. */}
        {(() => {
          const format = (d) => {
            try {
              if (!d) return '—';
              const dt = new Date(d);
              if (isNaN(dt.getTime())) return '—';
              return dt.toLocaleDateString();
            } catch (e) {
              return '—';
            }
          };

          const travelDates = product?.travelDates || {};
          const departure = travelDates?.startDate || travelDates?.departure || product?.departureDate || product?.travelDate || travelDates?.departureDate || null;
          const arrival = travelDates?.endDate || travelDates?.arrival || product?.arrivalDate || null;

          return (
            <>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Icon name="Calendar" size={14} className="text-muted-foreground" />
                  <span className="text-foreground">Departure</span>
                </div>
                <span className="font-medium text-foreground">{format(departure)}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Icon name="MapPin" size={14} className="text-muted-foreground" />
                  <span className="text-foreground">Arrival</span>
                </div>
                <span className="font-medium text-foreground">{format(arrival)}</span>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
};

export default ProductInfo;