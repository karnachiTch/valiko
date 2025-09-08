import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// use the central axios instance
import api from '../../api';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import RoleBasedNavigation from '../../components/ui/RoleBasedNavigation';
import ImageCarousel from './components/ImageCarousel';
import ProductInfo from './components/ProductInfo';
import TabbedContent from './components/TabbedContent';
import QuantitySelector from './components/QuantitySelector';
import SimilarProducts from './components/SimilarProducts';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const ProductDetailView = () => {
  const [quantity, setQuantity] = useState(1);
  const [isSaved, setIsSaved] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // جلب بيانات المنتج من الواجهة الخلفية
  const { id } = useParams();
  const [productData, setProductData] = useState(null);
  const [error, setError] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoadingProduct(true);
      setError(null);
      try {
        console.log('[ProductDetail] requesting product id=', id);
        const res = await api.get(`/api/products/${id}`);
        console.log('[ProductDetail] response status=', res.status, 'data=', res.data);

        // Normalize various API response shapes
        const payload = res.data;
        let prod = null;
        // If payload is an array, try to find by id
        if (Array.isArray(payload)) {
          prod = payload.find(p => String(p.id || p._id) === String(id));
        } else if (payload && (payload.products || payload.Results)) {
          const arr = payload.products || payload.Results;
          if (Array.isArray(arr)) prod = arr.find(p => String(p.id || p._id) === String(id));
        } else if (payload && (payload.product || payload.data)) {
          prod = payload.product || payload.data;
        } else if (payload && (payload.id || payload._id)) {
          prod = payload;
        }

        // If we found a wrapped product use it, otherwise set raw payload (may already be the product)
        setProductData(prod || payload);
      } catch (err) {
        console.error('[ProductDetail] direct fetch error', err?.response?.status, err?.message);
        // If server returned 404, try internal debug endpoint first
        if (err?.response?.status === 404) {
          try {
            console.log('[ProductDetail] trying internal endpoint /internal/products/${id}');
            const internalRes = await api.get(`/internal/products/${id}`);
            console.log('[ProductDetail] internal endpoint returned', internalRes.status, internalRes.data);
            setProductData(internalRes.data);
            return;
          } catch (internalErr) {
            console.warn('[ProductDetail] internal endpoint failed', internalErr?.response?.status, internalErr?.message);
            // fallback to fetching all products
            try {
              console.log('[ProductDetail] fallback: fetching all products');
              const listRes = await api.get('/api/products');
              const data = listRes.data || {};
              // Support multiple list shapes: data.products, data.Results, or raw array
              const arr = Array.isArray(data) ? data : (data.products || data.Results || []);
              console.log('[ProductDetail] products list length=', arr.length);
              const found = arr.find(p => {
                const pid = String(p.id || p._id);
                return pid === String(id);
              });
              if (found) {
                console.log('[ProductDetail] found product in list', found);
                setProductData(found);
              } else {
                setError('المنتج غير موجود');
              }
            } catch (listErr) {
              console.error('[ProductDetail] fallback list error', listErr);
              setError(listErr?.message || 'فشل في جلب قائمة المنتجات');
            }
          }
        } else {
          const message = err?.response?.data?.detail || err.message || 'Failed to fetch product';
          setError(message);
        }
      } finally {
        setLoadingProduct(false);
      }
    };
    load();
  }, [id]);

  // check if this product is already saved for the current user
  useEffect(() => {
    let mounted = true;
    const checkSaved = async () => {
      if (!productData || !productData.id) return;
      try {
        const res = await api.get('/api/saved-items');
        if (!mounted) return;
        const arr = res.data || [];
        const found = arr.find(s => String(s.product?.id || s.product_id || s.productId) === String(productData.id || productData._id));
        setIsSaved(!!found);
      } catch (e) {
        console.warn('[ProductDetail] could not check saved state', e);
      }
    };
    checkSaved();
    return () => { mounted = false };
  }, [productData]);

  const handleQuantityChange = (newQuantity) => {
    setQuantity(newQuantity);
  };

  if (loadingProduct) return <div className="p-8 text-center">Loading product...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!productData) return <div className="p-8 text-center">No product found.</div>;

  const handleSaveToggle = async () => {
    // toggle saved state via API
    try {
      if (!isSaved) {
        await api.post('/api/saved-items', { product_id: productData.id || productData._id });
        setIsSaved(true);
      } else {
        await api.delete('/api/saved-items', { data: { product_id: productData.id || productData._id } });
        setIsSaved(false);
      }
    } catch (e) {
      console.error('[ProductDetail] save toggle failed', e);
      // revert optimistic
      setIsSaved(prev => prev);
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleRequestProduct = async () => {
    setLoading(true);
    try {
      // استخراج معرف المسافر
      const travelerId = productData?.user_id || productData?.user?.id || productData?.traveler?.id;
      if (!travelerId) throw new Error('Traveler ID not found');
      // إرسال الطلب الحقيقي
      const res = await api.post('/api/requests', {
        product_id: productData?.id || productData?._id,
        traveler_id: travelerId,
        quantity: quantity || 1
      });
      setLoading(false);
      alert('Product request sent successfully!');
    } catch (err) {
      setLoading(false);
      alert('Failed to send product request: ' + (err?.response?.data?.detail || err.message));
    }
  };

  const handleMessageTraveler = async () => {
    try {
      setMessageLoading(true);
      // Debug log full product data
      console.log('[MessageTraveler] Product data:', productData);
      
      // Extract traveler ID - try all possible paths
      const travelerId = productData?.user_id || productData?.user?.id || productData?.traveler?.id;
      console.log('[MessageTraveler] Found traveler ID:', travelerId);
      
      if (!travelerId) {
        throw new Error('Could not find traveler information');
      }

      // Convert ObjectId string if needed
      const recipient_id = String(travelerId).replace(/^ObjectId\(['"](.+)['"]\)$/, '$1');
      console.log('[MessageTraveler] Sending recipient_id:', recipient_id);
      
      // Create or get existing conversation
      const createRes = await api.post('/api/messages/conversations', {
        recipient_id,
        product_id: String(productData.id || productData._id)
      });

      // Navigate to messaging with this conversation active
      const conversationId = createRes.data?._id || createRes.data?.id;
      navigate('/messaging-system', { state: { activeConversationId: conversationId } });
    } catch (err) {
      console.error('[ProductDetail] message traveler error:', err);
      alert('Could not start conversation. Please try again.');
    } finally {
      setMessageLoading(false);
    }
  };

  // زر الحجز الجديد
  const handleReserveProduct = async () => {
    setLoading(true);
    try {
      const productId = productData?.id || productData?._id;
      if (!productId) throw new Error('Product ID not found');
      // إرسال طلب الحجز
      const res = await api.post(`/api/products/${productId}/reserve`);
      setLoading(false);
      alert('تم حجز المنتج بنجاح!');
      // تحديث حالة المنتج محلياً
      setProductData(prev => ({ ...prev, status: 'reserved', buyer_id: 'me' }));
    } catch (err) {
      setLoading(false);
      alert('فشل في حجز المنتج: ' + (err?.response?.data?.detail || err.message));
    }
  };

  const totalPrice = (productData?.price * quantity)?.toFixed(2);

  return (
    <>
      <Helmet>
        <title>{productData?.title} - Valikoo</title>
        <meta name="description" content={productData?.description} />
      </Helmet>
      <div className="min-h-screen bg-background">
        <RoleBasedNavigation userRole="buyer" />
        
        <main className="pt-14 lg:pt-16 pb-20 lg:pb-8">
          <div className="container mx-auto px-4 py-4 lg:py-8">
            
            {/* Desktop Layout */}
            <div className="hidden lg:grid lg:grid-cols-2 lg:gap-12">
              {/* Left Column - Images */}
              <div className="space-y-6">
                <ImageCarousel images={productData?.images} />
              </div>

              {/* Right Column - Product Info */}
              <div className="space-y-6">
                <ProductInfo 
                  product={productData}
                  onSave={handleSaveToggle}
                  onShare={handleShare}
                  isSaved={isSaved}
                />
                
                <TabbedContent 
                  product={productData}
                  isDesktop={true}
                />

                {/* Quantity and Purchase Section */}
                <div className="bg-card rounded-lg border border-border p-6 space-y-6">
                  <QuantitySelector 
                    quantity={quantity}
                    maxQuantity={productData?.availability}
                    onChange={handleQuantityChange}
                  />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Price</p>
                      <p className="text-2xl font-bold text-foreground">
                        ${totalPrice}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Button
                        onClick={handleMessageTraveler}
                        loading={messageLoading}
                        variant="outline"
                        size="lg"
                        className="px-8"
                      >
                        <Icon name="MessageCircle" size={20} className="mr-2" />
                        Message Traveler
                      </Button>
                      <Button 
                        onClick={handleReserveProduct}
                        loading={loading}
                        size="lg"
                        className="px-8"
                        disabled={productData?.status === 'reserved'}
                      >
                        {productData?.status === 'reserved' ? 'محجوز' : 'حجز المنتج'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="lg:hidden space-y-4">
              {/* Image Carousel */}
              <ImageCarousel images={productData?.images} />
              
              {/* Product Info */}
              <ProductInfo 
                product={productData}
                onSave={handleSaveToggle}
                onShare={handleShare}
                isSaved={isSaved}
              />

              {/* Tabbed Content */}
              <TabbedContent 
                product={productData}
                isDesktop={false}
              />

              {/* Similar Products */}
              <SimilarProducts />
            </div>

            {/* Similar Products - Desktop Only */}
            <div className="hidden lg:block mt-12">
              <SimilarProducts />
            </div>
          </div>
        </main>

        {/* Sticky Bottom Section - Mobile Only */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-50">
          <div className="flex items-center space-x-4">
            <div className="flex-1 flex items-center space-x-3">
              <QuantitySelector 
                quantity={quantity}
                maxQuantity={productData?.availability}
                onChange={handleQuantityChange}
                compact={true}
              />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="font-bold text-foreground">${totalPrice}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleMessageTraveler}
                loading={messageLoading}
                variant="outline"
                size="sm"
              >
                <Icon name="MessageCircle" size={16} />
              </Button>
              <Button 
                onClick={handleReserveProduct}
                loading={loading}
                size="lg"
                className="px-6"
                disabled={productData?.status === 'reserved'}
              >
                {productData?.status === 'reserved' ? 'محجوز' : 'حجز المنتج'}
              </Button>
            </div>
          </div>
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg border border-border p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Share Product</h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowShareModal(false)}
                >
                  <Icon name="X" size={20} />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <button className="flex flex-col items-center space-y-2 p-4 rounded-lg border border-border hover:bg-muted">
                  <Icon name="Copy" size={24} />
                  <span className="text-sm text-foreground">Copy Link</span>
                </button>
                <button className="flex flex-col items-center space-y-2 p-4 rounded-lg border border-border hover:bg-muted">
                  <Icon name="Facebook" size={24} />
                  <span className="text-sm text-foreground">Facebook</span>
                </button>
                <button className="flex flex-col items-center space-y-2 p-4 rounded-lg border border-border hover:bg-muted">
                  <Icon name="Twitter" size={24} />
                  <span className="text-sm text-foreground">Twitter</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductDetailView;