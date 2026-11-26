import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { projectApi } from '../../api';
import { useToast } from '../../context/ToastContext';
import FileUpload from '../../components/ui/FileUpload';
import { Paperclip, X } from 'lucide-react';

export default function PostProjectPage() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    budgetType: 'FIXED',
    budgetMin: '',
    budgetMax: '',
    experienceLevel: 'INTERMEDIATE',
    deadline: '',
    skillIds: [],
    attachmentUrls: [],
  });

  useEffect(() => {
    Promise.all([projectApi.getCategories(), projectApi.getAllSkills()])
      .then(([catRes, skillRes]) => {
        setCategories(catRes.data.data || []);
        setSkills(skillRes.data.data || []);
      })
      .catch(() => {});
  }, []);

  const toggleSkill = (id) => {
    setForm((prev) => ({
      ...prev,
      skillIds: prev.skillIds.includes(id)
        ? prev.skillIds.filter((s) => s !== id)
        : [...prev.skillIds, id],
    }));
  };

  const handleFileUploaded = (result) => {
    setForm((prev) => ({
      ...prev,
      attachmentUrls: [...prev.attachmentUrls, result.url],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        categoryId: Number(form.categoryId),
        budgetMin: Number(form.budgetMin),
        budgetMax: Number(form.budgetMax),
      };
      const res = await projectApi.create(payload);
      success('Project posted successfully!');
      navigate(`/client/projects/${res.data.data.id}`);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to post project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Post a New Project</h1>
        <p className="text-sm text-slate-500 mb-6">Describe your requirements to attract qualified freelancers</p>

        <form onSubmit={handleSubmit} className="card space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Project Title</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Build a React & Spring Boot SaaS Dashboard"
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                required
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="input-field"
              >
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Experience Level</label>
              <select
                value={form.experienceLevel}
                onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
                className="input-field"
              >
                <option value="ENTRY">Entry Level</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="EXPERT">Expert</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              required
              rows={5}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Explain project goals, deliverables, and expectations..."
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Budget Type</label>
              <select
                value={form.budgetType}
                onChange={(e) => setForm({ ...form, budgetType: e.target.value })}
                className="input-field"
              >
                <option value="FIXED">Fixed Price</option>
                <option value="HOURLY">Hourly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Min Budget (₹)</label>
              <input
                type="number"
                required
                min="1"
                value={form.budgetMin}
                onChange={(e) => setForm({ ...form, budgetMin: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Max Budget (₹)</label>
              <input
                type="number"
                required
                min="1"
                value={form.budgetMax}
                onChange={(e) => setForm({ ...form, budgetMax: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Deadline</label>
              <input
                type="date"
                required
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Required Skills</label>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => {
                const selected = form.skillIds.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSkill(s.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                      selected
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-brand-400'
                    }`}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Project Attachments</label>
            <FileUpload folder="projects" label="Upload specification or reference file" onUploadSuccess={handleFileUploaded} />
            {form.attachmentUrls.length > 0 && (
              <div className="mt-2 space-y-1">
                {form.attachmentUrls.map((url, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs bg-slate-50 px-3 py-1.5 rounded-lg">
                    <span className="flex items-center gap-1.5 truncate text-slate-600"><Paperclip className="h-3.5 w-3.5" /> {url}</span>
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, attachmentUrls: p.attachmentUrls.filter((_, i) => i !== idx) }))}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Posting...' : 'Publish Project'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
