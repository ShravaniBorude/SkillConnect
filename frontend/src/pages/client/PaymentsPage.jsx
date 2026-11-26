import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { paymentApi } from '../../api';
import { formatCurrency, formatDate } from '../../utils/format';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import { CreditCard } from 'lucide-react';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const load = async (p = page) => {
    setLoading(true);
    try {
      const res = await paymentApi.history({ page: p, size: 15 });
      setPayments(res.data.data?.content || []);
      setTotalPages(res.data.data?.totalPages || 0);
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
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payment History</h1>
          <p className="text-sm text-slate-500">All Razorpay transactions and payment receipts</p>
        </div>

        {loading ? (
          <Spinner className="py-16" />
        ) : payments.length === 0 ? (
          <EmptyState icon={CreditCard} title="No payments yet" description="Payments made on active contracts will appear here." />
        ) : (
          <div className="card overflow-x-auto p-0">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Receipt</th>
                  <th className="px-5 py-3">Contract</th>
                  <th className="px-5 py-3">Freelancer</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{p.receiptNumber || `#${p.id}`}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-900">Contract #{p.contractId}</td>
                    <td className="px-5 py-3.5 text-slate-600">{p.payeeName}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{formatCurrency(p.amount)}</td>
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
