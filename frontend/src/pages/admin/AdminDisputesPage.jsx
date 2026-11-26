import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminApi } from '../../api';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/format';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { AlertTriangle } from 'lucide-react';

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolveModal, setResolveModal] = useState({ open: false, id: null, resolution: '', adminNotes: '' });
  const { success, error } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getDisputes({ page: 0, size: 20 });
      setDisputes(res.data.data?.content || []);
    } catch {
      setDisputes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleResolve = async (e) => {
    e.preventDefault();
    try {
      await adminApi.resolveDispute(resolveModal.id, {
        resolution: resolveModal.resolution,
        adminNotes: resolveModal.adminNotes,
      });
      success('Dispute resolved');
      setResolveModal({ open: false, id: null, resolution: '', adminNotes: '' });
      load();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to resolve dispute');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dispute Management</h1>
          <p className="text-sm text-slate-500">Review and resolve contract disputes between clients and freelancers</p>
        </div>

        {loading ? (
          <Spinner className="py-16" />
        ) : disputes.length === 0 ? (
          <EmptyState icon={AlertTriangle} title="No disputes found" description="All contracts are currently running smoothly." />
        ) : (
          <div className="space-y-4">
            {disputes.map((d) => (
              <div key={d.id} className="card space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{d.reason}</span>
                    <Badge status={d.status} />
                  </div>
                  <span className="text-xs text-slate-400">{formatDate(d.createdAt)}</span>
                </div>
                <p className="text-sm text-slate-600">{d.description}</p>
                {d.status === 'OPEN' && (
                  <div className="pt-2">
                    <button
                      onClick={() => setResolveModal({ open: true, id: d.id, resolution: '', adminNotes: '' })}
                      className="btn-primary text-xs"
                    >
                      Resolve Dispute
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={resolveModal.open} onClose={() => setResolveModal({ open: false, id: null, resolution: '', adminNotes: '' })} title="Resolve Dispute">
        <form onSubmit={handleResolve} className="space-y-4">
          <input
            type="text"
            required
            placeholder="Resolution decision (e.g., Partial refund / Work approved)"
            value={resolveModal.resolution}
            onChange={(e) => setResolveModal({ ...resolveModal, resolution: e.target.value })}
            className="input-field"
          />
          <textarea
            required
            rows={4}
            placeholder="Admin notes..."
            value={resolveModal.adminNotes}
            onChange={(e) => setResolveModal({ ...resolveModal, adminNotes: e.target.value })}
            className="input-field"
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setResolveModal({ open: false, id: null, resolution: '', adminNotes: '' })} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Confirm Resolution</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
