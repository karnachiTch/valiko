import React from 'react';
import Icon from '../../../components/AppIcon';

const UpcomingTripCard = ({ trip }) => {

  // دالة ذكية لتنسيق أي قيمة تاريخ
  const formatAnyDate = (date) => {
    if (!date) return '';
    // إذا كان رقم (timestamp)
    if (typeof date === 'number') {
      const d = new Date(date);
      if (!isNaN(d)) return d.toLocaleDateString('en-GB');
    }
    // إذا كان نص
    if (typeof date === 'string') {
      // جرب تحويله مباشرة
      let d = new Date(date);
      if (!isNaN(d)) return d.toLocaleDateString('en-GB');
      // جرب إذا كان فقط تاريخ بدون وقت
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        d = new Date(date + 'T00:00:00Z');
        if (!isNaN(d)) return d.toLocaleDateString('en-GB');
      }
    }
    // إذا كان Date
    if (date instanceof Date && !isNaN(date)) {
      return date.toLocaleDateString('en-GB');
    }
    return date;
  };

  const getDaysUntilTrip = (departureDate) => {
    const today = new Date();
    const departure = new Date(departureDate);
    const diffTime = departure - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntil = getDaysUntilTrip(trip?.departureDate);

  return (
    <div className="bg-card rounded-lg border border-border p-4 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground">{trip?.route}</h3>
        <span className="text-sm text-muted-foreground">
          {daysUntil > 0 ? `${daysUntil} days` : 'Today'}
        </span>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="Plane" size={16} className="text-primary" />
            <span className="text-sm text-foreground">{trip?.departureAirport}</span>
          </div>
          <Icon name="ArrowRight" size={16} className="text-muted-foreground" />
          <div className="flex items-center space-x-2">
            <Icon name="MapPin" size={16} className="text-success" />
            <span className="text-sm text-foreground">{trip?.arrivalAirport}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{formatAnyDate(trip?.departureDate)}</span>
          <span>→</span>
          <span>{formatAnyDate(trip?.returnDate)}</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center space-x-1">
            <Icon name="Package" size={14} />
            <span className="text-sm text-muted-foreground">
              {trip?.associatedListings} listings
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="Users" size={14} />
            <span className="text-sm text-muted-foreground">
              {trip?.potentialBuyers} interested
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpcomingTripCard;