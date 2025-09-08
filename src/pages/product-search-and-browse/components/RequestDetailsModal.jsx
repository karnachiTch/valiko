
import React from 'react';

const RequestDetailsModal = ({ request, onClose }) => {
  if (!request) return null;
  // تحديد مصدر الصورة
  let imageSrc = null;
  if (request.image) {
    if (typeof request.image === 'string' && request.image.match(/^([A-Za-z0-9+/=]+)$/) && request.image.length > 100) {
      imageSrc = `data:image/jpeg;base64,${request.image}`;
    } else {
      imageSrc = request.image;
    }
  }
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 backdrop-blur-md">
      <div className="bg-white rounded-3xl shadow-2xl border-0 px-8 py-10 w-full max-w-lg relative animate-fade-in">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 transition-colors bg-white rounded-full shadow p-2"
          onClick={onClose}
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-2xl font-extrabold mb-6 text-center text-blue-700 tracking-tight drop-shadow-lg">Request Details</h2>
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            {imageSrc && (
              <img src={imageSrc} alt="Product" className="w-20 h-20 object-cover rounded-xl border-2 border-blue-200 shadow" />
            )}
            <div>
              <div className="font-bold text-lg text-blue-800">{request.product_name}</div>
              <div className="text-sm text-gray-500">{request.category}</div>
            </div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 shadow flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">Description:</span>
              <span className="text-gray-600">{request.description}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">Quantity:</span>
              <span className="text-blue-700 font-bold">{request.quantity}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">Request Type:</span>
              <span className="text-blue-600 font-bold">{request.type === 'buyer_request' ? 'Buyer' : 'Traveler'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailsModal;
