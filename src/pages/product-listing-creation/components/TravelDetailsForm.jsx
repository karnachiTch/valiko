import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import { Checkbox, CheckboxGroup } from '../../../components/ui/Checkbox';

const TravelDetailsForm = ({ 
  travelDates, 
  onTravelDatesChange, 
  pickupOptions, 
  onPickupOptionsChange,
  quantity,
  onQuantityChange 
}) => {
  const [availablePickupOptions] = useState([
    { id: 'airport', label: 'Airport Pickup', description: 'Meet at arrival terminal' },
    { id: 'city_center', label: 'City Center', description: 'Meet at central location' },
    { id: 'delivery', label: 'Home Delivery', description: 'Deliver to buyer\'s address' },
    { id: 'postal', label: 'Postal Service', description: 'Ship via local postal service' }
  ]);

  const handleQuantityChange = (delta) => {
    const newQuantity = Math.max(1, (quantity || 1) + delta);
    onQuantityChange(newQuantity);
  };

  const handlePickupOptionChange = (optionId, checked) => {
    if (checked) {
      onPickupOptionsChange([...pickupOptions, optionId]);
    } else {
      onPickupOptionsChange(pickupOptions?.filter(id => id !== optionId));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString)?.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isValidDateRange = () => {
    if (!travelDates?.departure || !travelDates?.arrival) return true;
    return new Date(travelDates.departure) <= new Date(travelDates.arrival);
  };

  return (
    <div className="space-y-6">
      {/* Travel Dates */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground flex items-center space-x-2">
          <Icon name="Calendar" size={20} />
          <span>Travel Dates</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Departure Date"
            type="date"
            value={travelDates?.departure}
            onChange={(e) => onTravelDatesChange({
              ...travelDates,
              departure: e?.target?.value
            })}
            min={new Date()?.toISOString()?.split('T')?.[0]}
            required
          />
          
          <Input
            label="Arrival Date"
            type="date"
            value={travelDates?.arrival}
            onChange={(e) => onTravelDatesChange({
              ...travelDates,
              arrival: e?.target?.value
            })}
            min={travelDates?.departure || new Date()?.toISOString()?.split('T')?.[0]}
            required
            error={!isValidDateRange() ? "Arrival date must be after departure date" : ""}
          />
        </div>

        {/* Date Summary */}
        {travelDates?.departure && travelDates?.arrival && isValidDateRange() && (
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Departure</p>
                  <p className="font-medium text-foreground">{formatDate(travelDates?.departure)}</p>
                </div>
                <Icon name="ArrowRight" size={16} className="text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Arrival</p>
                  <p className="font-medium text-foreground">{formatDate(travelDates?.arrival)}</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium text-foreground">
                  {Math.ceil((new Date(travelDates.arrival) - new Date(travelDates.departure)) / (1000 * 60 * 60 * 24))} days
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Quantity */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground flex items-center space-x-2">
          <Icon name="Package" size={20} />
          <span>Quantity Available</span>
        </h3>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleQuantityChange(-1)}
            className="w-10 h-10 rounded-lg border border-border hover:bg-muted transition-smooth flex items-center justify-center"
            disabled={quantity <= 1}
          >
            <Icon name="Minus" size={16} />
          </button>
          
          <div className="flex-1 max-w-24">
            <Input
              type="number"
              value={quantity}
              onChange={(e) => onQuantityChange(parseInt(e?.target?.value) || 1)}
              min="1"
              className="text-center"
            />
          </div>
          
          <button
            onClick={() => handleQuantityChange(1)}
            className="w-10 h-10 rounded-lg border border-border hover:bg-muted transition-smooth flex items-center justify-center"
          >
            <Icon name="Plus" size={16} />
          </button>
          
          <div className="text-sm text-muted-foreground">
            {quantity === 1 ? '1 item' : `${quantity} items`} available
          </div>
        </div>
      </div>
      {/* Pickup Options */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground flex items-center space-x-2">
          <Icon name="MapPin" size={20} />
          <span>Pickup & Delivery Options</span>
        </h3>
        
        <CheckboxGroup label="Select available pickup methods">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availablePickupOptions?.map((option) => (
              <div key={option?.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-smooth">
                <Checkbox
                  label={option?.label}
                  description={option?.description}
                  checked={pickupOptions?.includes(option?.id)}
                  onChange={(e) => handlePickupOptionChange(option?.id, e?.target?.checked)}
                />
              </div>
            ))}
          </div>
        </CheckboxGroup>

        {/* Selected Options Summary */}
        {pickupOptions?.length > 0 && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="CheckCircle" size={16} className="text-primary" />
              <span className="font-medium text-primary">Selected Options</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {pickupOptions?.map((optionId) => {
                const option = availablePickupOptions?.find(opt => opt?.id === optionId);
                return (
                  <span
                    key={optionId}
                    className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                  >
                    {option?.label}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {/* Availability Timeline */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Icon name="Clock" size={16} className="text-accent" />
          <span className="font-medium text-foreground">Availability Timeline</span>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order Deadline:</span>
            <span className="font-medium text-foreground">
              {travelDates?.departure ? 
                new Date(new Date(travelDates.departure).getTime() - 2 * 24 * 60 * 60 * 1000)?.toLocaleDateString() :
                'Set departure date'
              }
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Expected Delivery:</span>
            <span className="font-medium text-foreground">
              {travelDates?.arrival ? 
                new Date(new Date(travelDates.arrival).getTime() + 1 * 24 * 60 * 60 * 1000)?.toLocaleDateString() :
                'Set arrival date'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelDetailsForm;