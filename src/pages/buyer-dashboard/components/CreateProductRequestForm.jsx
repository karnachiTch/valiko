import React, { useState } from 'react';
import api from '../../../api';

const categories = [
  'Electronics',
  'Clothing',
  'Food',
  'Books',
  'Home Supplies',
  'Toys',
  'Cosmetics',
  'Other'
];

const CreateProductRequestForm = ({ onRequestCreated, onClose, initialData = null, editMode = false }) => {
  const [form, setForm] = useState(() => initialData ? { ...initialData } : {
    productName: '',
    description: '',
    quantity: 1,
    category: '',
    image: null,
    type: 'buyer_request',
    travelerId: '',
    productId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setForm(f => ({ ...f, image: files && files[0] ? files[0] : f.image }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      if (form.type === 'traveler_request') {
        // طلب خاص بالمسافر
        if (form.productId) formData.append('product_id', form.productId);
        if (form.travelerId) formData.append('traveler_id', form.travelerId);
        formData.append('quantity', form.quantity);
        const res = await api.post('/api/requests/traveler', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (onRequestCreated) onRequestCreated(res.data.request);
      } else {
        // طلب خاص بالمشتري
        formData.append('product_name', form.productName);
        formData.append('description', form.description);
        formData.append('quantity', form.quantity);
        formData.append('category', form.category);
        if (form.image) formData.append('image', form.image);
        if (editMode && form.productId) {
          // تعديل الطلب: استخدم PATCH بدلاً من POST
          const res = await api.patch(`/api/requests/${form.productId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          if (onRequestCreated) onRequestCreated(res.data.request);
        } else {
          // إنشاء طلب جديد
          const res = await api.post('/api/requests', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          if (onRequestCreated) onRequestCreated(res.data.request);
        }
      }
      setForm({ productName: '', description: '', quantity: 1, category: '', image: null, type: 'buyer_request', travelerId: '', productId: '' });
    } catch (err) {
      setError(err?.response?.data?.detail || 'An error occurred while submitting your request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center min-h-screen bg-black/40 backdrop-blur-md overflow-y-auto">
      <form className="mt-16 w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-blue-100 px-4 py-6 animate-fade-in space-y-4" onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="flex flex-col items-center mb-3">
          <div className="flex items-center gap-2 mb-1">
          </div>
          <h2 className="text-xl font-extrabold mb-1 text-center text-blue-800 tracking-tight">{editMode ? 'Edit Product Order' : 'New Product Request'}</h2>
          <p className="text-gray-500 text-center mb-2 text-xs">Please fill all fields accurately for best experience.</p>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="block text-gray-700 text-sm font-medium mb-1">Product Name</label>
              <input
                type="text"
                name="productName"
                value={form.productName}
                onChange={handleChange}
                className="input input-bordered w-full h-11 text-base px-4 bg-white border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg transition-all"
                required
                autoComplete="off"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="block text-gray-700 text-sm font-medium mb-1">Quantity</label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                min={1}
                className="input input-bordered w-full h-11 text-base px-4 bg-white border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg transition-all"
                required
              />
            </div>
            <div className="flex flex-col gap-1 col-span-1 md:col-span-2">
              <label className="block text-gray-700 text-sm font-medium mb-1">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="select select-bordered w-full h-11 text-base px-4 bg-white border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg transition-all"
                required
              >
                <option value="" disabled>Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1 col-span-1 md:col-span-2">
              <label className="block text-gray-700 text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="textarea textarea-bordered w-full h-20 text-base px-4 bg-white border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg transition-all resize-none"
                required
              />
            </div>
            <div className="flex flex-col gap-1 col-span-1 md:col-span-2">
              <label className="block text-gray-700 font-medium mb-1 text-sm">Product Image</label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="file-input file-input-bordered w-full rounded-lg border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm"
              />
            </div>
          </div>
         
          {form.type === 'traveler_request' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="text"
                  name="travelerId"
                  value={form.travelerId}
                  onChange={handleChange}
                  placeholder=" "
                  className="peer input input-bordered w-full h-11 text-base px-4 pt-4 bg-white border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg transition-all"
                />
                <label className="absolute left-4 top-2 text-gray-500 text-sm font-medium pointer-events-none transition-all peer-focus:-top-3 peer-focus:text-blue-700 peer-focus:text-xs peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 bg-white px-1">معرف المسافر / Traveler ID</label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  name="productId"
                  value={form.productId}
                  onChange={handleChange}
                  placeholder=" "
                  className="peer input input-bordered w-full h-11 text-base px-4 pt-4 bg-white border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg transition-all"
                />
                <label className="absolute left-4 top-2 text-gray-500 text-sm font-medium pointer-events-none transition-all peer-focus:-top-3 peer-focus:text-blue-700 peer-focus:text-xs peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 bg-white px-1">معرف المنتج / Product ID</label>
              </div>
            </div>
          )}
          {error && <div className="text-red-500 text-center font-bold mb-3 animate-pulse text-base shadow-sm border border-red-200 rounded-lg py-1">{error}</div>}
          <div className="flex gap-2 mt-4">
            <button type="submit" className="btn btn-primary flex-1 py-2 text-base font-bold shadow-md rounded-lg transition-all hover:bg-blue-700 hover:scale-105" disabled={loading}>
              {loading ? 'جاري الإرسال...' : editMode ? 'Update Request' : 'Submit Request'}
            </button>
            <button type="button" className="btn btn-secondary flex-1 py-2 text-base font-bold shadow-md rounded-lg transition-all hover:bg-gray-200 hover:scale-105" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateProductRequestForm;
