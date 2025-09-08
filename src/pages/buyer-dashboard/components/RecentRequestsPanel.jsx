import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import api from '../../../api';

const RecentRequestsPanel = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchRequests = async () => {
      try {
        // جلب طلبات المشتري
        const buyerRes = await api.get('/api/requests?type=buyer_request');
        const buyerItems = Array.isArray(buyerRes.data) ? buyerRes.data : (buyerRes.data?.requests || []);
        // جلب طلبات المسافر
        const travelerRes = await api.get('/api/requests?type=traveler_request');
        const travelerItems = Array.isArray(travelerRes.data) ? travelerRes.data : (travelerRes.data?.requests || []);
        setRequests({ buyer: buyerItems, traveler: travelerItems });
      } catch (e) {
        console.error('[RecentRequestsPanel] fetch error', e);
        setRequests({ buyer: [], traveler: [] });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchRequests();
    return () => { mounted = false; };
  }, []);

  // pre-normalize travelDate for rendering
  const normalizedBuyerRequests = (requests?.buyer || []).map(r => {
    try {
      const raw = r?.travelDate || r?.travel_dates || '';
      if (!raw) return { ...r, travelDate: '' };
      if (typeof raw === 'string') return { ...r, travelDate: raw };
      if (typeof raw === 'object') {
        const sd = raw.startDate || raw.departure || raw.departureDate;
        const ed = raw.endDate || raw.arrival || raw.arrivalDate;
        return { ...r, travelDate: sd && ed ? `${sd} → ${ed}` : (sd || ed || '') };
      }
      return { ...r, travelDate: '' };
    } catch (e) {
      return { ...r, travelDate: '' };
    }
  });
  const normalizedTravelerRequests = (requests?.traveler || []).map(r => {
    try {
      const raw = r?.travelDate || r?.travel_dates || '';
      if (!raw) return { ...r, travelDate: '' };
      if (typeof raw === 'string') return { ...r, travelDate: raw };
      if (typeof raw === 'object') {
        const sd = raw.startDate || raw.departure || raw.departureDate;
        const ed = raw.endDate || raw.arrival || raw.arrivalDate;
        return { ...r, travelDate: sd && ed ? `${sd} → ${ed}` : (sd || ed || '') };
      }
      return { ...r, travelDate: '' };
    } catch (e) {
      return { ...r, travelDate: '' };
    }
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
            <Icon name="Clock" size={10} className="mr-1" />
            Pending
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
            <Icon name="CheckCircle" size={10} className="mr-1" />
            Accepted
          </span>
        );
      case 'in_transit':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
            <Icon name="Plane" size={10} className="mr-1" />
            In Transit
          </span>
        );
      case 'declined':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-error/10 text-error">
            <Icon name="XCircle" size={10} className="mr-1" />
            Declined
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
            <Icon name="CheckCircle2" size={10} className="mr-1" />
            Completed
          </span>
        );
      default:
        return null;
    }
  };

  const getStatusActions = (request) => {
    switch (request?.status) {
      case 'pending':
        return (
          <div className="flex space-x-2">
            <Button variant="outline" size="xs">
              <Icon name="MessageCircle" size={12} className="mr-1" />
              Follow Up
            </Button>
            <Button variant="destructive" size="xs">
              Cancel
            </Button>
          </div>
        );
      case 'accepted':
        return (
          <div className="flex space-x-2">
            <Button variant="default" size="xs">
              <Icon name="MessageCircle" size={12} className="mr-1" />
              Message
            </Button>
            <Button variant="outline" size="xs">
              <Icon name="MapPin" size={12} className="mr-1" />
              Coordinate
            </Button>
          </div>
        );
      case 'in_transit':
        return (
          <div className="flex space-x-2">
            <Button variant="primary" size="xs">
              <Icon name="Truck" size={12} className="mr-1" />
              Track
            </Button>
            <Button variant="outline" size="xs">
              <Icon name="MessageCircle" size={12} className="mr-1" />
              Message
            </Button>
          </div>
        );
      case 'declined':
        return (
          <div className="flex space-x-2">
            <Button variant="outline" size="xs">
              <Icon name="Search" size={12} className="mr-1" />
              Find Similar
            </Button>
          </div>
        );
      case 'completed':
        return (
          <div className="flex space-x-2">
            <Button variant="outline" size="xs">
              <Icon name="Star" size={12} className="mr-1" />
              Rate
            </Button>
            <Button variant="outline" size="xs">
              <Icon name="RotateCcw" size={12} className="mr-1" />
              Reorder
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">الطلبات الأخيرة</h2>
          <p className="text-sm text-muted-foreground">{requests?.buyer?.length + requests?.traveler?.length} إجمالي الطلبات</p>
        </div>
        <Button variant="outline" size="sm">
          <Icon name="Filter" size={14} className="mr-2" />
          تصفية
        </Button>
      </div>

      {/* Buyer Requests Section */}
      <div className="mb-8">
        <h3 className="text-md font-bold text-foreground mb-2">طلبات المشترين</h3>
        {normalizedBuyerRequests.length === 0 ? (
          <div className="text-sm text-muted-foreground">لا توجد طلبات للمشتري.</div>
        ) : (
          <div className="space-y-4">
            {normalizedBuyerRequests.map((request) => (
              <div key={request?.id} className="bg-background rounded-lg border border-border p-4 hover:shadow-card transition-smooth">
                {/* ...existing card rendering code... */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Image
                      src={request?.travelerAvatar}
                      alt={request?.travelerName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h3 className="font-medium text-foreground">{request?.productName}</h3>
                      <p className="text-sm text-muted-foreground">{request?.travelerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(request?.status)}
                    <span className="font-semibold text-foreground">{request?.price}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm text-foreground mb-1">
                      <span className="font-medium">رسالتك:</span>
                    </p>
                    <p className="text-sm text-muted-foreground">{request?.message}</p>
                  </div>

                  {request?.travelerResponse && (
                    <div className="bg-primary/5 rounded-lg p-3">
                      <p className="text-sm text-foreground mb-1">
                        <span className="font-medium">رد المسافر:</span>
                      </p>
                      <p className="text-sm text-muted-foreground">{request?.travelerResponse}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <div className="flex items-center space-x-4">
                    <span>تاريخ الطلب: {request?.requestDate}</span>
                    {request?.responseDate && <span>تاريخ الرد: {request?.responseDate}</span>}
                    <span>تاريخ السفر: {request?.travelDate}</span>
                  </div>
                  <span>{request?.deliveryMethod}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Icon name="Truck" size={12} />
                    <span>{request?.deliveryMethod}</span>
                  </div>
                  {getStatusActions(request)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Traveler Requests Section */}
      <div>
        <h3 className="text-md font-bold text-foreground mb-2">طلبات المسافرين</h3>
        {normalizedTravelerRequests.length === 0 ? (
          <div className="text-sm text-muted-foreground">لا توجد طلبات للمسافر.</div>
        ) : (
          <div className="space-y-4">
            {normalizedTravelerRequests.map((request) => (
              <div key={request?.id} className="bg-background rounded-lg border border-border p-4 hover:shadow-card transition-smooth">
                {/* ...existing card rendering code... */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Image
                      src={request?.travelerAvatar}
                      alt={request?.travelerName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h3 className="font-medium text-foreground">{request?.productName}</h3>
                      <p className="text-sm text-muted-foreground">{request?.travelerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(request?.status)}
                    <span className="font-semibold text-foreground">{request?.price}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm text-foreground mb-1">
                      <span className="font-medium">رسالتك:</span>
                    </p>
                    <p className="text-sm text-muted-foreground">{request?.message}</p>
                  </div>

                  {request?.travelerResponse && (
                    <div className="bg-primary/5 rounded-lg p-3">
                      <p className="text-sm text-foreground mb-1">
                        <span className="font-medium">رد المسافر:</span>
                      </p>
                      <p className="text-sm text-muted-foreground">{request?.travelerResponse}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <div className="flex items-center space-x-4">
                    <span>تاريخ الطلب: {request?.requestDate}</span>
                    {request?.responseDate && <span>تاريخ الرد: {request?.responseDate}</span>}
                    <span>تاريخ السفر: {request?.travelDate}</span>
                  </div>
                  <span>{request?.deliveryMethod}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Icon name="Truck" size={12} />
                    <span>{request?.deliveryMethod}</span>
                  </div>
                  {getStatusActions(request)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-center mt-6">
        <Button variant="outline">
          عرض جميع الطلبات
        </Button>
      </div>
    </div>
  );
};

export default RecentRequestsPanel;