import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const QuantitySelector = ({ quantity, maxQuantity, onChange, compact = false }) => {
  const handleDecrease = () => {
    if (quantity > 1) {
      onChange?.(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < maxQuantity) {
      onChange?.(quantity + 1);
    }
  };

  const handleInputChange = (e) => {
    const value = parseInt(e?.target?.value) || 1;
    if (value >= 1 && value <= maxQuantity) {
      onChange?.(value);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDecrease}
          disabled={quantity <= 1}
          className="h-8 w-8 p-0"
        >
          <Icon name="Minus" size={12} />
        </Button>
        <span className="text-sm font-medium text-foreground w-8 text-center">
          {quantity}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleIncrease}
          disabled={quantity >= maxQuantity}
          className="h-8 w-8 p-0"
        >
          <Icon name="Plus" size={12} />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          Quantity
        </label>
        <span className="text-xs text-muted-foreground">
          Max: {maxQuantity}
        </span>
      </div>
      
      <div className="flex items-center space-x-3">
        <Button
          variant="outline"
          size="icon"
          onClick={handleDecrease}
          disabled={quantity <= 1}
        >
          <Icon name="Minus" size={16} />
        </Button>
        
        <div className="flex-1 max-w-20">
          <input
            type="number"
            value={quantity}
            onChange={handleInputChange}
            min="1"
            max={maxQuantity}
            className="w-full h-10 px-3 text-center border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={handleIncrease}
          disabled={quantity >= maxQuantity}
        >
          <Icon name="Plus" size={16} />
        </Button>
      </div>

      <div className="text-xs text-muted-foreground">
        {quantity === 1 ? '1 item selected' : `${quantity} items selected`}
      </div>
    </div>
  );
};

export default QuantitySelector;