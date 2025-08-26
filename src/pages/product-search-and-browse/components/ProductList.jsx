import React from 'react';
import ProductCard from './ProductCard';

const ProductList = ({ products, loading }) => {
  if (products?.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
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
    <div className="space-y-4">
      {products?.map((product) => (
        <div key={product?.id} className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row gap-4 hover:shadow-card transition-smooth">
          <ProductCard product={product} />
        </div>
      ))}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span>Loading more products...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
