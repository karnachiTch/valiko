import React, { useState } from 'react';
import AppImage from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const ImageCarousel = ({ images = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showZoom, setShowZoom] = useState(false);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images?.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images?.length) % images?.length);
  };

  const selectImage = (index) => {
    setCurrentIndex(index);
  };

  const toggleZoom = () => {
    setShowZoom(!showZoom);
  };

  if (!images || images?.length === 0) {
    return (
      <div className="bg-muted rounded-lg aspect-square flex items-center justify-center">
        <Icon name="ImageOff" size={48} className="text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative bg-muted rounded-lg overflow-hidden aspect-square">
        <AppImage
          src={images?.[currentIndex]}
          alt={`Product image ${currentIndex + 1}`}
          className="w-full h-full object-cover cursor-zoom-in"
          onClick={toggleZoom}
        />

        {/* Navigation Arrows */}
        {images?.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={prevImage}
            >
              <Icon name="ChevronLeft" size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={nextImage}
            >
              <Icon name="ChevronRight" size={20} />
            </Button>
          </>
        )}

        {/* Zoom Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-2 right-2 bg-white/80 hover:bg-white"
          onClick={toggleZoom}
        >
          <Icon name="ZoomIn" size={20} />
        </Button>

        {/* Image Counter */}
        {images?.length > 1 && (
          <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded-md text-sm">
            {currentIndex + 1} / {images?.length}
          </div>
        )}
      </div>

      {/* Thumbnail Images */}
      {images?.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {images?.map((image, index) => (
            <button
              key={index}
              className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden border-2 transition-smooth ${
                index === currentIndex
                  ? 'border-primary' :'border-border hover:border-primary/50'
              }`}
              onClick={() => selectImage(index)}
            >
              <AppImage
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Zoom Modal */}
      {showZoom && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <AppImage
              src={images?.[currentIndex]}
              alt={`Product image ${currentIndex + 1} - Zoomed`}
              className="max-w-full max-h-full object-contain"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white"
              onClick={toggleZoom}
            >
              <Icon name="X" size={24} />
            </Button>
            
            {/* Navigation in zoom mode */}
            {images?.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white"
                  onClick={prevImage}
                >
                  <Icon name="ChevronLeft" size={24} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white"
                  onClick={nextImage}
                >
                  <Icon name="ChevronRight" size={24} />
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;