import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Select from '../../../components/ui/Select';

const LocationSelector = ({ 
  departureAirport, 
  arrivalAirport, 
  onDepartureChange, 
  onArrivalChange,
  onRouteAnalysis 
}) => {
  const [airports] = useState([
    { value: 'JFK', label: 'John F. Kennedy International Airport (JFK)', city: 'New York', country: 'United States' },
    { value: 'LAX', label: 'Los Angeles International Airport (LAX)', city: 'Los Angeles', country: 'United States' },
    { value: 'LHR', label: 'London Heathrow Airport (LHR)', city: 'London', country: 'United Kingdom' },
    { value: 'CDG', label: 'Charles de Gaulle Airport (CDG)', city: 'Paris', country: 'France' },
    { value: 'NRT', label: 'Narita International Airport (NRT)', city: 'Tokyo', country: 'Japan' },
    { value: 'DXB', label: 'Dubai International Airport (DXB)', city: 'Dubai', country: 'United Arab Emirates' },
    { value: 'SIN', label: 'Singapore Changi Airport (SIN)', city: 'Singapore', country: 'Singapore' },
    { value: 'HKG', label: 'Hong Kong International Airport (HKG)', city: 'Hong Kong', country: 'Hong Kong' },
    { value: 'FRA', label: 'Frankfurt Airport (FRA)', city: 'Frankfurt', country: 'Germany' },
    { value: 'AMS', label: 'Amsterdam Airport Schiphol (AMS)', city: 'Amsterdam', country: 'Netherlands' },
    { value: 'ICN', label: 'Incheon International Airport (ICN)', city: 'Seoul', country: 'South Korea' },
    { value: 'SYD', label: 'Sydney Kingsford Smith Airport (SYD)', city: 'Sydney', country: 'Australia' },
    { value: 'YYZ', label: 'Toronto Pearson International Airport (YYZ)', city: 'Toronto', country: 'Canada' },
    { value: 'GRU', label: 'São Paulo–Guarulhos International Airport (GRU)', city: 'São Paulo', country: 'Brazil' },
    { value: 'BOM', label: 'Chhatrapati Shivaji Maharaj International Airport (BOM)', city: 'Mumbai', country: 'India' }
  ]);

  const [routeInsights, setRouteInsights] = useState(null);
  const [popularProducts, setPopularProducts] = useState([]);

  useEffect(() => {
    if (departureAirport && arrivalAirport && departureAirport !== arrivalAirport) {
      analyzeRoute();
    }
  }, [departureAirport, arrivalAirport]);

  const analyzeRoute = () => {
    // Mock route analysis data
    const mockInsights = {
      distance: '8,000 km',
      flightTime: '10h 30m',
      timezone: '+9 hours',
      demand: 'High',
      competition: 'Medium',
      avgDeliveryTime: '3-5 days',
      popularCategories: ['Electronics', 'Fashion', 'Cosmetics', 'Specialty Foods']
    };

    const mockPopularProducts = [
      { name: 'iPhone 15 Pro', demand: 'Very High', avgPrice: '$1,200' },
      { name: 'Nike Air Jordan', demand: 'High', avgPrice: '$180' },
      { name: 'Chanel Perfume', demand: 'High', avgPrice: '$150' },
      { name: 'Japanese Skincare', demand: 'Medium', avgPrice: '$80' }
    ];

    setRouteInsights(mockInsights);
    setPopularProducts(mockPopularProducts);
    
    if (onRouteAnalysis) {
      onRouteAnalysis(mockInsights);
    }
  };

  const swapAirports = () => {
    const temp = departureAirport;
    onDepartureChange(arrivalAirport);
    onArrivalChange(temp);
  };

  return (
    <div className="space-y-6">
      {/* Airport Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Select
            label="Departure Airport"
            placeholder="Select departure airport"
            options={airports}
            value={departureAirport}
            onChange={onDepartureChange}
            searchable
            required
          />
        </div>

        <div className="space-y-2">
          <Select
            label="Arrival Airport"
            placeholder="Select arrival airport"
            options={airports}
            value={arrivalAirport}
            onChange={onArrivalChange}
            searchable
            required
          />
        </div>
      </div>
      {/* Swap Button */}
      <div className="flex justify-center">
        <button
          onClick={swapAirports}
          className="p-2 rounded-lg border border-border hover:bg-muted transition-smooth"
          disabled={!departureAirport || !arrivalAirport}
        >
          <Icon name="ArrowUpDown" size={20} />
        </button>
      </div>
      {/* Route Insights */}
      {routeInsights && (
        <div className="bg-muted rounded-lg p-4 space-y-4">
          <div className="flex items-center space-x-2">
            <Icon name="Route" size={20} className="text-primary" />
            <h3 className="font-semibold text-foreground">Route Analysis</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Distance</p>
              <p className="font-semibold text-foreground">{routeInsights?.distance}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Flight Time</p>
              <p className="font-semibold text-foreground">{routeInsights?.flightTime}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Demand</p>
              <p className={`font-semibold ${
                routeInsights?.demand === 'High' ? 'text-success' : 
                routeInsights?.demand === 'Medium' ? 'text-warning' : 'text-muted-foreground'
              }`}>
                {routeInsights?.demand}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Competition</p>
              <p className={`font-semibold ${
                routeInsights?.competition === 'Low' ? 'text-success' : 
                routeInsights?.competition === 'Medium' ? 'text-warning' : 'text-error'
              }`}>
                {routeInsights?.competition}
              </p>
            </div>
          </div>

          {/* Popular Categories */}
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Popular Categories</p>
            <div className="flex flex-wrap gap-2">
              {routeInsights?.popularCategories?.map((category, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Popular Products */}
      {popularProducts?.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Icon name="TrendingUp" size={20} className="text-accent" />
            <h3 className="font-semibold text-foreground">Popular Products on This Route</h3>
          </div>

          <div className="space-y-3">
            {popularProducts?.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium text-foreground">{product?.name}</p>
                  <p className="text-sm text-muted-foreground">Demand: {product?.demand}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{product?.avgPrice}</p>
                  <p className="text-xs text-muted-foreground">Avg. Price</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;