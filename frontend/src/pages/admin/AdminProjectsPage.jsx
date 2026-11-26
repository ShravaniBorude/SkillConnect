import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { projectApi } from '../../api';
import { formatCurrency, formatDate } from '../../utils/format';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Pagination from '../../components/ui/Pagination';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const load = async (p = page) => {
    setLoading(true);
    try {
      const res = await projectApi.browse({ page: p, size: 15 });
      setProjects(res.data.data?.content || []);
      setTotalPages(res.data.data?.totalPages || 0);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(0); }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Project Monitoring</h1>
          <p className="text-sm text-slate-500">Monitor active marketplace listings</p>
        </div>

        {loading ? (
          <Spinner className="py-16" />
        ) : (
          <div className="card overflow-x-auto p-0">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Budget</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Posted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.map((p) => (
                  <tr key={p.id}>
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      <Link to={`/projects/${p.id}`} className="hover:text-brand-600">{p.title}</Link>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{p.clientName}</td>
                    <td className="px-5 py-3.5 text-slate-600">{p.categoryName}</td>
                    <td className="px-5 py-3.5">{formatCurrency(p.budgetMin)} - {formatCurrency(p.budgetMax)}</td>
                    <td className="px-5 py-3.5"><Badge status={p.status} /></td>
                    <td className="px-5 py-3.5 text-slate-500">{formatDate(p.createdAt)}</td>
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
