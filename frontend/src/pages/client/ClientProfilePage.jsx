import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { clientApi, authApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/ui/Spinner';
import FileUpload from '../../components/ui/FileUpload';

export default function ClientProfilePage() {
  const { refreshUser } = useAuth();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    avatarUrl: '',
    companyName: '',
    industry: '',
    website: '',
    location: '',
    bio: '',
  });

  useEffect(() => {
    clientApi.getMyProfile()
      .then((res) => {
        const d = res.data.data;
        setForm({
          fullName: d.fullName || '',
          avatarUrl: d.avatarUrl || '',
          companyName: d.companyName || '',
          industry: d.industry || '',
          website: d.website || '',
          location: d.location || '',
          bio: d.bio || '',
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await Promise.all([
        authApi.updateProfile({ fullName: form.fullName, avatarUrl: form.avatarUrl }),
        clientApi.updateProfile({
          companyName: form.companyName,
          industry: form.industry,
          website: form.website,
          location: form.location,
          bio: form.bio,
        }),
      ]);
      await refreshUser();
      success('Profile updated!');
    } catch (err) {
      error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <DashboardLayout><Spinner className="py-16" /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Client Profile</h1>
        <p className="text-sm text-slate-500 mb-6">Update your personal and company details</p>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div className="flex items-center gap-4">
            {form.avatarUrl && <img src={form.avatarUrl} alt="Avatar" className="w-14 h-14 rounded-full object-cover" />}
            <div className="flex-1">
              <FileUpload folder="avatars" accept="image/*" label="Upload Profile Photo" onUploadSuccess={(r) => setForm({ ...form, avatarUrl: r.url })} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input type="text" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="input-field" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
              <input type="text" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
              <input type="text" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className="input-field" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
              <input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input-field" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
            <textarea rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="input-field" />
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
