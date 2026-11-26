import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { contractApi } from '../../api';
import { useToast } from '../../context/ToastContext';
import { Plus, Trash2 } from 'lucide-react';

export default function CreateContractPage() {
  const [searchParams] = useSearchParams();
  const proposalId = searchParams.get('proposalId') || '';
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    proposalId,
    title: '',
    terms: '',
    agreedAmount: '',
    dueDate: '',
  });

  const [milestones, setMilestones] = useState([
    { title: 'Initial Milestone', description: '', amount: '', dueDate: '' },
  ]);

  const addMilestone = () => {
    setMilestones([...milestones, { title: '', description: '', amount: '', dueDate: '' }]);
  };

  const removeMilestone = (idx) => {
    setMilestones(milestones.filter((_, i) => i !== idx));
  };

  const updateMilestone = (idx, field, val) => {
    setMilestones(milestones.map((m, i) => (i === idx ? { ...m, [field]: val } : m)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        proposalId: Number(form.proposalId),
        title: form.title,
        terms: form.terms,
        agreedAmount: Number(form.agreedAmount),
        dueDate: form.dueDate,
        milestones: milestones
          .filter((m) => m.title && m.amount)
          .map((m, idx) => ({
            title: m.title,
            description: m.description,
            amount: Number(m.amount),
            dueDate: m.dueDate || form.dueDate,
            sequenceOrder: idx + 1,
          })),
      };
      const res = await contractApi.create(payload);
      success('Contract created and sent to freelancer!');
      navigate(`/client/contracts/${res.data.data.id}`);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create contract');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Create Contract</h1>
        <p className="text-sm text-slate-500 mb-6">Define contract terms, total amount, and milestones</p>

        <form onSubmit={handleSubmit} className="card space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Proposal ID</label>
            <input
              type="number"
              required
              value={form.proposalId}
              onChange={(e) => setForm({ ...form, proposalId: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contract Title</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Full-Stack Web App Development Agreement"
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Agreed Amount (₹)</label>
              <input
                type="number"
                required
                min="1"
                value={form.agreedAmount}
                onChange={(e) => setForm({ ...form, agreedAmount: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Final Due Date</label>
              <input
                type="date"
                required
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contract Terms</label>
            <textarea
              required
              rows={4}
              value={form.terms}
              onChange={(e) => setForm({ ...form, terms: e.target.value })}
              placeholder="Scope of work, revision policy, IP ownership..."
              className="input-field"
            />
          </div>

          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900">Milestones</h3>
              <button type="button" onClick={addMilestone} className="btn-secondary text-xs">
                <Plus className="h-3.5 w-3.5" /> Add Milestone
              </button>
            </div>
            <div className="space-y-3">
              {milestones.map((m, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Milestone #{idx + 1}</span>
                    {milestones.length > 1 && (
                      <button type="button" onClick={() => removeMilestone(idx)} className="text-rose-500 hover:text-rose-700">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Milestone title"
                      value={m.title}
                      onChange={(e) => updateMilestone(idx, 'title', e.target.value)}
                      className="input-field"
                    />
                    <input
                      type="number"
                      placeholder="Amount (₹)"
                      value={m.amount}
                      onChange={(e) => updateMilestone(idx, 'amount', e.target.value)}
                      className="input-field"
                    />
                    <input
                      type="date"
                      value={m.dueDate}
                      onChange={(e) => updateMilestone(idx, 'dueDate', e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Description (optional)"
                    value={m.description}
                    onChange={(e) => updateMilestone(idx, 'description', e.target.value)}
                    className="input-field"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Creating...' : 'Send Contract Offer'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
