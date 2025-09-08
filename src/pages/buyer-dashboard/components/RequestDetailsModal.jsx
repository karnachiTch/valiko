import React from 'react';

const RequestDetailsModal = ({ request, onClose }) => {
  if (!request) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center min-h-screen bg-black/40 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-blue-100 px-6 py-8 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-xl font-extrabold mb-4 text-center text-blue-800">تفاصيل الطلب</h2>
        <div className="space-y-3">
          <div><strong>اسم المنتج:</strong> {request.product_name}</div>
          <div><strong>الوصف:</strong> {request.description}</div>
          <div><strong>الكمية:</strong> {request.quantity}</div>
          <div><strong>الفئة:</strong> {request.category}</div>
          <div><strong>نوع الطلب:</strong> {request.type === 'buyer_request' ? 'مشتري' : 'مسافر'}</div>
          {request.image && (
            <div>
              <strong>صورة المنتج:</strong><br />
              <img src={request.image} alt="Product" className="w-full h-40 object-contain rounded-lg border mt-2" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestDetailsModal;
