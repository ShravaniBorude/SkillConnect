import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { proposalApi } from '../../api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/format';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import { FileText } from 'lucide-react';

export default function MyProposalsPage() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { success, error } = useToast();

  const load = async (p = page) => {
    setLoading(true);
    try {
      const res = await proposalApi.myProposals({ page: p, size: 10 });
      setProposals(res.data.data?.content || []);
      setTotalPages(res.data.data?.totalPages || 0);
    } catch {
      setProposals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(0); }, []);

  const handleWithdraw = async (id) => {
    if (!window.confirm('Withdraw this proposal?')) return;
    try {
      await proposalApi.withdraw(id);
      success('Proposal withdrawn');
      load(page);
    } catch (err) {
      error(err.response?.data?.message || 'Cannot withdraw proposal');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Proposals</h1>
          <p className="text-sm text-slate-500">Track the status of your submitted project proposals</p>
        </div>

        {loading ? (
          <Spinner className="py-16" />
        ) : proposals.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No proposals submitted yet"
            description="Browse open projects and submit a proposal to start winning work."
            action={<Link to="/projects" className="btn-primary">Browse Projects</Link>}
          />
        ) : (
          <div className="space-y-4">
            {proposals.map((p) => (
              <div key={p.id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge status={p.status} />
                    <span className="text-xs text-slate-400">Submitted {formatDate(p.createdAt)}</span>
                  </div>
                  <Link to={`/projects/${p.projectId}`} className="text-lg font-semibold text-slate-900 hover:text-brand-600">
                    {p.projectTitle}
                  </Link>
                  <p className="text-sm text-slate-500 mt-1">
                    Proposed: <strong>{formatCurrency(p.proposedBudget)}</strong> • Est. {p.estimatedDays} days
                  </p>
                </div>
                {(p.status === 'SUBMITTED' || p.status === 'SHORTLISTED') && (
                  <button onClick={() => handleWithdraw(p.id)} className="btn-secondary text-xs text-rose-600 border-rose-200 hover:bg-rose-50">
                    Withdraw
                  </button>
                )}
              </div>
            ))}
            <Pagination page={page} totalPages={totalPages} onPageChange={(p) => { setPage(p); load(p); }} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
