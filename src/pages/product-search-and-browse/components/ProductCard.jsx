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
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group w-full h-full flex flex-col justify-between"
      onClick={() => navigate(`/product-detail-view/${product?.id}`)}
      style={{ minHeight: 440 }}
    >
      {/* Product Image */}
  <div className="relative h-60 overflow-hidden bg-gray-50 flex items-center justify-center">
        <Image
          src={product?.image}
          alt={product?.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
        />
        <button
          onClick={e => { e.stopPropagation(); handleSave(); }}
          className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-md rounded-full shadow hover:bg-white transition"
        >
          <Icon
            name="Heart"
            size={20}
            className={isSaved ? 'text-red-500 fill-current' : 'text-gray-300'}
          />
        </button>
        {product?.isUrgent && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow">
            Urgent
          </div>
        )}
      </div>
      {/* Product Info */}
  <div className="p-4 flex flex-col flex-1 justify-between">
        {/* Traveler Info */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
            <Image
              src={product?.traveler?.avatar}
              alt={product?.traveler?.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {product?.traveler?.fullName || product?.traveler?.name || 'Traveler'}
            </p>
            <div className="flex items-center gap-1">
              {getRatingStars(product?.traveler?.rating)}
              <span className="text-xs text-gray-400 ml-1">
                ({product?.traveler?.reviewCount})
              </span>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
          {product?.name}
        </h3>

  <div className="space-y-2 mb-4">
          {/* Route */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Icon name="MapPin" size={15} />
            <span>{product?.route?.from} → {product?.route?.to}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Icon name="Calendar" size={15} />
            <span>{formatDate(product?.travelDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Icon name="Package" size={15} />
            <span>{product?.quantity} available</span>
          </div>
        </div>

        {/* Price and Actions */}
  <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
          <div>
            <p className="text-xl font-bold text-blue-600">
              {formatPrice(product?.price, product?.currency)}
            </p>
            {product?.originalPrice && (
              <p className="text-sm text-gray-400 line-through">
                {formatPrice(product?.originalPrice, product?.currency)}
              </p>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={e => { e.stopPropagation(); navigate(`/product-detail-view/${product?.id}`); }}
            >
              View
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={e => { e.stopPropagation(); onRequest(product?.id); }}
              iconName="MessageCircle"
              iconPosition="left"
            >
              Request
            </Button>
          </div>
        </div>

        {/* Pickup Options */}
        {product?.pickupOptions && product?.pickupOptions?.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {product?.pickupOptions?.map((option, index) => {
                const label =
                  typeof option === 'string'
                    ? option
                    : option?.label || option?.name || option?.type || JSON.stringify(option);

                return (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full font-semibold"
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