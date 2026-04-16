import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Trash2, AlertTriangle } from 'lucide-react';

function Settings() {
  const { user } = useAuth();
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [projectInfo, setProjectInfo] = useState(null);
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  // Lấy thông tin Project
  useEffect(() => {
    if (!projectId) return;
    const fetchProjectInfo = async () => {
      try {
        const res = await apiClient.get('/projects');
        const projList = res.data?.data || [];
        const currentProject = projList.find(p => p.id === projectId);
        if (currentProject) setProjectInfo(currentProject);
      } catch {
        toast.error('Lỗi tải thông tin dự án');
      }
    };
    fetchProjectInfo();
  }, [projectId]);

  // Lấy ds Member khi chọn project
  useEffect(() => {
    if (!projectId) return;

    const fetchMembers = async () => {
      setLoadingMembers(true);
      try {
        const res = await apiClient.get(`/projects/${projectId}/members`);
        setMembers(res.data?.data || []);
      } catch {
        toast.error('Lỗi tải danh sách thành viên');
      } finally {
        setLoadingMembers(false);
      }
    };
    fetchMembers();
  }, [projectId]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setInviting(true);
    try {
      const res = await apiClient.post(`/projects/${projectId}/members`, { email: inviteEmail });
      toast.success('Đã gửi lời mời thành công!');
      // Thêm member vào ds
      setMembers(prev => [...prev, res.data.data]);
      setInviteEmail('');
    } catch (error) {
      toast.error(error.message || 'Lỗi khi mời thành viên');
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await apiClient.patch(`/projects/${projectId}/members/${userId}/role`, { role: newRole });
      toast.success('Cập nhật vai trò thành công!');
      setMembers(prev => prev.map(m => m.userId === userId ? { ...m, role: newRole } : m));
    } catch (error) {
      toast.error(error.message || 'Lỗi khi cập nhật vai trò');
    }
  };

  const handleDeleteProject = async () => {
    const projectName = projectInfo?.name || 'dự án này';
    if (!window.confirm(`⚠️ Bạn có chắc chắn muốn xóa dự án "${projectName}"?\n\nTất cả Issue, Epic, Story, Task trong dự án sẽ bị xóa vĩnh viễn.\n\nHành động này KHÔNG THỂ hoàn tác!`)) return;

    setDeleting(true);
    try {
      await apiClient.delete(`/projects/${projectId}`);
      toast.success(`Đã xóa dự án "${projectName}" thành công!`);
      navigate('/projects', { replace: true });
    } catch (error) {
      toast.error(error.message || 'Lỗi khi xóa dự án');
    } finally {
      setDeleting(false);
    }
  };

  // Xác định quyền myRole
  const myRole = members.find(m => m.userId === user?.id)?.role;
  const isAdmin = myRole === 'ADMIN';

  return (
    <div className="p-6 max-w-5xl mx-auto flex flex-col gap-8 h-full overflow-y-auto w-full">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Project Settings {projectInfo ? `- ${projectInfo.name}` : ''}</h1>
        <p className="text-gray-500">Quản lý dự án và phân quyền thành viên tham gia.</p>
      </div>

      {projectId && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Member List (2 cols) */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-fit">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Danh sách thành viên</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isAdmin ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'}`}>
                Vai trò của bạn: {myRole || '...'}
              </span>
            </div>
            
            <div className="p-0 overflow-x-auto">
              {loadingMembers ? (
                <div className="p-6 text-center text-gray-500">Đang tải dữ liệu...</div>
              ) : (
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-gray-200 bg-white text-sm text-gray-500 uppercase">
                      <th className="px-6 py-3 font-medium">Người dùng</th>
                      <th className="px-6 py-3 font-medium">Vai trò</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {members.map(member => (
                      <tr key={member.userId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">
                              {member.user?.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-800">{member.user?.name} {member.userId === user?.id && <span className="text-sm font-normal text-gray-500">(Tôi)</span>}</span>
                              <span className="text-sm text-gray-500">{member.user?.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            className={`p-1.5 border rounded-md text-sm \${(isAdmin && member.userId !== user?.id) ? 'border-gray-300 cursor-pointer bg-white focus:ring-2 focus:ring-indigo-500' : 'bg-gray-100 text-gray-500 cursor-not-allowed border-transparent'}`}
                            value={member.role}
                            disabled={!isAdmin || member.userId === user?.id}
                            onChange={(e) => handleRoleChange(member.userId, e.target.value)}
                          >
                            <option value="ADMIN">ADMIN</option>
                            <option value="USER">USER</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                    {members.length === 0 && (
                      <tr>
                        <td colSpan={2} className="px-6 py-8 text-center text-gray-500">
                          Chưa có thành viên nào.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Right sidebar: Invite + Danger Zone */}
          <div className="md:col-span-1 flex flex-col gap-6">
            {/* Invite Form */}
            <div className="border border-gray-200 rounded-xl bg-white shadow-sm h-fit">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-800">Mời thành viên</h2>
              </div>
              <div className="p-6">
                {!isAdmin ? (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
                    <p className="text-yellow-700 text-sm">Bạn đang có vai trò <b>USER</b> nên không thể sử dụng tính năng mời thành viên hoặc cấu hình quyền.</p>
                  </div>
                ) : (
                  <form onSubmit={handleInvite} className="flex flex-col gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email người dùng</label>
                      <input
                        type="email"
                        required
                        placeholder="nhap@email.com"
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={inviting || !inviteEmail}
                      className="w-full bg-indigo-600 text-white font-medium py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {inviting ? 'Đang gửi...' : 'Gửi lời mời'}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Danger Zone — Xóa dự án */}
            {isAdmin && (
              <div className="border border-red-200 rounded-xl bg-white shadow-sm h-fit overflow-hidden">
                <div className="px-6 py-4 border-b border-red-200 bg-red-50 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-500" />
                  <h2 className="text-lg font-semibold text-red-700">Vùng nguy hiểm</h2>
                </div>
                <div className="p-6 space-y-3">
                  <p className="text-sm text-gray-600">
                    Xóa dự án sẽ xóa <strong>tất cả</strong> Epic, Story, Task và thành viên liên quan. 
                    Hành động này <strong>không thể hoàn tác</strong>.
                  </p>
                  <button
                    onClick={handleDeleteProject}
                    disabled={deleting}
                    className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={16} />
                    {deleting ? 'Đang xóa...' : 'Xóa dự án này'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;

