import React, { useState, useEffect } from 'react';
import { X, Trash2, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import apiClient from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

const IssueDetailModal = ({ isOpen, onClose, issue, onUpdate }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ title: '', description: '', priority: 0, type: 'TASK', assigneeId: '' });
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (isOpen && issue) {
      setFormData({
        title: issue.title || '',
        description: issue.description || '',
        priority: issue.priority || 0,
        type: issue.type || 'TASK',
        assigneeId: issue.assigneeId || ''
      });
      fetchMembers();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, issue]);

  const fetchMembers = async () => {
    if (!issue?.projectId) return;
    try {
      const res = await apiClient.get(`/projects/${issue.projectId}/members`);
      setMembers(res.data?.data || []);
    } catch {
      toast.error('Lỗi tải danh sách thành viên dự án');
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await apiClient.put(`/issues/${issue.id}`, formData);
      toast.success('Cập nhật Issue thành công');
      onUpdate(res.data.data); // pass updated issue back
      onClose();
    } catch (error) {
       toast.error(error.message || 'Lỗi cập nhật');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa Issue này?')) return;
    setLoading(true);
    try {
      await apiClient.delete(`/issues/${issue.id}`);
      toast.success('Đã xóa Issue');
      onUpdate(null); // signal deletion
      onClose();
    } catch (error) {
       toast.error(error.message || 'Lỗi khi xóa');
    } finally {
      setLoading(false);
    }
  };

  const myRole = members.find(m => m.userId === user?.id)?.role;
  const isAdmin = myRole === 'ADMIN';

  if (!isOpen || !issue) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">
              {issue.project?.key}-{issue.id.slice(-4).toUpperCase()}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={22} />
            </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tiêu đề <span className="text-red-500">*</span></label>
              <input 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mô tả</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                rows={5} 
                placeholder="Thêm mô tả chi tiết cho công việc..."
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none" 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1.5">Người phụ trách (Assignee)</label>
                   <select 
                     name="assigneeId" 
                     value={formData.assigneeId} 
                     onChange={handleChange} 
                     className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                   >
                       <option value="">-- Chưa giao việc --</option>
                       {members.map(m => (
                         <option key={m.userId} value={m.userId}>{m.user.name}</option>
                       ))}
                   </select>
                </div>
                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1.5">Loại thẻ & Mức ưu tiên</label>
                   <div className="flex gap-2">
                     <select 
                       name="type" 
                       value={formData.type} 
                       onChange={handleChange} 
                       className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 font-medium"
                     >
                         <option value="EPIC">Epic</option>
                         <option value="STORY">Story</option>
                         <option value="TASK">Task</option>
                         <option value="BUG">Bug</option>
                     </select>
                     <select 
                       name="priority" 
                       value={formData.priority} 
                       onChange={(e) => setFormData({...formData, priority: +e.target.value})} 
                       className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                     >
                         <option value={0}>Lowest</option>
                         <option value={1}>Low</option>
                         <option value={2}>Medium</option>
                         <option value={3}>High</option>
                         <option value={4}>Highest</option>
                     </select>
                   </div>
                </div>
            </div>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-white">
            {isAdmin ? (
               <button 
                 onClick={handleDelete} 
                 disabled={loading}
                 className="text-red-600 font-medium flex items-center gap-1.5 hover:bg-red-50 py-2 px-3 rounded-md transition-colors disabled:opacity-50"
               >
                 <Trash2 size={18}/> Xóa thẻ
               </button>
            ) : (
               <div className="text-sm text-gray-400 italic">Chỉ ADMIN mới có thể xóa</div>
            )}
            <div className="flex gap-3">
                <button 
                  onClick={onClose} 
                  disabled={loading}
                  className="px-4 py-2 text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleUpdate} 
                  disabled={loading || !formData.title.trim()}
                  className="flex gap-2 items-center px-5 py-2 font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <Save size={18} /> Lưu thay đổi
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
export default IssueDetailModal;
