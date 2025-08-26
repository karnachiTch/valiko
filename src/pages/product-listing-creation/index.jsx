import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleBasedNavigation from '../../components/ui/RoleBasedNavigation';
import ContextualActionBar from '../../components/ui/ContextualActionBar';
import ProductBasicInfo from './components/ProductBasicInfo';
import ProductImageUpload from './components/ProductImageUpload';
import PricingCalculator from './components/PricingCalculator';
import LocationSelector from './components/LocationSelector';
import TravelDetailsForm from './components/TravelDetailsForm';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import api from '../../api';

import { useLocation } from 'react-router-dom';
const ProductListingCreation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [user, setUser] = useState(null);
  // Detect edit mode from URL
  const searchParams = new URLSearchParams(location.search);
  const editId = searchParams.get('edit');

  // ✅ تعريف الخطوات (كان ناقص)
  const steps = [
    { id: 1, title: 'Basic Info', icon: 'Info' },
    { id: 2, title: 'Images', icon: 'Image' },
    { id: 3, title: 'Pricing', icon: 'DollarSign' },
    { id: 4, title: 'Travel Details', icon: 'Plane' }
  ];

  // ✅ Form state
  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    description: '',
    images: [],
    basePrice: '',
    currency: 'USD',
    departureAirport: '',
    arrivalAirport: '',
    travelDates: {
      departure: '',
      arrival: ''
    },
    pickupOptions: [],
    quantity: 1,
    isActive: true
  });

  // إذا كان هناك editId، اجلب بيانات المنتج واملأ الحقول
  useEffect(() => {
    const fetchProductForEdit = async () => {
      if (!editId) return;
      setIsLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await api.get(`/api/products/${editId}`, { headers });
        const p = res.data;
        setFormData({
          productName: p.title || '',
          category: p.category || '',
          description: p.description || '',
          images: p.images ? (Array.isArray(p.images) ? p.images : [p.images]) : [],
          basePrice: p.price ? String(p.price) : '',
          currency: p.currency || 'USD',
          departureAirport: p.departureAirport || '',
          arrivalAirport: p.arrivalAirport || '',
          travelDates: {
            departure: p.travelDates?.departure || p.travelDates?.start || '',
            arrival: p.travelDates?.arrival || p.travelDates?.end || ''
          },
          pickupOptions: p.pickupOptions || [],
          quantity: p.quantity || 1,
          isActive: typeof p.isActive === 'boolean' ? p.isActive : true
        });
      } catch (e) {
        // إذا فشل الجلب، أبقِ القيم فارغة
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductForEdit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  // ✅ Auto-save functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (isDirty) {
        saveDraft();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [isDirty, formData]);

  // ✅ جلب بيانات المستخدم من API (مرة وحدة فقط)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/api/auth/me');
        setUser(res.data);
      } catch (err) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
  };

  const saveDraft = async () => {
    try {
      if (editId) {
        // إذا كنا في وضع التعديل، احفظ التعديلات مباشرة في قاعدة البيانات
        const token = localStorage.getItem('accessToken');
        const headers = { Authorization: `Bearer ${token}` };
        const productData = {
          title: formData.productName,
          description: formData.description,
          price: parseFloat(formData.basePrice) || 0,
          image: formData.images[0] || "",
          category: formData.category,
          quantity: formData.quantity,
          currency: formData.currency,
          departureAirport: formData.departureAirport,
          arrivalAirport: formData.arrivalAirport,
          travelDates: formData.travelDates,
          pickupOptions: formData.pickupOptions,
          isActive: formData.isActive
        };
        await api.patch(`/api/products/${editId}`, productData, { headers });
        setIsDirty(false);
        navigate('/traveler-dashboard', { state: { message: 'Product updated successfully!' } });
      } else {
        // إذا كنا في وضع إضافة جديد، احفظ مسودة محلياً
        localStorage.setItem('product-listing-draft', JSON.stringify({
          ...formData,
          lastSaved: new Date().toISOString()
        }));
        setIsDirty(false);
      }
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };

  const loadDraft = () => {
    try {
      const draft = localStorage.getItem('product-listing-draft');
      if (draft) {
        const parsedDraft = JSON.parse(draft);
        setFormData(parsedDraft);
        return true;
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
    return false;
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.productName && formData.category && formData.description;
      case 2:
        return formData.images.length > 0;
      case 3:
        return formData.basePrice && formData.currency;
      case 4:
        return formData.departureAirport && formData.arrivalAirport &&
               formData.travelDates.departure && formData.travelDates.arrival;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handlePublish = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const headers = { Authorization: `Bearer ${token}` };

      const productData = {
        title: formData.productName,
        description: formData.description,
        price: parseFloat(formData.basePrice) || 0,
        image: formData.images[0] || "",
        category: formData.category,
        quantity: formData.quantity,
        currency: formData.currency,
        departureAirport: formData.departureAirport,
        arrivalAirport: formData.arrivalAirport,
        travelDates: formData.travelDates,
        pickupOptions: formData.pickupOptions,
        isActive: formData.isActive,
        traveler: {
          fullName: user?.fullName,
          avatar: user?.avatar || "https://ui-avatars.com/api/?name=" + (user?.fullName || "Traveler"),
          rating: user?.rating || 4,
          reviewCount: user?.reviewCount || 12
        }
      };

      if (editId) {
        // تعديل منتج موجود: أرسل id مع البيانات إلى /api/products
        await api.post('/api/products', { ...productData, id: editId }, { headers });
      } else {
        // إضافة منتج جديد
        await api.post('/api/products', productData, { headers });
      }

      localStorage.removeItem('product-listing-draft');
      navigate('/traveler-dashboard', { 
        state: { message: editId ? 'Product updated successfully!' : 'Product listing published successfully!' }
      });
    } catch (error) {
      console.error('Failed to publish listing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
      return;
    }
    navigate('/traveler-dashboard');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <ProductBasicInfo
            productName={formData.productName}
            onProductNameChange={(value) => updateFormData('productName', value)}
            category={formData.category}
            onCategoryChange={(value) => updateFormData('category', value)}
            description={formData.description}
            onDescriptionChange={(value) => updateFormData('description', value)}
          />
        );
      case 2:
        return (
          <ProductImageUpload
            images={formData.images}
            onImagesChange={(value) => updateFormData('images', value)}
          />
        );
      case 3:
        return (
          <PricingCalculator
            basePrice={formData.basePrice}
            onBasePriceChange={(value) => updateFormData('basePrice', value)}
            currency={formData.currency}
            onCurrencyChange={(value) => updateFormData('currency', value)}
            departureAirport={formData.departureAirport}
            arrivalAirport={formData.arrivalAirport}
            category={formData.category}
          />
        );
      case 4:
        return (
          <div className="space-y-8">
            <LocationSelector
              departureAirport={formData.departureAirport}
              arrivalAirport={formData.arrivalAirport}
              onDepartureChange={(value) => updateFormData('departureAirport', value)}
              onArrivalChange={(value) => updateFormData('arrivalAirport', value)}
            />
            <TravelDetailsForm
              travelDates={formData.travelDates}
              onTravelDatesChange={(value) => updateFormData('travelDates', value)}
              pickupOptions={formData.pickupOptions || []}
              onPickupOptionsChange={(value) => updateFormData('pickupOptions', value)}
              quantity={formData.quantity}
              onQuantityChange={(value) => updateFormData('quantity', value)}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNavigation userRole="traveler" user={user} />
      <div className="pt-16 lg:pt-16">
        <ContextualActionBar
          title="Create Product Listing"
          showBackButton={true}
          onSave={saveDraft}
          onCancel={handleCancel}
          isDirty={isDirty}
          isLoading={isLoading}
          actions={[{ label: 'Save Draft', onClick: saveDraft, icon: 'Save', variant: 'outline' }]}
        />

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* ✅ Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center">
                      <button
                        onClick={() => setCurrentStep(step.id)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-smooth ${
                          currentStep === step.id
                            ? 'bg-primary text-primary-foreground'
                            : currentStep > step.id
                            ? 'bg-success text-success-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {currentStep > step.id ? (
                          <Icon name="Check" size={16} />
                        ) : (
                          <Icon name={step.icon} size={16} />
                        )}
                      </button>
                      <span className={`text-xs mt-2 ${
                        currentStep === step.id ? 'text-primary font-medium' : 'text-muted-foreground'
                      }`}>
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-px mx-4 ${
                        currentStep > step.id ? 'bg-success' : 'bg-border'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="bg-card border border-border rounded-lg p-6 mb-8">
              {renderStepContent()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                iconName="ChevronLeft"
                iconPosition="left"
              >
                Previous
              </Button>

              <div className="flex items-center space-x-3">
                {currentStep === steps.length ? (
                  <Button
                    variant="default"
                    onClick={handlePublish}
                    loading={isLoading}
                    iconName="Send"
                    iconPosition="left"
                  >
                    Publish Listing
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    onClick={handleNext}
                    disabled={!validateStep(currentStep)}
                    iconName="ChevronRight"
                    iconPosition="right"
                  >
                    Next
                  </Button>
                )}
              </div>
            </div>

            {/* Preview Modal */}
            {showPreview && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-card rounded-xl shadow-lg max-w-lg w-full p-8 relative">
                  <button className="absolute top-4 right-4 text-muted-foreground" onClick={() => setShowPreview(false)}>
                    <Icon name="X" size={20} />
                  </button>
                  <h2 className="text-xl font-bold mb-4">Preview Listing</h2>
                  <div className="space-y-4">
                    <div>
                      <span className="font-semibold">Product Name:</span> {formData.productName}
                    </div>
                    <div>
                      <span className="font-semibold">Category:</span> {formData.category}
                    </div>
                    <div>
                      <span className="font-semibold">Description:</span> {formData.description}
                    </div>
                    <div>
                      <span className="font-semibold">Price:</span> {formData.basePrice} {formData.currency}
                    </div>
                    <div>
                      <span className="font-semibold">Quantity:</span> {formData.quantity}
                    </div>
                    <div>
                      <span className="font-semibold">Departure Airport:</span> {formData.departureAirport}
                    </div>
                    <div>
                      <span className="font-semibold">Arrival Airport:</span> {formData.arrivalAirport}
                    </div>
                    <div>
                      <span className="font-semibold">Travel Dates:</span> {formData.travelDates.departure} → {formData.travelDates.arrival}
                    </div>
                    <div>
                      <span className="font-semibold">Pickup Options:</span> {formData.pickupOptions.join(', ')}
                    </div>
                    <div>
                      <span className="font-semibold">Images:</span> {formData.images.length} uploaded
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="h-20 lg:hidden" />
    </div>
  );
};

export default ProductListingCreation;
