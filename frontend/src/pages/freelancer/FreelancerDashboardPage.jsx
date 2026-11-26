import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { projectApi, proposalApi, contractApi, freelancerApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/format';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { Briefcase, FileText, TrendingUp, ArrowRight } from 'lucide-react';

export default function FreelancerDashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      freelancerApi.getMyProfile(),
      projectApi.recommended({ page: 0, size: 5 }),
      proposalApi.myProposals({ page: 0, size: 5 }),
      contractApi.myContracts({ page: 0, size: 5 }),
    ])
      .then(([profRes, recRes, propRes, contRes]) => {
        setProfile(profRes.data.data);
        setRecommended(recRes.data.data?.content || []);
        setProposals(propRes.data.data?.content || []);
        setContracts(contRes.data.data?.content || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeContracts = contracts.filter((c) => c.status === 'ACTIVE').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.fullName}</h1>
            <p className="text-sm text-slate-500">Find projects, track proposals, and manage your active contracts</p>
          </div>
          <Link to="/projects" className="btn-primary">Browse Projects</Link>
        </div>

        {loading ? (
          <Spinner className="py-16" />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="card flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Submitted Proposals</p>
                  <p className="text-2xl font-bold text-slate-900">{proposals.length}</p>
                </div>
              </div>
              <div className="card flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Active Contracts</p>
                  <p className="text-2xl font-bold text-slate-900">{activeContracts}</p>
                </div>
              </div>
              <div className="card flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total Earnings</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(profile?.totalEarnings || 0)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-slate-900">Recommended Projects</h2>
                  <Link to="/projects" className="text-sm text-brand-600 hover:underline flex items-center gap-1">
                    Browse all <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                {recommended.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4">Add skills to your profile to see matching projects.</p>
                ) : (
                  <div className="space-y-3">
                    {recommended.map((p) => (
                      <Link key={p.id} to={`/projects/${p.id}`} className="block p-3 rounded-xl border border-slate-100 hover:border-brand-200 hover:bg-slate-50 transition">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-slate-900 truncate">{p.title}</span>
                          <Badge status={p.status} />
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                          <span>{p.categoryName}</span>
                          <span>{formatCurrency(p.budgetMin)} - {formatCurrency(p.budgetMax)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-slate-900">Active Contracts</h2>
                  <Link to="/freelancer/contracts" className="text-sm text-brand-600 hover:underline flex items-center gap-1">
                    View all <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                {contracts.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4">No contracts yet.</p>
                ) : (
                  <div className="space-y-3">
                    {contracts.map((c) => (
                      <Link key={c.id} to={`/freelancer/contracts/${c.id}`} className="block p-3 rounded-xl border border-slate-100 hover:border-brand-200 hover:bg-slate-50 transition">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-slate-900 truncate">{c.title}</span>
                          <Badge status={c.status} />
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                          <span>Client: {c.clientName}</span>
                          <span className="font-semibold text-slate-700">{formatCurrency(c.agreedAmount)}</span>
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
