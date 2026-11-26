import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminApi } from '../../api';
import { formatCurrency, formatDate } from '../../utils/format';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Pagination from '../../components/ui/Pagination';

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const load = async (p = page) => {
    setLoading(true);
    try {
      const res = await adminApi.getTransactions({ page: p, size: 20 });
      setTransactions(res.data.data?.content || []);
      setTotalPages(res.data.data?.totalPages || 0);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(0); }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transaction Monitoring</h1>
          <p className="text-sm text-slate-500">Ledger of all payment transactions across SkillConnect</p>
        </div>

        {loading ? (
          <Spinner className="py-16" />
        ) : (
          <div className="card overflow-x-auto p-0">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-500">#{t.id}</td>
                    <td className="px-5 py-3.5 font-medium">{t.type}</td>
                    <td className="px-5 py-3.5 font-semibold">{formatCurrency(t.amount)}</td>
                    <td className="px-5 py-3.5"><Badge status={t.status} /></td>
                    <td className="px-5 py-3.5 text-slate-600">{t.description}</td>
                    <td className="px-5 py-3.5 text-slate-500">{formatDate(t.createdAt)}</td>
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
