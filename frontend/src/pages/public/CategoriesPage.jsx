import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import { projectApi } from '../../api';
import Spinner from '../../components/ui/Spinner';
import { FolderOpen, ArrowRight } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectApi.getCategories()
      .then((r) => setCategories(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-3xl font-bold text-slate-900">Explore Service Categories</h1>
          <p className="text-slate-500 mt-2">Discover specialized freelancers and active projects across every domain</p>
        </div>

        {loading ? (
          <Spinner className="py-16" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/projects?categoryId=${cat.id}`}
                className="card hover:border-brand-400 hover:shadow-md transition group flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 group-hover:bg-brand-600 group-hover:text-white transition">
                    <FolderOpen className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-lg">{cat.name}</h3>
                  {cat.description && <p className="text-sm text-slate-500 mt-1">{cat.description}</p>}
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold text-brand-600 mt-5">
                  Browse projects <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
