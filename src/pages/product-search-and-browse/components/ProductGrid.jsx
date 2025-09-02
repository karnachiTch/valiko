import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import Icon from '../../../components/AppIcon';

const ProductGrid = ({ products, loading, onLoadMore = () => {}, hasMore }) => {
  const [savedProducts, setSavedProducts] = useState(new Set());

  const handleSaveProduct = (productId, isSaved) => {
    setSavedProducts(prev => {
      const newSet = new Set(prev);
      if (isSaved) {
        newSet?.add(productId);
      } else {
        newSet?.delete(productId);
      }
      return newSet;
    });
  };

  const handleRequestProduct = (productId) => {
    console.log('Requesting product:', productId);
    // Handle product request logic
  };

  // Skeleton loading component
  const ProductSkeleton = () => (
    <div className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
      <div className="h-48 bg-muted"></div>
      <div className="p-4 space-y-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-muted rounded-full"></div>
          <div className="flex-1 space-y-1">
            <div className="h-3 bg-muted rounded w-24"></div>
            <div className="h-2 bg-muted rounded w-16"></div>
          </div>
        </div>
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded w-full"></div>
          <div className="h-3 bg-muted rounded w-2/3"></div>
        </div>
        <div className="flex justify-between items-center">
          <div className="h-5 bg-muted rounded w-16"></div>
          <div className="h-8 bg-muted rounded w-20"></div>
        </div>
      </div>
    </div>
  );

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement?.scrollTop
        >= document.documentElement?.offsetHeight - 1000
  && hasMore && !loading
      ) {
  try { onLoadMore(); } catch (e) { /* noop */ }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading, onLoadMore]);

  if (products?.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Icon name="Search" size={24} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No products found
        </h3>
        <p className="text-muted-foreground max-w-md">
          Try adjusting your search criteria or filters to find more products.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 py-4 px-1">
        {products?.map((product) => (
          <div key={product?.id} className="h-full w-full flex">
            <ProductCard
              product={{
                ...product,
                isSaved: savedProducts?.has(product?.id)
              }}
              onSave={handleSaveProduct}
              onRequest={handleRequestProduct}
            />
          </div>
        ))}

        {/* Loading Skeletons */}
        {loading && (
          <>
            {Array.from({ length: 8 }, (_, index) => (
              <ProductSkeleton key={`skeleton-${index}`} />
            ))}
          </>
        )}
      </div>
      {/* Load More Button */}
      {hasMore && !loading && (
        <div className="flex justify-center pt-8">
          <button
            onClick={onLoadMore}
            className="flex items-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth"
          >
            <Icon name="Plus" size={16} />
            <span>Load More Products</span>
          </button>
        </div>
      )}
      {/* Loading Indicator */}
      {loading && products?.length > 0 && (
        <div className="flex justify-center py-8">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span>Loading more products...</span>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductGrid;