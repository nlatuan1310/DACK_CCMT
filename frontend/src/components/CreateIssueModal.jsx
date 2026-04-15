import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createIssue, getProjectMembers, getProjects } from '../services/issueApi';

// ── Mapping UI label → Backend enum ───────────────────────────
const STATUS_OPTIONS = [
  { label: 'To Do',       value: 'TODO' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Test',        value: 'TEST' },
  { label: 'Done',        value: 'DONE' },
];

const TYPE_OPTIONS = [
  { label: 'Task',  value: 'TASK' },
  { label: 'Story', value: 'STORY' },
  { label: 'Epic',  value: 'EPIC' },
];

// ── Component ──────────────────────────────────────────────────
const CreateIssueModal = ({ isOpen, onClose, onCreated, defaultProjectId }) => {
  const [formData, setFormData] = useState({
    title:       '',
    description: '',
    type:        'TASK',
    status:      'TODO',
    projectId:   '',
    assigneeId:  '',
  });

  const [users,       setUsers]       = useState([]);
  const [projects,    setProjects]    = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchError,  setFetchError]  = useState('');

  // Fetch users & projects khi modal mở
  useEffect(() => {
    if (!isOpen) return;

    const fetchMeta = async () => {
      setLoadingMeta(true);
      setFetchError('');
      try {
        const projectsRes = await getProjects();
        
        // Chỉ lấy những dự án mà user là ADMIN
        const myProjects = projectsRes.data ?? [];
        const adminProjects = myProjects.filter(p => 
          p.members?.some(m => m.role === 'ADMIN')
        );
        
        setProjects(adminProjects);

        // Pre-fill projectId nếu có truyền vào context
        if (defaultProjectId) {
          setFormData((prev) => ({
            ...prev,
            projectId: defaultProjectId,
          }));
        } else if (adminProjects.length === 1) {
          setFormData((prev) => ({
            ...prev,
            projectId: adminProjects[0].id,
          }));
        }
      } catch {
        setFetchError('Không thể tải danh sách dự án / người dùng. Kiểm tra backend đang chạy.');
      } finally {
        setLoadingMeta(false);
      }
    };

    fetchMeta();
  }, [isOpen, defaultProjectId]);

  // Fetch members chỉ khi người dùng chọn dự án (hoặc đổi dự án)
  useEffect(() => {
    if (!formData.projectId) {
      setUsers([]);
      return;
    }

    const fetchMembers = async () => {
      try {
        const res = await getProjectMembers(formData.projectId);
        // API chuẩn sẽ trả về object { data: [ {role, user: { id, name.. }} ] }
        const membersList = Array.isArray(res.data) ? res.data : [];
        setUsers(membersList.map(m => m.user));
      } catch (err) {
        console.error("Lỗi lấy danh sách member:", err);
        setUsers([]);
      }
    };

    fetchMembers();
  }, [formData.projectId]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ── Validate ──────────────────────────────────────────────
    if (!formData.title.trim()) {
      toast.error('Tên Issue không được để trống');
      return;
    }
    if (!formData.projectId) {
      toast.error('Vui lòng chọn Dự án');
      return;
    }

    setIsSubmitting(true);

    try {
      // Payload gửi đúng chuẩn backend enum
      const payload = {
        title:       formData.title.trim(),
        description: formData.description.trim() || undefined,
        type:        formData.type,           // 'EPIC' | 'STORY' | 'TASK'
        status:      formData.status,         // 'TODO' | 'IN_PROGRESS' | 'TEST' | 'DONE'
        projectId:   formData.projectId,
        assigneeId:  formData.assigneeId || undefined,
      };

      const response = await createIssue(payload);

      toast.success(`✅ Tạo Issue "${response.data?.title}" thành công!`);

      // Callback để parent component reload danh sách (nếu có)
      if (onCreated) onCreated(response.data);

      // Reset form & đóng modal
      setFormData({
        title: '', description: '', type: 'TASK',
        status: 'TODO', projectId: '', assigneeId: '',
      });
      onClose();
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra khi tạo Issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      {/* Modal Card */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[92vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Tạo Issue mới</h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition disabled:opacity-50"
            aria-label="Đóng modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Error banner khi fetch meta thất bại */}
          {fetchError && (
            <div className="mb-4 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{fetchError}</span>
            </div>
          )}

          <form id="create-issue-form" onSubmit={handleSubmit} className="space-y-5">

            {/* 1. Tên Issue */}
            <div>
              <label htmlFor="issue-title" className="block text-sm font-medium text-gray-700 mb-1">
                Tên Issue <span className="text-red-500">*</span>
              </label>
              <input
                id="issue-title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Nhập phần tóm tắt cho issue..."
                autoFocus
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            {/* 2. Mô tả (tuỳ chọn) */}
            <div>
              <label htmlFor="issue-description" className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả
              </label>
              <textarea
                id="issue-description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Mô tả chi tiết issue này..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
              />
            </div>

            {/* 3. Type & Status (Grid 2 cột) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category / Type */}
              <div>
                <label htmlFor="issue-type" className="block text-sm font-medium text-gray-700 mb-1">
                  Loại Issue (Category)
                </label>
                <select
                  id="issue-type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  {TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label htmlFor="issue-status" className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <select
                  id="issue-status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 4. Project (bắt buộc) */}
            <div>
              <label htmlFor="issue-project" className="block text-sm font-medium text-gray-700 mb-1">
                Dự án <span className="text-red-500">*</span>
              </label>
              {loadingMeta ? (
                <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                  <Loader2 size={14} className="animate-spin" /> Đang tải danh sách...
                </div>
              ) : (
                <select
                  id="issue-project"
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  disabled={!!defaultProjectId}
                  className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${defaultProjectId ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white'}`}
                >
                  <option value="">-- Chọn dự án --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.key}] {p.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* 5. Assignee */}
            <div>
              <label htmlFor="issue-assignee" className="block text-sm font-medium text-gray-700 mb-1">
                Người thực hiện (Assignee)
              </label>
              {loadingMeta ? (
                <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                  <Loader2 size={14} className="animate-spin" /> Đang tải danh sách...
                </div>
              ) : (
                <select
                  id="issue-assignee"
                  name="assigneeId"
                  value={formData.assigneeId}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="">-- Chưa phân công --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              )}
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200 gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            form="create-issue-form"
            disabled={isSubmitting || loadingMeta}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            {isSubmitting ? 'Đang tạo...' : 'Tạo Issue'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateIssueModal;
