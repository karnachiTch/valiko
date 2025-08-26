import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ProductBasicInfo = ({ 
  productName, 
  onProductNameChange, 
  category, 
  onCategoryChange, 
  description, 
  onDescriptionChange 
}) => {
  const [characterCount, setCharacterCount] = useState(description?.length || 0);
  const maxNameLength = 100;
  const maxDescriptionLength = 2000;

  const categories = [
    { value: 'electronics', label: 'Electronics & Gadgets' },
    { value: 'fashion', label: 'Fashion & Clothing' },
    { value: 'beauty', label: 'Beauty & Cosmetics' },
    { value: 'food', label: 'Specialty Foods' },
    { value: 'books', label: 'Books & Media' },
    { value: 'toys', label: 'Toys & Games' },
    { value: 'sports', label: 'Sports & Outdoor' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'health', label: 'Health & Wellness' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'jewelry', label: 'Jewelry & Accessories' },
    { value: 'art', label: 'Art & Collectibles' },
    { value: 'music', label: 'Musical Instruments' },
    { value: 'other', label: 'Other' }
  ];

  const handleNameChange = (e) => {
    const value = e?.target?.value;
    if (value?.length <= maxNameLength) {
      onProductNameChange(value);
    }
  };

  const handleDescriptionChange = (e) => {
    const value = e?.target?.value;
    if (value?.length <= maxDescriptionLength) {
      onDescriptionChange(value);
      setCharacterCount(value?.length);
    }
  };

  const getDescriptionHelperText = () => {
    const remaining = maxDescriptionLength - characterCount;
    if (remaining < 100) {
      return `${remaining} characters remaining`;
    }
    return `${characterCount}/${maxDescriptionLength} characters`;
  };

  const formatText = (type) => {
    const textarea = document.querySelector('textarea[name="description"]');
    if (!textarea) return;

    const start = textarea?.selectionStart;
    const end = textarea?.selectionEnd;
    const selectedText = description?.substring(start, end);
    
    if (!selectedText) return;

    let formattedText = selectedText;
    switch (type) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'bullet':
        formattedText = `• ${selectedText}`;
        break;
      default:
        return;
    }

    const newDescription = description?.substring(0, start) + formattedText + description?.substring(end);
    onDescriptionChange(newDescription);
    setCharacterCount(newDescription?.length);
  };

  return (
    <div className="space-y-6">
      {/* Product Name */}
      <div className="space-y-2">
        <Input
          label="Product Name"
          type="text"
          placeholder="Enter product name (e.g., iPhone 15 Pro Max 256GB)"
          value={productName}
          onChange={handleNameChange}
          required
          description={`${productName?.length || 0}/${maxNameLength} characters`}
        />
      </div>
      {/* Category */}
      <div className="space-y-2">
        <Select
          label="Product Category"
          placeholder="Select a category"
          options={categories}
          value={category}
          onChange={onCategoryChange}
          searchable
          required
          description="Choose the most relevant category for your product"
        />
      </div>
      {/* Description */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          Product Description *
        </label>
        
        {/* Formatting Toolbar */}
        <div className="flex items-center space-x-2 p-2 bg-muted rounded-t-lg border border-b-0 border-border">
          <button
            type="button"
            onClick={() => formatText('bold')}
            className="p-1.5 rounded hover:bg-background transition-smooth"
            title="Bold"
          >
            <Icon name="Bold" size={16} />
          </button>
          <button
            type="button"
            onClick={() => formatText('italic')}
            className="p-1.5 rounded hover:bg-background transition-smooth"
            title="Italic"
          >
            <Icon name="Italic" size={16} />
          </button>
          <button
            type="button"
            onClick={() => formatText('bullet')}
            className="p-1.5 rounded hover:bg-background transition-smooth"
            title="Bullet Point"
          >
            <Icon name="List" size={16} />
          </button>
          <div className="w-px h-4 bg-border mx-2" />
          <span className="text-xs text-muted-foreground">
            Select text to format
          </span>
        </div>

        <textarea
          name="description"
          placeholder={`Provide detailed information about your product including:\n\n• Brand and model details\n• Condition (new/used)\n• Key features and specifications\n• Why this product is special or hard to find\n• Any warranties or guarantees\n• Purchase location and authenticity`}
          value={description}
          onChange={handleDescriptionChange}
          rows={8}
          required
          className="w-full px-3 py-2 border border-border rounded-b-lg rounded-t-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
        />
        
        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            Provide detailed information to help buyers make informed decisions
          </p>
          <p className={`text-xs ${
            characterCount > maxDescriptionLength * 0.9 
              ? 'text-warning' :'text-muted-foreground'
          }`}>
            {getDescriptionHelperText()}
          </p>
        </div>
      </div>
      {/* Description Preview */}
      {description && description?.length > 50 && (
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Icon name="Eye" size={16} className="text-primary" />
            <span className="font-medium text-foreground">Description Preview</span>
          </div>
          <div className="prose prose-sm max-w-none">
            <div className="text-sm text-foreground whitespace-pre-wrap">
              {description?.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')?.replace(/\*(.*?)\*/g, '<em>$1</em>')?.split('\n')?.map((line, index) => (
                  <p key={index} dangerouslySetInnerHTML={{ __html: line || '<br>' }} />
                ))
              }
            </div>
          </div>
        </div>
      )}
      {/* Tips */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Icon name="Lightbulb" size={16} className="text-primary mt-0.5" />
          <div>
            <h4 className="font-medium text-primary mb-2">Tips for Better Listings</h4>
            <ul className="text-sm text-foreground space-y-1">
              <li>• Include specific brand names and model numbers</li>
              <li>• Mention if the product is exclusive or limited edition</li>
              <li>• Describe the condition and any included accessories</li>
              <li>• Explain why this product is valuable or hard to find locally</li>
              <li>• Add information about authenticity and purchase receipts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductBasicInfo;