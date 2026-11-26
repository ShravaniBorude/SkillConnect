import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { projectApi, proposalApi } from '../../api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';

export default function SubmitProposalPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    coverLetter: '',
    proposedBudget: '',
    estimatedDays: '',
  });

  useEffect(() => {
    projectApi.getById(projectId)
      .then((res) => setProject(res.data.data))
      .catch(() => error('Project not found'))
      .finally(() => setLoading(false));
  }, [projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await proposalApi.submit({
        projectId: Number(projectId),
        coverLetter: form.coverLetter,
        proposedBudget: Number(form.proposedBudget),
        estimatedDays: Number(form.estimatedDays),
      });
      success('Proposal submitted successfully!');
      navigate('/freelancer/proposals');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to submit proposal');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <DashboardLayout><Spinner className="py-16" /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Submit Proposal</h1>
          {project && (
            <p className="text-sm text-slate-500 mt-1">
              For: <strong>{project.title}</strong> (Budget: {formatCurrency(project.budgetMin)} - {formatCurrency(project.budgetMax)})
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Proposed Budget (₹)</label>
              <input
                type="number"
                required
                min="1"
                value={form.proposedBudget}
                onChange={(e) => setForm({ ...form, proposedBudget: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Days to Complete</label>
              <input
                type="number"
                required
                min="1"
                value={form.estimatedDays}
                onChange={(e) => setForm({ ...form, estimatedDays: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cover Letter</label>
            <textarea
              required
              rows={6}
              value={form.coverLetter}
              onChange={(e) => setForm({ ...form, coverLetter: e.target.value })}
              placeholder="Explain why you're the best fit for this project, your approach, and relevant experience..."
              className="input-field"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Submitting...' : 'Submit Proposal'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
