import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const PricingCalculator = ({ 
  basePrice, 
  onBasePriceChange, 
  currency, 
  onCurrencyChange,
  departureAirport,
  arrivalAirport,
  category 
}) => {
  const [pricingBreakdown, setPricingBreakdown] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [showCalculator, setShowCalculator] = useState(false);

  const currencies = [
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'JPY', label: 'Japanese Yen (¥)' },
    { value: 'AUD', label: 'Australian Dollar (A$)' },
    { value: 'CAD', label: 'Canadian Dollar (C$)' },
    { value: 'CHF', label: 'Swiss Franc (CHF)' },
    { value: 'CNY', label: 'Chinese Yuan (¥)' },
    { value: 'INR', label: 'Indian Rupee (₹)' },
    { value: 'AED', label: 'UAE Dirham (AED)' }
  ];

  useEffect(() => {
    if (basePrice && departureAirport && arrivalAirport) {
      calculatePricing();
      generateRecommendations();
    }
  }, [basePrice, departureAirport, arrivalAirport, category]);

  const calculatePricing = () => {
    const price = parseFloat(basePrice) || 0;
    
    // Mock pricing calculations
    const breakdown = {
      basePrice: price,
      shippingCost: Math.round(price * 0.15),
      serviceFee: Math.round(price * 0.08),
      insuranceFee: Math.round(price * 0.03),
      taxes: Math.round(price * 0.12),
      totalCost: 0
    };
    
    breakdown.totalCost = breakdown?.basePrice + breakdown?.shippingCost + 
                         breakdown?.serviceFee + breakdown?.insuranceFee + breakdown?.taxes;
    
    setPricingBreakdown(breakdown);
  };

  const generateRecommendations = () => {
    const price = parseFloat(basePrice) || 0;
    
    // Mock market analysis
    const mockRecommendations = {
      marketPrice: {
        min: Math.round(price * 0.85),
        max: Math.round(price * 1.25),
        average: Math.round(price * 1.05)
      },
      competitorPrices: [
        { seller: 'TravelBuddy23', price: Math.round(price * 0.92), rating: 4.8 },
        { seller: 'GlobalShopper', price: Math.round(price * 1.15), rating: 4.6 },
        { seller: 'WorldTraveler', price: Math.round(price * 1.08), rating: 4.9 }
      ],
      demandLevel: price > 500 ? 'High' : price > 200 ? 'Medium' : 'Low',
      suggestedPrice: Math.round(price * 1.02),
      profitMargin: '15-25%'
    };
    
    setRecommendations(mockRecommendations);
  };

  const formatCurrency = (amount) => {
    const symbols = {
      USD: '$', EUR: '€', GBP: '£', JPY: '¥', AUD: 'A$',
      CAD: 'C$', CHF: 'CHF', CNY: '¥', INR: '₹', AED: 'AED'
    };
    return `${symbols?.[currency] || '$'}${amount?.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Basic Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Base Price"
          type="number"
          placeholder="Enter product price"
          value={basePrice}
          onChange={(e) => onBasePriceChange(e?.target?.value)}
          required
        />
        
        <Select
          label="Currency"
          options={currencies}
          value={currency}
          onChange={onCurrencyChange}
          required
        />
      </div>
      {/* Pricing Calculator Toggle */}
      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
        <div className="flex items-center space-x-3">
          <Icon name="Calculator" size={20} className="text-primary" />
          <div>
            <h3 className="font-medium text-foreground">Smart Pricing Calculator</h3>
            <p className="text-sm text-muted-foreground">Get pricing recommendations based on market data</p>
          </div>
        </div>
        <button
          onClick={() => setShowCalculator(!showCalculator)}
          className="p-2 rounded-lg hover:bg-background transition-smooth"
        >
          <Icon name={showCalculator ? "ChevronUp" : "ChevronDown"} size={20} />
        </button>
      </div>
      {/* Expanded Calculator */}
      {showCalculator && (
        <div className="space-y-6 bg-card border border-border rounded-lg p-6">
          {/* Pricing Breakdown */}
          {pricingBreakdown && (
            <div>
              <h4 className="font-semibold text-foreground mb-4">Cost Breakdown</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Base Price</span>
                  <span className="font-medium">{formatCurrency(pricingBreakdown?.basePrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Shipping Cost (15%)</span>
                  <span className="font-medium">{formatCurrency(pricingBreakdown?.shippingCost)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Service Fee (8%)</span>
                  <span className="font-medium">{formatCurrency(pricingBreakdown?.serviceFee)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Insurance (3%)</span>
                  <span className="font-medium">{formatCurrency(pricingBreakdown?.insuranceFee)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Taxes (12%)</span>
                  <span className="font-medium">{formatCurrency(pricingBreakdown?.taxes)}</span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground">Total Cost to Buyer</span>
                    <span className="font-bold text-lg text-primary">{formatCurrency(pricingBreakdown?.totalCost)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Market Recommendations */}
          {recommendations && (
            <div>
              <h4 className="font-semibold text-foreground mb-4">Market Analysis</h4>
              
              {/* Price Range */}
              <div className="bg-muted rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-foreground">Market Price Range</span>
                  <span className={`text-sm px-2 py-1 rounded ${
                    recommendations?.demandLevel === 'High' ? 'bg-success/10 text-success' :
                    recommendations?.demandLevel === 'Medium'? 'bg-warning/10 text-warning' : 'bg-muted-foreground/10 text-muted-foreground'
                  }`}>
                    {recommendations?.demandLevel} Demand
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Min</p>
                    <p className="font-semibold">{formatCurrency(recommendations?.marketPrice?.min)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Average</p>
                    <p className="font-semibold text-primary">{formatCurrency(recommendations?.marketPrice?.average)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Max</p>
                    <p className="font-semibold">{formatCurrency(recommendations?.marketPrice?.max)}</p>
                  </div>
                </div>
              </div>

              {/* Competitor Analysis */}
              <div className="space-y-3">
                <h5 className="font-medium text-foreground">Similar Listings</h5>
                {recommendations?.competitorPrices?.map((competitor, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                        <Icon name="User" size={14} color="white" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{competitor?.seller}</p>
                        <div className="flex items-center space-x-1">
                          <Icon name="Star" size={12} className="text-accent fill-current" />
                          <span className="text-xs text-muted-foreground">{competitor?.rating}</span>
                        </div>
                      </div>
                    </div>
                    <span className="font-semibold text-foreground">{formatCurrency(competitor?.price)}</span>
                  </div>
                ))}
              </div>

              {/* Recommendation */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="Lightbulb" size={16} className="text-primary" />
                  <span className="font-medium text-primary">Pricing Recommendation</span>
                </div>
                <p className="text-sm text-foreground">
                  Based on market analysis, we suggest pricing at{' '}
                  <span className="font-semibold">{formatCurrency(recommendations?.suggestedPrice)}</span>{' '}
                  for optimal competitiveness with a {recommendations?.profitMargin} profit margin.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PricingCalculator;