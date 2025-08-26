import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ProductImageUpload = ({ images = [], onImagesChange, maxImages = 5 }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (e?.type === "dragenter" || e?.type === "dragover") {
      setDragActive(true);
    } else if (e?.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e?.dataTransfer?.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e?.target?.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const validFiles = files?.filter(file => 
      file?.type?.startsWith('image/') && file?.size <= 5 * 1024 * 1024
    );

    if (images?.length + validFiles?.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    validFiles?.forEach((file, index) => {
      const fileId = Date.now() + index;
      
      // Simulate upload progress
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += 20;
          setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
          
          if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setUploadProgress(prev => {
                const newProgress = { ...prev };
                delete newProgress?.[fileId];
                return newProgress;
              });
              
              const newImage = {
                id: fileId,
                file,
                url: e?.target?.result,
                name: file?.name,
                size: file?.size
              };
              
              onImagesChange([...images, newImage]);
            }, 500);
          }
        }, 200);
      };
      reader?.readAsDataURL(file);
    });
  };

  const removeImage = (imageId) => {
    const updatedImages = images?.filter(img => img?.id !== imageId);
    onImagesChange(updatedImages);
  };

  const reorderImages = (fromIndex, toIndex) => {
    const updatedImages = [...images];
    const [movedImage] = updatedImages?.splice(fromIndex, 1);
    updatedImages?.splice(toIndex, 0, movedImage);
    onImagesChange(updatedImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="space-y-3">
          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto">
            <Icon name="Upload" size={24} className="text-muted-foreground" />
          </div>
          
          <div>
            <p className="text-sm font-medium text-foreground">
              Drop images here or click to upload
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG up to 5MB each. Maximum {maxImages} images.
            </p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef?.current?.click()}
          >
            Choose Files
          </Button>
        </div>
      </div>
      {/* Upload Progress */}
      {Object.keys(uploadProgress)?.length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress)?.map(([fileId, progress]) => (
            <div key={fileId} className="bg-muted rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-foreground">Uploading...</span>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <div className="w-full bg-background rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Image Preview Grid */}
      {images?.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images?.map((image, index) => (
            <div
              key={image?.id}
              className="relative group bg-muted rounded-lg overflow-hidden aspect-square"
            >
              <Image
                src={image?.url}
                alt={image?.name}
                className="w-full h-full object-cover"
              />
              
              {/* Primary Badge */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                  Primary
                </div>
              )}
              
              {/* Actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                {index > 0 && (
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => reorderImages(index, 0)}
                    className="w-8 h-8"
                  >
                    <Icon name="Star" size={14} />
                  </Button>
                )}
                
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => removeImage(image?.id)}
                  className="w-8 h-8"
                >
                  <Icon name="Trash2" size={14} />
                </Button>
              </div>
              
              {/* File Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2">
                <p className="text-xs truncate">{image?.name}</p>
                <p className="text-xs opacity-75">
                  {(image?.size / 1024 / 1024)?.toFixed(1)} MB
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Image Counter */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {images?.length} of {maxImages} images uploaded
        </p>
      </div>
    </div>
  );
};

export default ProductImageUpload;