import React from 'react';
import AppImage from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SimilarProducts = () => {
  const similarProducts = [
    {
      id: '2',
      title: 'Korean Beauty Essentials',
      price: 65.99,
      originalPrice: 85.00,
      rating: 4.7,
      image: '/api/placeholder/200/200',
      traveler: 'Kim Min-jun',
      location: 'Seoul, Korea'
    },
    {
      id: '3',
      title: 'French Luxury Perfume Set',
      price: 149.99,
      originalPrice: 199.99,
      rating: 4.9,
      image: '/api/placeholder/200/201',
      traveler: 'Marie Dubois',
      location: 'Paris, France'
    },
    {
      id: '4',
      title: 'Italian Leather Accessories',
      price: 89.99,
      rating: 4.6,
      image: '/api/placeholder/200/202',
      traveler: 'Marco Rossi',
      location: 'Milan, Italy'
    },
    {
      id: '5',
      title: 'Swiss Watch Collection',
      price: 299.99,
      originalPrice: 399.99,
      rating: 4.8,
      image: '/api/placeholder/200/203',
      traveler: 'Hans Mueller',
      location: 'Zurich, Switzerland'
    }
  ];

  const ProductCard = ({ product }) => {
    const discountPercentage = product?.originalPrice 
      ? Math.round(((product?.originalPrice - product?.price) / product?.originalPrice) * 100)
      : 0;

    return (
      <div className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-card transition-smooth">
        {/* Product Image */}
        <div className="relative aspect-square bg-muted">
          <AppImage
            src={product?.image}
            alt={product?.title}
            className="w-full h-full object-cover"
          />
          {product?.originalPrice && (
            <div className="absolute top-2 left-2 bg-success text-success-foreground px-2 py-1 rounded-md text-xs font-medium">
              -{discountPercentage}%
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
          >
            <Icon name="Heart" size={16} />
          </Button>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
            {product?.title}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center space-x-2 mb-2">
            <div className="flex items-center space-x-1">
              <Icon name="Star" size={14} className="text-warning fill-current" />
              <span className="text-sm text-foreground">{product?.rating}</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-lg font-bold text-foreground">
              ${product?.price}
            </span>
            {product?.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${product?.originalPrice}
              </span>
            )}
          </div>

          {/* Traveler Info */}
          <div className="flex items-center space-x-2 mb-4 text-sm text-muted-foreground">
            <Icon name="User" size={14} />
            <span>{product?.traveler}</span>
          </div>
          <div className="flex items-center space-x-2 mb-4 text-sm text-muted-foreground">
            <Icon name="MapPin" size={14} />
            <span>{product?.location}</span>
          </div>

          {/* Action Button */}
          <Button variant="outline" size="sm" fullWidth>
            View Details
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Similar Products</h2>
        <Button variant="ghost" size="sm">
          <span className="mr-2">View All</span>
          <Icon name="ArrowRight" size={16} />
        </Button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {similarProducts?.map((product) => (
          <ProductCard key={product?.id} product={product} />
        ))}
      </div>

      {/* View More Button - Mobile Only */}
      <div className="lg:hidden">
        <Button variant="outline" fullWidth>
          <Icon name="Plus" size={16} className="mr-2" />
          Load More Products
        </Button>
      </div>
    </div>
  );
};

export default SimilarProducts;