import React, { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CreateIssueModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    status: 'To Do',
    category: 'Task',
    assignee: 'Unassigned'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Tên Issue không được để trống');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Gọi API POST tạo Issue
      const response = await axios.post('http://localhost:5000/api/issues', formData);
      toast.success('Tạo Issue thành công!');
      
      // Reset form & đóng
      setFormData({
        title: '',
        status: 'To Do',
        category: 'Task',
        assignee: 'Unassigned'
      });
      onClose();
    } catch (error) {
      console.error('Error creating issue:', error);
      toast.error('Có lỗi xảy ra khi tạo Issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Tạo Issue</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto w-full">
          <form id="create-issue-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Tên Issue */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên Issue <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Nhập phần tóm tắt cho issue..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Category (Loại Issue) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category (Loại Issue)</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Epic">Epic</option>
                  <option value="Story">Story</option>
                  <option value="Task">Task</option>
                  <option value="Bug">Bug</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Người thực hiện (Assignee)</label>
              <select
                name="assignee"
                value={formData.assignee}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Unassigned">Unassigned</option>
                <option value="User 1">User 1</option>
                <option value="User 2">User 2</option>
              </select>
            </div>
          </form>
        </div>

        <div className="flex items-center justify-end p-5 border-t border-gray-200 gap-3 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition"
            disabled={isSubmitting}
          >
            Hủy
          </button>
          <button
            type="submit"
            form="create-issue-form"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang tạo...' : 'Tạo Issue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateIssueModal;
