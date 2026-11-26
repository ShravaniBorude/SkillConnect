import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { freelancerApi, authApi, projectApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import FileUpload from '../../components/ui/FileUpload';
import Modal from '../../components/ui/Modal';
import { Plus, Trash2, ShieldCheck } from 'lucide-react';

export default function FreelancerProfilePage() {
  const { refreshUser } = useAuth();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allSkills, setAllSkills] = useState([]);
  const [profile, setProfile] = useState(null);
  const [docs, setDocs] = useState([]);

  const [form, setForm] = useState({
    fullName: '',
    avatarUrl: '',
    headline: '',
    bio: '',
    hourlyRate: '',
    experienceLevel: 'INTERMEDIATE',
    yearsOfExperience: '',
    education: '',
    experienceSummary: '',
    location: '',
    languages: '',
    availabilityStatus: 'AVAILABLE',
  });

  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [portModal, setPortModal] = useState(false);
  const [portForm, setPortForm] = useState({
    title: '', description: '', projectUrl: '', imageUrl: '', technologiesUsed: '',
  });
  const [docForm, setDocForm] = useState({ documentType: 'GOVERNMENT_ID', documentUrl: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [profRes, skillsRes, docsRes] = await Promise.all([
        freelancerApi.getMyProfile(),
        projectApi.getAllSkills(),
        freelancerApi.getDocuments(),
      ]);
      const d = profRes.data.data;
      setProfile(d);
      setAllSkills(skillsRes.data.data || []);
      setDocs(docsRes.data.data || []);
      setForm({
        fullName: d.fullName || '',
        avatarUrl: d.avatarUrl || '',
        headline: d.headline || '',
        bio: d.bio || '',
        hourlyRate: d.hourlyRate || '',
        experienceLevel: d.experienceLevel || 'INTERMEDIATE',
        yearsOfExperience: d.yearsOfExperience || '',
        education: d.education || '',
        experienceSummary: d.experienceSummary || '',
        location: d.location || '',
        languages: d.languages || '',
        availabilityStatus: d.availabilityStatus || 'AVAILABLE',
      });
    } catch {
      error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await Promise.all([
        authApi.updateProfile({ fullName: form.fullName, avatarUrl: form.avatarUrl }),
        freelancerApi.updateProfile({
          headline: form.headline,
          bio: form.bio,
          hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : null,
          experienceLevel: form.experienceLevel,
          yearsOfExperience: form.yearsOfExperience ? Number(form.yearsOfExperience) : null,
          education: form.education,
          experienceSummary: form.experienceSummary,
          location: form.location,
          languages: form.languages,
          availabilityStatus: form.availabilityStatus,
        }),
      ]);
      await refreshUser();
      success('Profile saved!');
      load();
    } catch (err) {
      error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async () => {
    if (!selectedSkillId) return;
    try {
      await freelancerApi.addSkill({ skillId: Number(selectedSkillId), proficiencyLevel: 'EXPERT', yearsUsed: 2 });
      success('Skill added');
      setSelectedSkillId('');
      load();
    } catch (err) {
      error(err.response?.data?.message || 'Could not add skill');
    }
  };

  const handleRemoveSkill = async (skillId) => {
    try {
      await freelancerApi.removeSkill(skillId);
      success('Skill removed');
      load();
    } catch {
      error('Failed to remove skill');
    }
  };

  const handleAddPortfolio = async (e) => {
    e.preventDefault();
    try {
      await freelancerApi.addPortfolio(portForm);
      success('Portfolio item added');
      setPortModal(false);
      setPortForm({ title: '', description: '', projectUrl: '', imageUrl: '', technologiesUsed: '' });
      load();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to add portfolio item');
    }
  };

  const handleDeletePortfolio = async (id) => {
    try {
      await freelancerApi.deletePortfolio(id);
      success('Portfolio item deleted');
      load();
    } catch {
      error('Failed to delete portfolio item');
    }
  };

  const handleUploadDoc = async (result) => {
    try {
      await freelancerApi.uploadDocument({ documentType: docForm.documentType, documentUrl: result.url });
      success('Verification document submitted!');
      load();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to submit document');
    }
  };

  if (loading) return <DashboardLayout><Spinner className="py-16" /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Freelancer Profile</h1>
            <p className="text-sm text-slate-500">Manage your public profile, skills, portfolio, and verification</p>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-brand-600" />
            <Badge status={profile?.verificationStatus} />
          </div>
        </div>

        {/* Basic Profile Form */}
        <form onSubmit={handleSave} className="card space-y-4">
          <div className="flex items-center gap-4">
            {form.avatarUrl && <img src={form.avatarUrl} alt="Avatar" className="w-16 h-16 rounded-2xl object-cover" />}
            <div className="flex-1">
              <FileUpload folder="avatars" accept="image/*" label="Update Profile Photo" onUploadSuccess={(r) => setForm({ ...form, avatarUrl: r.url })} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input type="text" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Professional Headline</label>
              <input type="text" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} placeholder="e.g., Senior Full-Stack Java & React Developer" className="input-field" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Hourly Rate (₹)</label>
              <input type="number" value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Experience</label>
              <select value={form.experienceLevel} onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })} className="input-field">
                <option value="ENTRY">Entry</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="EXPERT">Expert</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Years Exp.</label>
              <input type="number" value={form.yearsOfExperience} onChange={(e) => setForm({ ...form, yearsOfExperience: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Availability</label>
              <select value={form.availabilityStatus} onChange={(e) => setForm({ ...form, availabilityStatus: e.target.value })} className="input-field">
                <option value="AVAILABLE">Available</option>
                <option value="BUSY">Busy</option>
                <option value="UNAVAILABLE">Unavailable</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Languages</label>
              <input type="text" value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} placeholder="English, Hindi" className="input-field" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
            <textarea rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="input-field" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Experience Summary</label>
            <textarea rows={3} value={form.experienceSummary} onChange={(e) => setForm({ ...form, experienceSummary: e.target.value })} className="input-field" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Education</label>
            <input type="text" value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} className="input-field" />
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Profile'}</button>
          </div>
        </form>

        {/* Skills */}
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Skills</h2>
          <div className="flex gap-2">
            <select value={selectedSkillId} onChange={(e) => setSelectedSkillId(e.target.value)} className="input-field max-w-xs">
              <option value="">Select a skill to add...</option>
              {allSkills.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <button type="button" onClick={handleAddSkill} className="btn-primary">
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile?.skills?.map((s) => (
              <span key={s.skillId} className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 text-brand-700 rounded-lg text-xs font-semibold">
                {s.skillName}
                <button type="button" onClick={() => handleRemoveSkill(s.skillId)} className="text-brand-500 hover:text-rose-600">×</button>
              </span>
            ))}
          </div>
        </div>

        {/* Portfolio */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Portfolio</h2>
            <button type="button" onClick={() => setPortModal(true)} className="btn-secondary text-xs">
              <Plus className="h-4 w-4" /> Add Project
            </button>
          </div>
          {!profile?.portfolio?.length ? (
            <p className="text-sm text-slate-500">No portfolio items yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.portfolio.map((item) => (
                <div key={item.id} className="p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="w-full h-32 object-cover rounded-lg mb-2" />}
                    <h4 className="font-semibold text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                  </div>
                  <div className="flex justify-end mt-3">
                    <button onClick={() => handleDeletePortfolio(item.id)} className="text-xs text-rose-600 hover:underline flex items-center gap-1">
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Verification Documents */}
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Identity Verification</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <select value={docForm.documentType} onChange={(e) => setDocForm({ ...docForm, documentType: e.target.value })} className="input-field">
              <option value="GOVERNMENT_ID">Government ID</option>
              <option value="PASSPORT">Passport</option>
              <option value="CERTIFICATE">Professional Certificate</option>
            </select>
            <FileUpload folder="verifications" label="Upload Verification Document" onUploadSuccess={handleUploadDoc} />
          </div>
          {docs.length > 0 && (
            <div className="space-y-2">
              {docs.map((d) => (
                <div key={d.id} className="flex items-center justify-between text-sm p-3 bg-slate-50 rounded-xl">
                  <span>{d.documentType}</span>
                  <Badge status={d.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={portModal} onClose={() => setPortModal(false)} title="Add Portfolio Item">
        <form onSubmit={handleAddPortfolio} className="space-y-4">
          <input type="text" required placeholder="Project Title" value={portForm.title} onChange={(e) => setPortForm({ ...portForm, title: e.target.value })} className="input-field" />
          <textarea required rows={3} placeholder="Description" value={portForm.description} onChange={(e) => setPortForm({ ...portForm, description: e.target.value })} className="input-field" />
          <input type="url" placeholder="Live / Repo URL" value={portForm.projectUrl} onChange={(e) => setPortForm({ ...portForm, projectUrl: e.target.value })} className="input-field" />
          <input type="text" placeholder="Technologies used (e.g., React, Spring Boot)" value={portForm.technologiesUsed} onChange={(e) => setPortForm({ ...portForm, technologiesUsed: e.target.value })} className="input-field" />
          <FileUpload folder="portfolio" accept="image/*" label="Upload Thumbnail Image" onUploadSuccess={(r) => setPortForm({ ...portForm, imageUrl: r.url })} />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setPortModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Add Item</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
