import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import { freelancerApi, reviewApi, chatApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate, getInitials } from '../../utils/format';
import StarRating from '../../components/ui/StarRating';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { MapPin, ShieldCheck, Briefcase, GraduationCap, ExternalLink, MessageCircle, Globe } from 'lucide-react';

export default function FreelancerPublicProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { error } = useToast();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      freelancerApi.getByUserId(userId),
      reviewApi.getForUser(userId, { page: 0, size: 10 }),
    ])
      .then(([profRes, revRes]) => {
        setProfile(profRes.data.data);
        setReviews(revRes.data.data?.content || []);
      })
      .catch(() => error('Freelancer profile not found'))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleMessage = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const res = await chatApi.getOrCreate(userId);
      navigate(`/chat/${res.data.data.id}`);
    } catch (err) {
      error(err.response?.data?.message || 'Unable to start conversation');
    }
  };

  if (loading) return <PublicLayout><Spinner className="py-20" /></PublicLayout>;
  if (!profile) return <PublicLayout><div className="max-w-4xl mx-auto py-20 text-center text-slate-500">Freelancer not found.</div></PublicLayout>;

  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* Header Card */}
        <div className="card flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl bg-brand-100 text-brand-700 font-bold text-2xl flex items-center justify-center overflow-hidden flex-shrink-0">
              {profile.avatarUrl ? <img src={profile.avatarUrl} alt={profile.fullName} className="w-full h-full object-cover" /> : getInitials(profile.fullName)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{profile.fullName}</h1>
                {profile.verificationStatus === 'VERIFIED' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700">
                    <ShieldCheck className="h-3.5 w-3.5" /> Verified
                  </span>
                )}
                <Badge status={profile.availabilityStatus} />
              </div>
              <p className="text-slate-600 font-medium mt-1">{profile.headline || 'Freelance Professional'}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mt-2">
                {profile.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {profile.location}</span>}
                {profile.languages && <span className="flex items-center gap-1"><Globe className="h-4 w-4" /> {profile.languages}</span>}
                <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> {profile.completedProjectsCount || 0} projects completed</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3">
            <div className="text-2xl font-bold text-slate-900">
              {profile.hourlyRate ? `${formatCurrency(profile.hourlyRate)}/hr` : 'Negotiable'}
            </div>
            <div className="flex items-center gap-2">
              <StarRating rating={profile.averageRating} showValue />
              <span className="text-sm text-slate-400">({profile.totalReviews || 0} reviews)</span>
            </div>
            {user?.id !== Number(userId) && (
              <button onClick={handleMessage} className="btn-primary">
                <MessageCircle className="h-4 w-4" /> Contact Freelancer
              </button>
            )}
          </div>
        </div>

        {/* Bio & Skills */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="card">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">About</h2>
              <p className="text-slate-600 whitespace-pre-line leading-relaxed">{profile.bio || 'No biography provided.'}</p>
            </div>

            {profile.experienceSummary && (
              <div className="card">
                <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-brand-600" /> Experience
                </h2>
                <p className="text-slate-600 whitespace-pre-line">{profile.experienceSummary}</p>
              </div>
            )}

            {/* Portfolio */}
            <div className="card">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Portfolio</h2>
              {!profile.portfolio?.length ? (
                <p className="text-sm text-slate-500">No portfolio items added yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.portfolio.map((item) => (
                    <div key={item.id} className="border border-slate-200 rounded-xl p-4 hover:border-brand-300 transition">
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt={item.title} className="w-full h-36 object-cover rounded-lg mb-3" />
                      )}
                      <h3 className="font-semibold text-slate-900">{item.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                      {item.technologiesUsed && (
                        <p className="text-xs text-brand-700 font-medium mt-2">{item.technologiesUsed}</p>
                      )}
                      {item.projectUrl && (
                        <a href={item.projectUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline mt-2">
                          View Project <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills?.length ? profile.skills.map((s) => (
                  <span key={s.skillId} className="px-3 py-1 bg-brand-50 text-brand-700 rounded-lg text-xs font-semibold">
                    {s.skillName}
                  </span>
                )) : <p className="text-sm text-slate-500">No skills listed.</p>}
              </div>
            </div>

            {profile.education && (
              <div className="card">
                <h2 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-brand-600" /> Education
                </h2>
                <p className="text-sm text-slate-600">{profile.education}</p>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="card">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Client Reviews ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <p className="text-sm text-slate-500">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
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
      </div>
    </PublicLayout>
  );
}
