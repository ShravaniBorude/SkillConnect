import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminApi } from '../../api';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { Shield, ExternalLink } from 'lucide-react';

export default function AdminVerificationsPage() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getVerifications({ page: 0, size: 20 });
      setDocs(res.data.data?.content || []);
    } catch {
      setDocs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleReview = async (docId, status) => {
    try {
      await adminApi.reviewVerification(docId, { status, adminNotes: `Reviewed: ${status}` });
      success(`Document ${status.toLowerCase()}`);
      load();
    } catch (err) {
      error(err.response?.data?.message || 'Review failed');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Freelancer Verifications</h1>
          <p className="text-sm text-slate-500">Review pending identity and credential submissions</p>
        </div>

        {loading ? (
          <Spinner className="py-16" />
        ) : docs.length === 0 ? (
          <EmptyState icon={Shield} title="No pending verifications" description="All verification requests have been processed." />
        ) : (
          <div className="space-y-4">
            {docs.map((d) => (
              <div key={d.id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{d.user?.fullName || `User #${d.id}`}</span>
                    <Badge status={d.status} />
                  </div>
                  <p className="text-sm text-slate-500 mt-1">Type: {d.documentType}</p>
                  {d.documentUrl && (
                    <a href={d.documentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline mt-1">
                      View Document <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleReview(d.id, 'APPROVED')} className="btn-primary text-xs">Approve</button>
                  <button onClick={() => handleReview(d.id, 'REJECTED')} className="btn-danger text-xs">Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
