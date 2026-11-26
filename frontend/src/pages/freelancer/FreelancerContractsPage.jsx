import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { contractApi } from '../../api';
import { formatCurrency, formatDate } from '../../utils/format';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import { FolderOpen } from 'lucide-react';

export default function FreelancerContractsPage() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const load = async (p = page) => {
    setLoading(true);
    try {
      const res = await contractApi.myContracts({ page: p, size: 10 });
      setContracts(res.data.data?.content || []);
      setTotalPages(res.data.data?.totalPages || 0);
    } catch {
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(0); }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Contracts</h1>
          <p className="text-sm text-slate-500">Accept offers, deliver milestones, and track completion</p>
        </div>

        {loading ? (
          <Spinner className="py-16" />
        ) : contracts.length === 0 ? (
          <EmptyState icon={FolderOpen} title="No contracts yet" description="When a client hires you, your contract offer will appear here." />
        ) : (
          <div className="space-y-4">
            {contracts.map((c) => (
              <Link key={c.id} to={`/freelancer/contracts/${c.id}`} className="card block hover:border-brand-300 transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge status={c.status} />
                      <span className="text-xs text-slate-400">#{c.id}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">{c.title}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">Client: {c.clientName} • Project: {c.projectTitle}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-lg font-bold text-slate-900">{formatCurrency(c.agreedAmount)}</p>
                    <p className="text-xs text-slate-500">Due {formatDate(c.dueDate)}</p>
                  </div>
                </div>
              </Link>
            ))}
            <Pagination page={page} totalPages={totalPages} onPageChange={(p) => { setPage(p); load(p); }} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
