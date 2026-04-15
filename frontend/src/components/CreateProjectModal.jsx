import React, { useState } from 'react';
import { X } from 'lucide-react';
import apiClient from '../services/apiClient';
import { toast } from 'react-hot-toast';

const CreateProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
  const [formData, setFormData] = useState({ name: '', key: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiClient.post('/projects', formData);
      toast.success('Dự án đã được tạo thành công!');
      if (onProjectCreated) {
        onProjectCreated(res.data.data);
      }
      setFormData({ name: '', key: '', description: '' });
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Lỗi khi tạo dự án';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Tạo mới dự án</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="p-3 mb-4 rounded-md bg-red-50 text-red-600 text-sm border border-red-200 font-medium">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tên dự án <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="VD: Website Bán Hàng"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Từ khóa (Project Key) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="key"
                required
                value={formData.key}
                onChange={handleChange}
                placeholder="VD: ECOM"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase"
              />
              <p className="text-xs text-gray-500 mt-1">Từ khóa được dùng làm tiền tố đại diện cho Issue (VD: ECOM-1).</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Mô tả (Không bắt buộc)
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Nhập mô tả về mục tiêu của dự án..."
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name || !formData.key}
              className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Đang tạo...' : 'Khởi tạo Dự án'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
