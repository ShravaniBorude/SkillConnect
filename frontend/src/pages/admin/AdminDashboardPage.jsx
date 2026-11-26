import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminApi } from '../../api';
import { formatCurrency } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';
import { Users, Briefcase, CreditCard, Shield, AlertTriangle, FileText } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboard()
      .then((res) => setStats(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><Spinner className="py-16" /></DashboardLayout>;

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, sub: `${stats?.totalClients || 0} clients • ${stats?.totalFreelancers || 0} freelancers`, icon: Users, to: '/admin/users' },
    { label: 'Total Projects', value: stats?.totalProjects || 0, sub: `${stats?.openProjects || 0} currently open`, icon: Briefcase, to: '/admin/projects' },
    { label: 'Active Contracts', value: stats?.activeContracts || 0, sub: `${stats?.completedContracts || 0} completed`, icon: FileText, to: '/admin/reports' },
    { label: 'Payment Volume', value: formatCurrency(stats?.totalVolume || 0), sub: `Fees: ${formatCurrency(stats?.totalPlatformFees || 0)}`, icon: CreditCard, to: '/admin/transactions' },
    { label: 'Pending Verifications', value: stats?.pendingVerifications || 0, sub: 'Documents awaiting review', icon: Shield, to: '/admin/verifications' },
    { label: 'Open Disputes', value: stats?.openDisputes || 0, sub: 'Requires admin resolution', icon: AlertTriangle, to: '/admin/disputes' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-500">Platform overview, moderation, and financial metrics</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((c) => (
            <Link key={c.label} to={c.to} className="card hover:border-brand-300 transition">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-500">{c.label}</span>
                <c.icon className="h-5 w-5 text-brand-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{c.value}</p>
              <p className="text-xs text-slate-400 mt-1">{c.sub}</p>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
