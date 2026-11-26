import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { projectApi, contractApi, paymentApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/format';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { FolderOpen, FileText, CreditCard, Plus, ArrowRight } from 'lucide-react';

export default function ClientDashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      projectApi.myProjects({ page: 0, size: 5 }),
      contractApi.myContracts({ page: 0, size: 5 }),
      paymentApi.history({ page: 0, size: 20 }),
    ])
      .then(([projRes, contRes, payRes]) => {
        setProjects(projRes.data.data?.content || []);
        setContracts(contRes.data.data?.content || []);
        setPayments(payRes.data.data?.content || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalSpent = payments
    .filter((p) => p.status === 'CAPTURED' || p.status === 'PAID')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const activeContracts = contracts.filter((c) => c.status === 'ACTIVE').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.fullName}</h1>
            <p className="text-sm text-slate-500">Manage your projects, proposals, and active contracts</p>
          </div>
          <Link to="/client/projects/new" className="btn-primary">
            <Plus className="h-4 w-4" /> Post a Project
          </Link>
        </div>

        {loading ? (
          <Spinner className="py-16" />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="card flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <FolderOpen className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Posted Projects</p>
                  <p className="text-2xl font-bold text-slate-900">{projects.length}</p>
                </div>
              </div>
              <div className="card flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Active Contracts</p>
                  <p className="text-2xl font-bold text-slate-900">{activeContracts}</p>
                </div>
              </div>
              <div className="card flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total Spent</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalSpent)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-slate-900">Recent Projects</h2>
                  <Link to="/client/projects" className="text-sm text-brand-600 hover:underline flex items-center gap-1">
                    View all <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                {projects.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4">No projects posted yet.</p>
                ) : (
                  <div className="space-y-3">
                    {projects.map((p) => (
                      <Link key={p.id} to={`/client/projects/${p.id}`} className="block p-3 rounded-xl border border-slate-100 hover:border-brand-200 hover:bg-slate-50 transition">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-slate-900 truncate">{p.title}</span>
                          <Badge status={p.status} />
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                          <span>{p.proposalCount || 0} proposals</span>
                          <span>{formatCurrency(p.budgetMin)} - {formatCurrency(p.budgetMax)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-slate-900">Recent Contracts</h2>
                  <Link to="/client/contracts" className="text-sm text-brand-600 hover:underline flex items-center gap-1">
                    View all <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                {contracts.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4">No contracts yet.</p>
                ) : (
                  <div className="space-y-3">
                    {contracts.map((c) => (
                      <Link key={c.id} to={`/client/contracts/${c.id}`} className="block p-3 rounded-xl border border-slate-100 hover:border-brand-200 hover:bg-slate-50 transition">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-slate-900 truncate">{c.title}</span>
                          <Badge status={c.status} />
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                          <span>Freelancer: {c.freelancerName}</span>
                          <span>Due: {formatDate(c.dueDate)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
