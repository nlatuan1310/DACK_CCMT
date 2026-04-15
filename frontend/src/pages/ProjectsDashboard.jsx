import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects } from '../services/issueApi';
import { Loader2, FolderKanban, Plus } from 'lucide-react';
import CreateProjectModal from '../components/CreateProjectModal';

const ProjectsDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await getProjects();
      setProjects(res.data || []);
    } catch (err) {
      setError('Lỗi lấy danh sách dự án');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dự án của bạn</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý và truy cập các workspace dự án.</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <Plus size={18} />
          Tạo dự án mới
        </button>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
          <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-gray-900 font-medium mb-1">Chưa có dự án nào</h3>
          <p className="text-sm text-gray-500 mb-4">Bạn chưa tham gia hoặc chưa tạo dự án nào.</p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="text-indigo-600 font-medium hover:underline text-sm"
          >
            Tạo dự án đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 content-start flex-1 overflow-y-auto pr-2 pb-4">
          {projects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => navigate(`/projects/${proj.id}/board`)}
              className="group cursor-pointer bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200 transition-all overflow-hidden flex flex-col hover:-translate-y-1"
            >
              {/* Gradient Banner */}
              <div className="h-20 bg-gradient-to-r from-blue-500 to-indigo-600 p-4 flex items-end">
                <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center text-lg font-bold text-indigo-600 translate-y-6 border border-gray-100">
                  {proj.key}
                </div>
              </div>
              <div className="p-5 pt-8 flex-1 flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {proj.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2 min-h-[40px] flex-1">
                  {proj.description || "Không có mô tả"}
                </p>
                <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400 font-medium">
                  Vai trò: <span className="text-gray-600 font-semibold">{proj.members?.[0]?.role || 'USER'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onProjectCreated={() => {
          setIsCreateOpen(false);
          fetchProjects();
        }}
      />
    </div>
  );
};

export default ProjectsDashboard;
