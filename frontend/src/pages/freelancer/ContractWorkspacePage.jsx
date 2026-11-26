import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { contractApi, workApi, chatApi, reviewApi, disputeApi } from '../../api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/format';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import FileUpload from '../../components/ui/FileUpload';
import StarRating from '../../components/ui/StarRating';
import { MessageCircle, Check, X, Upload, Star, AlertTriangle, ArrowLeft, ExternalLink } from 'lucide-react';

export default function ContractWorkspacePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [contract, setContract] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [submitModal, setSubmitModal] = useState(false);
  const [subForm, setSubForm] = useState({ milestoneId: '', title: '', description: '', deliverableUrl: '', deliverableName: '' });
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [disputeModal, setDisputeModal] = useState(false);
  const [disputeData, setDisputeData] = useState({ reason: '', description: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [cRes, sRes] = await Promise.all([
        contractApi.getById(id),
        workApi.getForContract(id),
      ]);
      setContract(cRes.data.data);
      setSubmissions(sRes.data.data || []);
    } catch {
      error('Failed to load contract');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleAccept = async () => {
    try {
      await contractApi.accept(id);
      success('Contract accepted!');
      load();
    } catch (err) {
      error(err.response?.data?.message || 'Could not accept contract');
    }
  };

  const handleDecline = async () => {
    if (!window.confirm('Decline this contract offer?')) return;
    try {
      await contractApi.decline(id);
      success('Contract declined');
      load();
    } catch (err) {
      error(err.response?.data?.message || 'Could not decline contract');
    }
  };

  const handleWorkSubmit = async (e) => {
    e.preventDefault();
    try {
      await workApi.submit({
        contractId: contract.id,
        milestoneId: subForm.milestoneId ? Number(subForm.milestoneId) : null,
        title: subForm.title,
        description: subForm.description,
        deliverableUrl: subForm.deliverableUrl,
        deliverableName: subForm.deliverableName || 'Deliverable',
      });
      success('Work submitted for client review!');
      setSubmitModal(false);
      setSubForm({ milestoneId: '', title: '', description: '', deliverableUrl: '', deliverableName: '' });
      load();
    } catch (err) {
      error(err.response?.data?.message || 'Submission failed');
    }
  };

  const handleChat = async () => {
    try {
      const res = await chatApi.getOrCreate(contract.clientId, contract.id);
      navigate(`/chat/${res.data.data.id}`);
    } catch {
      error('Unable to open chat');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await reviewApi.submit({ contractId: contract.id, ...reviewData });
      success('Review submitted!');
      setReviewModal(false);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleRaiseDispute = async (e) => {
    e.preventDefault();
    try {
      await disputeApi.raise({ contractId: contract.id, ...disputeData });
      success('Dispute raised');
      setDisputeModal(false);
      load();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to raise dispute');
    }
  };

  if (loading) return <DashboardLayout><Spinner className="py-16" /></DashboardLayout>;
  if (!contract) return <DashboardLayout><div className="card">Contract not found.</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Link to="/freelancer/contracts" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600">
          <ArrowLeft className="h-4 w-4" /> Back to Contracts
        </Link>

        <div className="card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge status={contract.status} />
                <span className="text-xs text-slate-400">#{contract.id}</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">{contract.title}</h1>
              <p className="text-sm text-slate-500 mt-1">
                Client: <strong>{contract.clientName}</strong> • Amount: <strong>{formatCurrency(contract.agreedAmount)}</strong> • Due: {formatDate(contract.dueDate)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={handleChat} className="btn-secondary text-xs">
                <MessageCircle className="h-4 w-4" /> Chat
              </button>
              {contract.status === 'PENDING_ACCEPTANCE' && (
                <>
                  <button onClick={handleAccept} className="btn-primary text-xs">
                    <Check className="h-4 w-4" /> Accept Offer
                  </button>
                  <button onClick={handleDecline} className="btn-danger text-xs">
                    <X className="h-4 w-4" /> Decline
                  </button>
                </>
              )}
              {contract.status === 'ACTIVE' && (
                <>
                  <button onClick={() => setSubmitModal(true)} className="btn-primary text-xs">
                    <Upload className="h-4 w-4" /> Submit Work
                  </button>
                  <button onClick={() => setDisputeModal(true)} className="btn-danger text-xs">
                    <AlertTriangle className="h-4 w-4" /> Dispute
                  </button>
                </>
              )}
              {contract.status === 'COMPLETED' && (
                <button onClick={() => setReviewModal(true)} className="btn-primary text-xs">
                  <Star className="h-4 w-4" /> Review Client
                </button>
              )}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-semibold text-slate-700 mb-1">Contract Terms</h3>
            <p className="text-sm text-slate-600 whitespace-pre-line">{contract.terms}</p>
          </div>
        </div>

        {contract.milestones?.length > 0 && (
          <div className="card space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Milestones</h2>
            {contract.milestones.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{m.title}</span>
                    <Badge status={m.status} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Due: {formatDate(m.dueDate)}</p>
                </div>
                <span className="font-bold text-slate-900">{formatCurrency(m.amount)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Submitted Deliverables ({submissions.length})</h2>
          {submissions.length === 0 ? (
            <p className="text-sm text-slate-500">No deliverables submitted yet.</p>
          ) : (
            submissions.map((sub) => (
              <div key={sub.id} className="p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-900">{sub.title}</h4>
                    <Badge status={sub.status} />
                  </div>
                  <span className="text-xs text-slate-400">{formatDate(sub.createdAt)}</span>
                </div>
                <p className="text-sm text-slate-600">{sub.description}</p>
                {sub.deliverableUrl && (
                  <a href={sub.deliverableUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline">
                    {sub.deliverableName || 'View File'} <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                {sub.revisionFeedback && (
                  <p className="text-xs text-orange-700 bg-orange-50 p-2 rounded-lg">Client feedback: {sub.revisionFeedback}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <Modal isOpen={submitModal} onClose={() => setSubmitModal(false)} title="Submit Completed Work">
        <form onSubmit={handleWorkSubmit} className="space-y-4">
          {contract.milestones?.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Milestone (Optional)</label>
              <select value={subForm.milestoneId} onChange={(e) => setSubForm({ ...subForm, milestoneId: e.target.value })} className="input-field">
                <option value="">General Contract Deliverable</option>
                {contract.milestones.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
            </div>
          )}
          <input type="text" required placeholder="Deliverable Title" value={subForm.title} onChange={(e) => setSubForm({ ...subForm, title: e.target.value })} className="input-field" />
          <textarea required rows={3} placeholder="Summary of completed work..." value={subForm.description} onChange={(e) => setSubForm({ ...subForm, description: e.target.value })} className="input-field" />
          <FileUpload
            folder="deliverables"
            label="Upload Deliverable File"
            onUploadSuccess={(r, file) => setSubForm({ ...subForm, deliverableUrl: r.url, deliverableName: file.name })}
          />
          <input type="url" placeholder="Or paste external link (GitHub/Drive/Figma)" value={subForm.deliverableUrl} onChange={(e) => setSubForm({ ...subForm, deliverableUrl: e.target.value })} className="input-field" />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setSubmitModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Submit Deliverable</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={reviewModal} onClose={() => setReviewModal(false)} title="Rate & Review Client">
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <StarRating rating={reviewData.rating} onChange={(r) => setReviewData({ ...reviewData, rating: r })} size="lg" />
          <textarea required rows={4} placeholder="Share your experience..." value={reviewData.comment} onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })} className="input-field" />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setReviewModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Submit Review</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={disputeModal} onClose={() => setDisputeModal(false)} title="Raise a Dispute">
        <form onSubmit={handleRaiseDispute} className="space-y-4">
          <input type="text" required placeholder="Reason" value={disputeData.reason} onChange={(e) => setDisputeData({ ...disputeData, reason: e.target.value })} className="input-field" />
          <textarea required rows={4} placeholder="Details..." value={disputeData.description} onChange={(e) => setDisputeData({ ...disputeData, description: e.target.value })} className="input-field" />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setDisputeModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-danger">Submit Dispute</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
