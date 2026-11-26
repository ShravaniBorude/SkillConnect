import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { projectApi, adminApi } from '../../api';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/ui/Spinner';
import { Plus } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', slug: '', description: '' });
  const { success, error } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const res = await projectApi.getCategories();
      setCategories(res.data.data || []);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createCategory({
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: form.description,
        icon: 'folder',
      });
      success('Category created');
      setForm({ name: '', slug: '', description: '' });
      load();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create category');
    }
  };

  const handleToggle = async (cat) => {
    try {
      await adminApi.toggleCategory(cat.id, !cat.active);
      success('Category updated');
      load();
    } catch {
      error('Failed to update category');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Category Management</h1>
          <p className="text-sm text-slate-500">Add or toggle project categories</p>
        </div>

        <form onSubmit={handleCreate} className="card grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Name</label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Slug</label>
            <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" />
          </div>
          <button type="submit" className="btn-primary">
            <Plus className="h-4 w-4" /> Add Category
          </button>
        </form>

        {loading ? (
          <Spinner className="py-12" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((c) => (
              <div key={c.id} className="card flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-900">{c.name}</h3>
                  <p className="text-xs text-slate-500">{c.description}</p>
                </div>
                <button
                  onClick={() => handleToggle(c)}
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${c.active !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                >
                  {c.active !== false ? 'Active' : 'Inactive'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
