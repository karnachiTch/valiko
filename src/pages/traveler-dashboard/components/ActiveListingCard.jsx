import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ActiveListingCard = ({ listing, onEdit, onViewRequests, onMarkFulfilled, isFulfilling }) => {
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-success text-success-foreground';
      case 'expired':
        return 'bg-error text-error-foreground';
      case 'fulfilled':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(price);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 shadow-card hover:shadow-modal transition-smooth">
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={listing?.image}
            alt={listing?.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-foreground truncate pr-2">{listing?.title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing?.status)}`}>
              {listing?.status}
            </span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center space-x-1">
              <Icon name="MessageCircle" size={14} />
              <span>{listing?.requestCount} requests</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="DollarSign" size={14} />
              <span>{formatPrice(listing?.price)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="MapPin" size={14} />
              <span>{listing?.destination}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              iconName="Edit"
              onClick={() => onEdit(listing?.id)}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="Eye"
              onClick={() => setShowRequestsModal(true)}
            >
              Requests ({listing?.requestCount})
            </Button>
      {/* نافذة منبثقة لعرض الطلبات */}
      {showRequestsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-card rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowRequestsModal(false)}
            >
              <Icon name="X" size={20} />
            </button>
            <h3 className="text-lg font-semibold mb-4">Requests for {listing?.title}</h3>
            {/* هنا يتم عرض الطلبات الفعلية إذا كانت متوفرة */}
            {listing?.requestCount > 0 ? (
              <ul className="space-y-3">
                {/* بيانات وهمية للعرض، يمكن ربطها ببيانات حقيقية لاحقاً */}
                {Array.from({ length: listing?.requestCount }).map((_, idx) => (
                  <li key={idx} className="p-3 border rounded-lg flex items-center justify-between">
                    <span>Request #{idx + 1}</span>
                    <Button size="xs" variant="success">Accept</Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No requests found.</p>
            )}
          </div>
        </div>
      )}
            {listing?.status === 'active' && (
              <Button
                variant="success"
                size="sm"
                iconName="Check"
                onClick={() => onMarkFulfilled(listing?.id)}
                disabled={isFulfilling}
                loading={isFulfilling}
              >
                {isFulfilling ? 'Processing...' : 'Mark Fulfilled'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveListingCard;