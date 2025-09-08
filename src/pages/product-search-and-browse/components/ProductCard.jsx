import React, { useState } from 'react';
import CreateProductRequestForm from '../../buyer-dashboard/components/CreateProductRequestForm';
import RequestDetailsModal from './RequestDetailsModal';
import api from '../../../api';
import useAuth from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ProductCard = ({ product, onSave, onRequest }) => {
  const [isSaved, setIsSaved] = useState(product?.isSaved || false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsData, setDetailsData] = useState(null);
  const navigate = useNavigate();

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave(product?.id, !isSaved);
  };

  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    })?.format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Icon
        key={index}
        name="Star"
        size={12}
        className={index < rating ? 'text-accent fill-current' : 'text-muted-foreground'}
      />
    ));
  };

  const { user } = useAuth();
  const isBuyerOwner = product?.type === 'buyer_request' && user && (product?.buyer_id === user?._id || product?.buyer?._id === user?._id) && user?.role !== 'traveler';

  return (
    <div
      className={`border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group w-full h-full flex flex-col justify-between relative ${product?.type === 'buyer_request' ? 'bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200 border-yellow-400 ring-2 ring-yellow-200' : 'bg-white border-gray-100'}`}
      onClick={() => {
        // إذا كان العنصر طلب مشتري، لا توجه لأي صفحة
        if (product?.type !== 'buyer_request') {
          navigate(`/product-detail-view/${product?.id}`);
        }
      }}
      style={{ minHeight: 440 }}
    >
      {/* شارة وأيقونة مميزة لطلبات المشترين */}
      {product?.type === 'buyer_request' && (
        <>
          <div className="absolute top-3 left-4 flex items-center gap-2 z-20">
            <div className="px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full shadow flex items-center gap-1">
              <Icon name="UserCheck" size={16} className="mr-1" />
              Buyer Request
            </div>
          </div>
        </>
      )}
      {/* صورة المنتج */}
      <div className={`relative h-60 overflow-hidden flex items-center justify-center ${product?.type === 'buyer_request' ? 'bg-yellow-50' : 'bg-gray-50'}`}>
        {product?.type === 'buyer_request' ? (
          <Image
            src={
              product?.image && product?.image.data
                ? `data:${product?.image.content_type};base64,${product?.image.data}`
                : (product?.image && typeof product?.image === 'string' && product?.image !== 'request'
                    ? (product?.image.startsWith('static/') ? `/${product?.image}`
                      : product?.image.match(/^([A-Za-z0-9+/=]+)$/) && product?.image.length > 100
                        ? `data:image/jpeg;base64,${product?.image}`
                        : product?.image)
                    : "https://placehold.co/400x300?text=No+Image")
            }
            alt={product?.name || product?.product_name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            onError={e => { e.target.onerror=null; e.target.src="https://placehold.co/400x300?text=No+Image"; }}
          />
        ) : (
          <Image
            src={product?.image && product?.image !== 'request' ? product?.image : "https://placehold.co/400x300?text=No+Image"}
            alt={product?.name || product?.product_name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            onError={e => { e.target.onerror=null; e.target.src="https://placehold.co/400x300?text=No+Image"; }}
          />
        )}
        <button
          onClick={e => { e.stopPropagation(); handleSave(); }}
          className="absolute top-3 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full shadow hover:bg-white transition"
          style={{ zIndex: 21 }}
        >
          <Icon
            name="Heart"
            size={15}
            className={isSaved ? 'text-red-500 fill-current' : 'text-gray-300'}
          />
        </button>
        {product?.isUrgent && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow">
            عاجل
          </div>
        )}
      </div>
      {/* معلومات المنتج */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        {/* تفاصيل طلب المشتري */}
        {product?.type === 'buyer_request' ? (
          <>
            {/* صورة المنتج بالأعلى */}
            {/* ...existing code for product image... */}
            <div className="p-4 flex flex-col flex-1 justify-between">
              {/* صف صورة واسم المشتري */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-yellow-400">
                  <Image
                    src={product?.buyer?.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(product?.buyer?.fullName || product?.buyer?.name || "Buyer")}
                    alt={product?.buyer?.fullName || product?.buyer?.name || "Buyer"}
                    className="w-full h-full object-cover"
                    onError={e => { e.target.onerror=null; e.target.src="https://ui-avatars.com/api/?name=Buyer"; }}
                  />
                </div>
                <span className="font-bold text-yellow-700 text-base">{product?.buyer?.fullName || product?.buyer?.name || "مشتري مجهول"}</span>
              </div>
              {/* بيانات المنتج بشكل عمودي */}
              <div className="flex flex-col gap-2 items-start">
                <div className="flex items-center gap-2">
                  <Icon name="shopping-bag" size={18} className="text-yellow-600" />
                  <span className="font-bold text-lg text-yellow-700">{product?.product_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Tag" size={15} className="text-gray-500" />
                  <span className="text-sm text-gray-700">الفئة: {product?.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Layers" size={15} className="text-gray-500" />
                  <span className="text-sm text-gray-700">الكمية: {product?.quantity}</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* معلومات المسافر */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
                <Image
                  src={product?.traveler?.avatar || (product?.traveler?.fullName || product?.traveler?.name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(product?.traveler?.fullName || product?.traveler?.name)}` : "https://ui-avatars.com/api/?name=Traveler")}
                  alt={product?.traveler?.name || "Traveler"}
                  className="w-full h-full object-cover"
                  onError={e => { e.target.onerror=null; e.target.src="https://ui-avatars.com/api/?name=Traveler"; }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {product?.traveler?.fullName || product?.traveler?.name || 'Traveler'}
                </p>
                <div className="flex items-center gap-1">
                  {getRatingStars(product?.traveler?.rating)}
                  <span className="text-xs text-gray-400 ml-1">
                    ({product?.traveler?.reviewCount})
                  </span>
                </div>
              </div>
            </div>
            {/* تفاصيل المنتج */}
            <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
              {product?.name}
            </h3>
            <div className="space-y-2 mb-4">
              {/* خط الرحلة */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Icon name="MapPin" size={15} />
                <span>{product?.route?.from} → {product?.route?.to}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Icon name="Calendar" size={15} />
                <span>{formatDate(product?.travelDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Icon name="Package" size={15} />
                <span>{product?.quantity} متوفر</span>
              </div>
            </div>
          </>
        )}
        {/* السعر والأزرار */}
        <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
          {product?.type !== 'buyer_request' && (
            <div>
              <p className="text-xl font-bold text-blue-600">
                {formatPrice(product?.price, product?.currency)}
              </p>
              {product?.originalPrice && (
                <p className="text-sm text-gray-400 line-through">
                  {formatPrice(product?.originalPrice, product?.currency)}
                </p>
              )}
            </div>
          )}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={async e => {
                e.stopPropagation();
                // إذا كان العنصر طلب مشتري، أظهر نافذة التفاصيل للجميع
                if (product?.type === 'buyer_request') {
                  try {
                    const res = await api.get(`/api/requests/${product?.id}`);
                    setDetailsData(res.data);
                    setShowDetailsModal(true);
                  } catch {
                    alert('تعذر جلب تفاصيل الطلب');
                  }
                } else {
                  navigate(`/product-detail-view/${product?.id}`);
                }
              }}
            >
              عرض التفاصيل
            </Button>
            {/* زر تعديل الطلب يظهر فقط لصاحب الطلب */}
            {/* زر تعديل الطلب يظهر فقط لصاحب الطلب */}
            {isBuyerOwner && (
              <>
                <Button
                  variant="default"
                  size="sm"
                  iconName="Edit"
                  onClick={async e => {
                    e.stopPropagation();
                    // جلب بيانات الطلب من /api/requests/{id}
                    try {
                      const res = await api.get(`/api/requests/${product?.id}`);
                      const req = res.data;
                      setEditData({
                        productName: req?.product_name,
                        description: req?.description,
                        quantity: req?.quantity,
                        category: req?.category,
                        image: req?.image,
                        type: req?.type || 'buyer_request',
                        travelerId: req?.traveler_id || '',
                        productId: req?._id || product?.id,
                      });
                      setShowEditModal(true);
                    } catch (err) {
                      alert('تعذر جلب بيانات الطلب للتعديل');
                    }
                  }}
                >
                  تعديل الطلب
                </Button>
                {showEditModal && (
                  <CreateProductRequestForm
                    initialData={editData}
                    editMode={true}
                    onRequestCreated={() => setShowEditModal(false)}
                    onClose={() => setShowEditModal(false)}
                  />
                )}
              </>
            )}
            {/* نافذة تفاصيل الطلب تظهر للجميع */}
            {showDetailsModal && (
              <RequestDetailsModal
                request={detailsData}
                onClose={() => setShowDetailsModal(false)}
              />
            )}
            {/* إخفاء زر الطلب إذا كان طلب مشتري */}
            {product?.type !== 'buyer_request' && (
              <Button
                variant="default"
                size="sm"
                onClick={e => { e.stopPropagation(); onRequest(product?.id); }}
                iconName="MessageCircle"
                iconPosition="left"
              >
                طلب
              </Button>
            )}
          </div>
        </div>
        {/* خيارات الاستلام */}
        {product?.pickupOptions && product?.pickupOptions?.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {product?.pickupOptions?.map((option, index) => {
                const label =
                  typeof option === 'string'
                    ? option
                    : option?.label || option?.name || option?.type || JSON.stringify(option);
                return (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full font-semibold"
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;