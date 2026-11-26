import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import { projectApi } from '../../api';
import { Search, Filter, Calendar, DollarSign, ChevronDown, Briefcase, Clock } from 'lucide-react';
import { formatCurrency, formatDate, timeSince } from '../../utils/format';

function ProjectCard({ project }) {
  return (
    <Link to={`/projects/${project.id}`} className="card hover:shadow-md hover:border-brand-200 transition block">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">{project.categoryName}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              project.status === 'OPEN' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
              {project.status}
            </span>
          </div>
          <h3 className="font-semibold text-slate-900 truncate">{project.title}</h3>
          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{project.description}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {project.requiredSkills?.slice(0, 4).map(s => (
              <span key={s.id} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{s.name}</span>
            ))}
            {project.requiredSkills?.length > 4 && (
              <span className="text-xs text-slate-400">+{project.requiredSkills.length - 4}</span>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          <div className="text-sm font-semibold text-slate-900">
            {formatCurrency(project.budgetMin)} – {formatCurrency(project.budgetMax)}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">{project.budgetType === 'FIXED' ? 'Fixed' : '/hr'}</div>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400">
        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {timeSince(project.createdAt)}</span>
        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Due {formatDate(project.deadline)}</span>
        <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {project.proposalCount} proposals</span>
        <span className="ml-auto font-medium text-slate-600">{project.experienceLevel}</span>
      </div>
    </Link>
  );
}

export default function BrowseProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ keyword: '', categoryId: '', budgetMin: '', budgetMax: '', experienceLevel: '', sortBy: 'latest', page: 0, size: 12 });
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState('');

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      if (!params.keyword) delete params.keyword;
      if (!params.categoryId) delete params.categoryId;
      if (!params.budgetMin) delete params.budgetMin;
      if (!params.budgetMax) delete params.budgetMax;
      if (!params.experienceLevel) delete params.experienceLevel;
      const res = await projectApi.browse(params);
      setProjects(res.data.data.content || []);
      setTotalPages(res.data.data.totalPages || 1);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  useEffect(() => {
    projectApi.getCategories().then(r => setCategories(r.data.data || []));
  }, []);

  const handleSearch = (e) => { e.preventDefault(); setFilters(f => ({ ...f, keyword: searchInput, page: 0 })); };
  const handleFilter = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 0 }));

  return (
    <PublicLayout>
      <div className="bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white mb-6">Browse Projects</h1>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border-0 bg-white shadow text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="Search projects by keyword, skill, or category..." />
            </div>
            <button type="submit" className="btn-primary px-6">Search</button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar filters */}
          <aside className="w-full lg:w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Category</h3>
                <select value={filters.categoryId} onChange={e => handleFilter('categoryId', e.target.value)}
                  className="input-field text-sm">
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Budget Range</h3>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min" value={filters.budgetMin} onChange={e => handleFilter('budgetMin', e.target.value)}
                    className="input-field text-sm w-1/2" />
                  <input type="number" placeholder="Max" value={filters.budgetMax} onChange={e => handleFilter('budgetMax', e.target.value)}
                    className="input-field text-sm w-1/2" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Experience Level</h3>
                {['', 'ENTRY', 'INTERMEDIATE', 'EXPERT'].map(lvl => (
                  <label key={lvl} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input type="radio" name="exp" value={lvl} checked={filters.experienceLevel === lvl} onChange={() => handleFilter('experienceLevel', lvl)}
                      className="accent-brand-600" />
                    <span className="text-sm text-slate-600">{lvl || 'Any Level'}</span>
                  </label>
                ))}
              </div>
              <button onClick={() => setFilters({ keyword: '', categoryId: '', budgetMin: '', budgetMax: '', experienceLevel: '', sortBy: 'latest', page: 0, size: 12 })}
                className="btn-secondary w-full text-sm">Clear Filters</button>
            </div>
          </aside>

          {/* Projects list */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">{loading ? 'Loading...' : `Showing ${projects.length} projects`}</p>
              <select value={filters.sortBy} onChange={e => handleFilter('sortBy', e.target.value)}
                className="input-field text-sm w-40">
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
            {loading ? (
              <div className="flex justify-center py-16"><div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full" /></div>
            ) : projects.length === 0 ? (
              <div className="text-center py-16 card">
                <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-700">No projects found</h3>
                <p className="text-slate-400 text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map(p => <ProjectCard key={p.id} project={p} />)}
              </div>
            )}
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button disabled={filters.page === 0} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))} className="btn-secondary">Previous</button>
                <span className="btn-secondary pointer-events-none">Page {filters.page + 1} of {totalPages}</span>
                <button disabled={filters.page >= totalPages - 1} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))} className="btn-secondary">Next</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
