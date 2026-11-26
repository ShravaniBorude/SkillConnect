import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminApi } from '../../api';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Pagination from '../../components/ui/Pagination';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [keyword, setKeyword] = useState('');
  const { success, error } = useToast();

  const load = async (p = page) => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers({ keyword, page: p, size: 20 });
      const data = res.data.data;
      setUsers(data?.content || []);
      setTotalPages(data?.totalPages || 0);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(0); }, [keyword]);

  const handleStatusChange = async (userId, status) => {
    try {
      await adminApi.updateUserStatus(userId, status);
      success('User status updated');
      load(page);
    } catch (err) {
      error(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
            <p className="text-sm text-slate-500">Search and moderate platform accounts</p>
          </div>
          <input
            type="text"
            placeholder="Search name or email..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="input-field max-w-xs"
          />
        </div>

        {loading ? (
          <Spinner className="py-16" />
        ) : (
          <div className="card overflow-x-auto p-0">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-900">{u.fullName}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-medium text-slate-600">{u.role?.name}</td>
                    <td className="px-5 py-3.5"><Badge status={u.accountStatus} /></td>
                    <td className="px-5 py-3.5">
                      {u.accountStatus === 'ACTIVE' ? (
                        <button onClick={() => handleStatusChange(u.id, 'SUSPENDED')} className="btn-danger text-xs px-3 py-1.5">
                          Suspend
                        </button>
                      ) : (
                        <button onClick={() => handleStatusChange(u.id, 'ACTIVE')} className="btn-primary text-xs px-3 py-1.5">
                          Activate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} onPageChange={(p) => { setPage(p); load(p); }} />
      </div>
    </DashboardLayout>
  );
}
