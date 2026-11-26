import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { paymentApi, freelancerApi } from '../../api';
import { formatCurrency, formatDate } from '../../utils/format';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import { TrendingUp } from 'lucide-react';

export default function EarningsPage() {
  const [payments, setPayments] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const load = async (p = page) => {
    setLoading(true);
    try {
      const [payRes, profRes] = await Promise.all([
        paymentApi.history({ page: p, size: 15 }),
        freelancerApi.getMyProfile(),
      ]);
      setPayments(payRes.data.data?.content || []);
      setTotalPages(payRes.data.data?.totalPages || 0);
      setTotalEarnings(profRes.data.data?.totalEarnings || 0);
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(0); }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Earnings & Payouts</h1>
            <p className="text-sm text-slate-500">Track net earnings after platform service fees</p>
          </div>
          <div className="card py-3 px-5 flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-xs text-slate-500">Total Net Earnings</p>
              <p className="text-xl font-bold text-slate-900">{formatCurrency(totalEarnings)}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <Spinner className="py-16" />
        ) : payments.length === 0 ? (
          <EmptyState icon={TrendingUp} title="No earnings yet" description="Completed milestone and contract payments will appear here." />
        ) : (
          <div className="card overflow-x-auto p-0">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Receipt</th>
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Gross</th>
                  <th className="px-5 py-3">Platform Fee</th>
                  <th className="px-5 py-3">Net Earned</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{p.receiptNumber || `#${p.id}`}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-900">{p.payerName}</td>
                    <td className="px-5 py-3.5 text-slate-600">{formatCurrency(p.amount)}</td>
                    <td className="px-5 py-3.5 text-rose-600">-{formatCurrency(p.platformFee)}</td>
                    <td className="px-5 py-3.5 font-semibold text-emerald-700">{formatCurrency(p.netAmount)}</td>
                    <td className="px-5 py-3.5"><Badge status={p.status} /></td>
                    <td className="px-5 py-3.5 text-slate-500">{formatDate(p.paidAt || p.createdAt)}</td>
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
