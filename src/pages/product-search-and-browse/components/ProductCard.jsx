import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ProductCard = ({ product, onSave, onRequest }) => {
  const [isSaved, setIsSaved] = useState(product?.isSaved || false);
  const navigate = useNavigate();

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave(product?.id, !isSaved);
  };

  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    })?.format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Icon
        key={index}
        name="Star"
        size={12}
        className={index < rating ? 'text-accent fill-current' : 'text-muted-foreground'}
      />
    ));
  };

  return (
    <div
      className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-card transition-smooth cursor-pointer"
      onClick={() => navigate(`/product-detail-view/${product?.id}`)}
    >
      {/* Product Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={product?.image}
          alt={product?.name}
          className="w-full h-full object-cover"
        />
        <button
          onClick={handleSave}
          className="absolute top-3 right-3 p-2 bg-card/90 backdrop-blur-sm rounded-lg hover:bg-card transition-smooth"
        >
          <Icon
            name="Heart"
            size={16}
            className={isSaved ? 'text-accent fill-current' : 'text-muted-foreground'}
          />
        </button>
        {product?.isUrgent && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-error text-error-foreground text-xs font-medium rounded-lg">
            Urgent
          </div>
        )}
      </div>
      {/* Product Info */}
      <div className="p-4">
        {/* Traveler Info */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <Image
              src={product?.traveler?.avatar}
              alt={product?.traveler?.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {product?.traveler?.fullName || product?.traveler?.name || 'Traveler'}
            </p>
            <div className="flex items-center space-x-1">
              {getRatingStars(product?.traveler?.rating)}
              <span className="text-xs text-muted-foreground ml-1">
                ({product?.traveler?.reviewCount})
              </span>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
          {product?.name}
        </h3>

        <div className="space-y-2 mb-4">
          {/* Route */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="MapPin" size={14} />
            <span>{product?.route?.from} → {product?.route?.to}</span>
          </div>

          {/* Travel Date */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="Calendar" size={14} />
            <span>{formatDate(product?.travelDate)}</span>
          </div>

          {/* Quantity */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="Package" size={14} />
            <span>{product?.quantity} available</span>
          </div>
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-foreground">
              {formatPrice(product?.price, product?.currency)}
            </p>
            {product?.originalPrice && (
              <p className="text-sm text-muted-foreground line-through">
                {formatPrice(product?.originalPrice, product?.currency)}
              </p>
            )}
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={() => onRequest(product?.id)}
            iconName="MessageCircle"
            iconPosition="left"
          >
            Request
          </Button>
        </div>

        {/* Pickup Options */}
        {product?.pickupOptions && product?.pickupOptions?.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex flex-wrap gap-1">
              {product?.pickupOptions?.map((option, index) => {
                const label =
                  typeof option === 'string'
                    ? option
                    : option?.label || option?.name || option?.type || JSON.stringify(option);

                return (
                  <span
                    key={index}
                    className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-lg"
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;