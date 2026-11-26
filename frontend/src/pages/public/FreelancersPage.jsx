import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import { freelancerApi, projectApi } from '../../api';
import { formatCurrency, getInitials } from '../../utils/format';
import StarRating from '../../components/ui/StarRating';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import { Search, MapPin, ShieldCheck, Users } from 'lucide-react';

export default function FreelancersPage() {
  const [freelancers, setFreelancers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({
    keyword: '',
    skillId: '',
    experienceLevel: '',
    availability: '',
  });

  useEffect(() => {
    projectApi.getAllSkills().then((r) => setSkills(r.data.data || [])).catch(() => {});
  }, []);

  const fetchFreelancers = async (p = page) => {
    setLoading(true);
    try {
      const params = { page: p, size: 12 };
      if (filters.keyword) params.keyword = filters.keyword;
      if (filters.skillId) params.skillId = filters.skillId;
      if (filters.experienceLevel) params.experienceLevel = filters.experienceLevel;
      if (filters.availability) params.availability = filters.availability;
      const res = await freelancerApi.browse(params);
      const data = res.data.data;
      setFreelancers(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch {
      setFreelancers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFreelancers(0); }, [filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchFreelancers(0);
  };

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Find Top Freelancers</h1>
          <p className="text-slate-500 mt-1">Browse vetted professionals ready to bring your project to life</p>
        </div>

        {/* Filter bar */}
        <form onSubmit={handleSearch} className="card mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, headline, or skill..."
                value={filters.keyword}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                className="input-field pl-10"
              />
            </div>
            <select
              value={filters.skillId}
              onChange={(e) => setFilters({ ...filters, skillId: e.target.value })}
              className="input-field"
            >
              <option value="">All Skills</option>
              {skills.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <select
              value={filters.experienceLevel}
              onChange={(e) => setFilters({ ...filters, experienceLevel: e.target.value })}
              className="input-field"
            >
              <option value="">All Experience Levels</option>
              <option value="ENTRY">Entry Level</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="EXPERT">Expert</option>
            </select>
          </div>
        </form>

        {loading ? (
          <Spinner className="py-16" />
        ) : freelancers.length === 0 ? (
          <EmptyState icon={Users} title="No freelancers found" description="Try adjusting your search criteria or filters." />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {freelancers.map((fl) => (
                <Link key={fl.userId} to={`/freelancers/${fl.userId}`} className="card hover:border-brand-300 hover:shadow-md transition flex flex-col justify-between">
                  <div>
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-700 font-bold text-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {fl.avatarUrl ? <img src={fl.avatarUrl} alt={fl.fullName} className="w-full h-full object-cover" /> : getInitials(fl.fullName)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-semibold text-slate-900 truncate">{fl.fullName}</h3>
                          {fl.verificationStatus === 'VERIFIED' && <ShieldCheck className="h-4 w-4 text-brand-600 flex-shrink-0" />}
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-1">{fl.headline || 'Freelance Professional'}</p>
                        {fl.location && (
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" /> {fl.location}
                          </p>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-slate-500 mt-4 line-clamp-2">{fl.bio || 'No biography added yet.'}</p>

                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {(fl.skills || []).slice(0, 4).map((s) => (
                        <span key={s.skillId} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                          {s.skillName}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-5 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <StarRating rating={fl.averageRating} showValue />
                      <span className="text-xs text-slate-400">({fl.totalReviews || 0})</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-900">{fl.hourlyRate ? `${formatCurrency(fl.hourlyRate)}/hr` : 'Rate negotiable'}</span>
                      <div className="mt-0.5"><Badge status={fl.availabilityStatus} /></div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={(p) => { setPage(p); fetchFreelancers(p); }} />
          </>
        )}
      </div>
    </PublicLayout>
  );
}
