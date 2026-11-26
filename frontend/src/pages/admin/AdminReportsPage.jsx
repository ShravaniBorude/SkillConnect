import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminApi } from '../../api';
import { formatCurrency } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';

export default function AdminReportsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboard()
      .then((res) => setStats(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><Spinner className="py-16" /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-sm text-slate-500">Key platform health, revenue, and engagement metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card space-y-3">
            <h2 className="font-semibold text-slate-900">User Breakdown</h2>
            <div className="flex justify-between text-sm py-2 border-b border-slate-100">
              <span className="text-slate-600">Total Registered Users</span>
              <span className="font-bold">{stats?.totalUsers || 0}</span>
            </div>
            <div className="flex justify-between text-sm py-2 border-b border-slate-100">
              <span className="text-slate-600">Clients</span>
              <span className="font-bold">{stats?.totalClients || 0}</span>
            </div>
            <div className="flex justify-between text-sm py-2">
              <span className="text-slate-600">Freelancers</span>
              <span className="font-bold">{stats?.totalFreelancers || 0}</span>
            </div>
          </div>

          <div className="card space-y-3">
            <h2 className="font-semibold text-slate-900">Financial Summary</h2>
            <div className="flex justify-between text-sm py-2 border-b border-slate-100">
              <span className="text-slate-600">Total Payment Volume</span>
              <span className="font-bold">{formatCurrency(stats?.totalVolume || 0)}</span>
            </div>
            <div className="flex justify-between text-sm py-2 border-b border-slate-100">
              <span className="text-slate-600">Platform Service Fees</span>
              <span className="font-bold text-emerald-700">{formatCurrency(stats?.totalPlatformFees || 0)}</span>
            </div>
            <div className="flex justify-between text-sm py-2">
              <span className="text-slate-600">Captured Payments Count</span>
              <span className="font-bold">{stats?.capturedPayments || 0} / {stats?.totalPayments || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
