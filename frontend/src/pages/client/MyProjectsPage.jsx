import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { projectApi } from '../../api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/format';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import { Plus, Trash2, Eye, FolderOpen } from 'lucide-react';

export default function MyProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { success, error } = useToast();

  const load = async (p = page) => {
    setLoading(true);
    try {
      const res = await projectApi.myProjects({ page: p, size: 10 });
      setProjects(res.data.data?.content || []);
      setTotalPages(res.data.data?.totalPages || 0);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(0); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await projectApi.delete(id);
      success('Project deleted');
      load(page);
    } catch (err) {
      error(err.response?.data?.message || 'Cannot delete project');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Projects</h1>
            <p className="text-sm text-slate-500">View and manage all projects you have posted</p>
          </div>
          <Link to="/client/projects/new" className="btn-primary">
            <Plus className="h-4 w-4" /> Post Project
          </Link>
        </div>

        {loading ? (
          <Spinner className="py-16" />
        ) : projects.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No projects posted yet"
            description="Create your first project to start receiving proposals from freelancers."
            action={<Link to="/client/projects/new" className="btn-primary">Post a Project</Link>}
          />
        ) : (
          <div className="space-y-4">
            {projects.map((p) => (
              <div key={p.id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge status={p.status} />
                    <span className="text-xs text-slate-500">{p.categoryName}</span>
                  </div>
                  <Link to={`/client/projects/${p.id}`} className="text-lg font-semibold text-slate-900 hover:text-brand-600">
                    {p.title}
                  </Link>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-1">
                    <span>Budget: {formatCurrency(p.budgetMin)} - {formatCurrency(p.budgetMax)}</span>
                    <span>Proposals: {p.proposalCount || 0}</span>
                    <span>Deadline: {formatDate(p.deadline)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link to={`/client/projects/${p.id}`} className="btn-secondary text-xs">
                    <Eye className="h-3.5 w-3.5" /> View & Proposals
                  </Link>
                  {p.status === 'OPEN' && (
                    <button onClick={() => handleDelete(p.id)} className="btn-danger px-3 py-2 text-xs">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <Pagination page={page} totalPages={totalPages} onPageChange={(p) => { setPage(p); load(p); }} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
