import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { reviewApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/format';
import StarRating from '../../components/ui/StarRating';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { Star } from 'lucide-react';

export default function ClientReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    reviewApi.getForUser(user.id, { page: 0, size: 20 })
      .then((res) => setReviews(res.data.data?.content || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Reviews</h1>
          <p className="text-sm text-slate-500">Feedback received from freelancers you have worked with</p>
        </div>
        {loading ? (
          <Spinner className="py-16" />
        ) : reviews.length === 0 ? (
          <EmptyState icon={Star} title="No reviews yet" description="Complete contracts to receive ratings and feedback." />
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="card">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{rev.reviewerName}</span>
                  <span className="text-xs text-slate-400">{formatDate(rev.createdAt)}</span>
                </div>
                <div className="mt-1"><StarRating rating={rev.rating} /></div>
                {rev.comment && <p className="text-sm text-slate-600 mt-2">{rev.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
