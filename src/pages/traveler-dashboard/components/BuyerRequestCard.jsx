import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const BuyerRequestCard = ({ request, onAccept, onDecline, onViewProfile }) => {
  const formatTimeAgo = (date) => {
    const now = new Date();
    const requestDate = new Date(date);
    const diffTime = now - requestDate;
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(price);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 shadow-card">
      <div className="flex items-start space-x-3 mb-3">
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              <img
                src={request?.buyer?.avatar || (request?.buyer?.fullName || request?.buyer?.name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(request?.buyer?.fullName || request?.buyer?.name)}` : "https://ui-avatars.com/api/?name=Buyer") }
                alt={request?.buyer?.name || "Buyer"}
                className="w-full h-full object-cover"
                onError={e => { e.target.onerror=null; e.target.src="https://ui-avatars.com/api/?name=Buyer"; }}
              />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium text-foreground truncate">{request?.buyer?.name}</h4>
            <span className="text-xs text-muted-foreground">{formatTimeAgo(request?.timestamp)}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="Star" size={12} className="text-warning" />
            <span>{request?.buyer?.rating}</span>
            <span>•</span>
            <span>{request?.buyer?.completedOrders} orders</span>
          </div>
        </div>
      </div>
      <div className="mb-3">
        <h5 className="font-medium text-foreground mb-1">{request?.productName}</h5>
        <p className="text-sm text-muted-foreground mb-2">{request?.message}</p>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <Icon name="Package" size={14} />
            <span>Qty: {request?.quantity}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="DollarSign" size={14} />
            <span>{formatPrice(request?.offeredPrice)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="MapPin" size={14} />
            <span>{request?.deliveryLocation}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="success"
          size="sm"
          iconName="Check"
          onClick={() => onAccept(request?.id)}
        >
          Accept
        </Button>
        <Button
          variant="outline"
          size="sm"
          iconName="X"
          onClick={() => onDecline(request?.id)}
        >
          Decline
        </Button>
        <Button
          variant="ghost"
          size="sm"
          iconName="User"
          onClick={() => onViewProfile(request?.buyer?.id)}
        >
          Profile
        </Button>
      </div>
    </div>
  );
};

export default BuyerRequestCard;