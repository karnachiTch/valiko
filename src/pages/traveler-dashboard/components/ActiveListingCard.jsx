import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ActiveListingCard = ({ listing, onEdit, onViewRequests, onMarkFulfilled, isFulfilling }) => {
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // جلب الطلبات الحقيقية لهذا المنتج عند فتح النافذة
  const fetchRequestsForListing = async () => {
    setLoadingRequests(true);
    try {
      const token = localStorage.getItem('accessToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      // جلب الطلبات لهذا المنتج فقط
      const api = await import('../../../api').then(m => m.default);
      const res = await api.get(`/api/requests?product_id=${listing?.id}`, { headers });
      setRequests(res.data || []);
    } catch (err) {
      setRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };
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
              onClick={() => {
                setShowRequestsModal(true);
                fetchRequestsForListing();
              }}
            >
              Requests ({requests?.length ?? 0})
            </Button>
            <Button
              variant="primary"
              disabled={listing?.status === 'reserved'}
              onClick={() => {}}
            >
              {listing?.status === 'reserved' ? 'محجوز' : 'Reserve Product'}
            </Button>
      {/* نافذة منبثقة لعرض الطلبات */}
      {showRequestsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-card rounded-xl shadow-2xl p-6 w-full max-w-lg relative flex flex-col">
            <button
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground focus:outline-none"
              onClick={() => setShowRequestsModal(false)}
              aria-label="Close"
            >
              <Icon name="X" size={24} />
            </button>
            <h3 className="text-xl font-bold mb-5 text-center">Product requests: {listing?.title}</h3>
            <div className="overflow-y-auto max-h-[60vh]">
              {loadingRequests ? (
                <p className="text-muted-foreground text-center">جاري تحميل الطلبات...</p>
              ) : requests?.length > 0 ? (
                <ul className="space-y-4">
                  {requests.map((req, idx) => (
                    <li key={req.id || req._id || idx} className="p-4 border rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-muted/40">
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-base text-foreground block mb-1">{req?.buyerName || req?.buyer_id || `طلب رقم ${idx + 1}`}</span>
                        {req?.message && <span className="text-xs text-muted-foreground block mb-1">{req.message}</span>}
                        {req?.quantity && <span className="text-xs text-muted-foreground">الكمية: {req.quantity}</span>}
                      </div>
                      <div className="flex flex-row flex-wrap gap-2 justify-end">
                        <Button size="sm" variant="outline" onClick={() => {
                          const details = `اسم المشتري: ${req?.buyerName || ''}\n` +
                            `الكمية: ${req?.quantity || ''}\n` +
                            (req?.message ? `ملاحظة: ${req.message}\n` : '') +
                            `رقم الطلب: ${req?.id || req?._id || ''}`;
                          alert(details);
                        }}>تفاصيل</Button>
                        <Button size="sm" variant="success" onClick={async () => {
                          const requestId = req.id || req._id;
                          if (!requestId) return alert('Request ID missing');
                          try {
                            const token = localStorage.getItem('accessToken');
                            const headers = token ? { Authorization: `Bearer ${token}` } : {};
                            const api = await import('../../../api').then(m => m.default);
                            await api.patch(`/api/requests/${requestId}/status`, { status: 'accepted' }, { headers });
                            setRequests(prev => prev.filter(r => (r.id || r._id) !== requestId));
                          } catch (err) {
                            alert('فشل قبول الطلب');
                          }
                        }}>قبول</Button>
                        <Button size="sm" variant="error" onClick={async () => {
                          const requestId = req.id || req._id;
                          if (!requestId) return alert('Request ID missing');
                          try {
                            const token = localStorage.getItem('accessToken');
                            const headers = token ? { Authorization: `Bearer ${token}` } : {};
                            const api = await import('../../../api').then(m => m.default);
                            await api.patch(`/api/requests/${requestId}/status`, { status: 'declined' }, { headers });
                            setRequests(prev => prev.filter(r => (r.id || r._id) !== requestId));
                          } catch (err) {
                            alert('فشل رفض الطلب');
                          }
                        }}>رفض</Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-center">no requests at the moment</p>
              )}
            </div>
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