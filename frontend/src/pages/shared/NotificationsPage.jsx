import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { chatApi } from '../../api';
import { useToast } from '../../context/ToastContext';
import { timeSince } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { Bell, CheckCheck } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { success } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const res = await chatApi.getNotifications({ page: 0, size: 30 });
      setNotifications(res.data.data?.content || []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleMarkAllRead = async () => {
    try {
      await chatApi.markAllNotificationsRead();
      success('All notifications marked as read');
      load();
    } catch {}
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
            <p className="text-sm text-slate-500">Stay updated on proposals, contracts, messages, and payments</p>
          </div>
          {notifications.length > 0 && (
            <button onClick={handleMarkAllRead} className="btn-secondary text-xs">
              <CheckCheck className="h-4 w-4" /> Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <Spinner className="py-16" />
        ) : notifications.length === 0 ? (
          <EmptyState icon={Bell} title="You're all caught up!" description="New activity notifications will appear here." />
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className={`card py-4 ${n.read ? 'opacity-75' : 'border-brand-300 bg-brand-50/20'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">{n.title}</h4>
                    <p className="text-sm text-slate-600 mt-0.5">{n.message}</p>
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0">{timeSince(n.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
