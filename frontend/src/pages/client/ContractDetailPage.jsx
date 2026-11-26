import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { contractApi, workApi, chatApi, reviewApi, disputeApi } from '../../api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/format';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import StarRating from '../../components/ui/StarRating';
import RazorpayCheckout from '../../components/payments/RazorpayCheckout';
import { MessageCircle, CheckCircle, RotateCcw, Star, AlertTriangle, ArrowLeft, ExternalLink } from 'lucide-react';

export default function ContractDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [contract, setContract] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [revModal, setRevModal] = useState({ open: false, submissionId: null, feedback: '' });
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

  const handleApproveWork = async (subId) => {
    try {
      await workApi.approve(subId);
      success('Work approved!');
      load();
    } catch (err) {
      error(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleRequestRevision = async (e) => {
    e.preventDefault();
    try {
      await workApi.requestRevision(revModal.submissionId, revModal.feedback);
      success('Revision requested');
      setRevModal({ open: false, submissionId: null, feedback: '' });
      load();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to request revision');
    }
  };

  const handleCompleteContract = async () => {
    if (!window.confirm('Mark this contract as completed?')) return;
    try {
      await contractApi.complete(id);
      success('Contract marked as completed!');
      load();
    } catch (err) {
      error(err.response?.data?.message || 'Cannot complete contract');
    }
  };

  const handleChat = async () => {
    try {
      const res = await chatApi.getOrCreate(contract.freelancerId, contract.id);
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
      success('Dispute raised. Admin will review shortly.');
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
        <Link to="/client/contracts" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600">
          <ArrowLeft className="h-4 w-4" /> Back to Contracts
        </Link>

        <div className="card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge status={contract.status} />
                <span className="text-xs text-slate-400">Contract #{contract.id}</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">{contract.title}</h1>
              <p className="text-sm text-slate-500 mt-1">
                Freelancer: <strong>{contract.freelancerName}</strong> • Due: {formatDate(contract.dueDate)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={handleChat} className="btn-secondary text-xs">
                <MessageCircle className="h-4 w-4" /> Chat
              </button>
              {contract.status === 'ACTIVE' && (
                <>
                  <RazorpayCheckout
                    contractId={contract.id}
                    amount={contract.agreedAmount}
                    description={`Contract: ${contract.title}`}
                    onSuccess={load}
                  />
                  <button onClick={handleCompleteContract} className="btn-secondary text-xs">
                    <CheckCircle className="h-4 w-4 text-emerald-600" /> Complete Contract
                  </button>
                  <button onClick={() => setDisputeModal(true)} className="btn-danger text-xs">
                    <AlertTriangle className="h-4 w-4" /> Dispute
                  </button>
                </>
              )}
              {contract.status === 'COMPLETED' && (
                <button onClick={() => setReviewModal(true)} className="btn-primary text-xs">
                  <Star className="h-4 w-4" /> Leave Review
                </button>
              )}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-semibold text-slate-700 mb-1">Terms</h3>
            <p className="text-sm text-slate-600 whitespace-pre-line">{contract.terms}</p>
          </div>
        </div>

        {/* Milestones */}
        {contract.milestones?.length > 0 && (
          <div className="card space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Milestones</h2>
            {contract.milestones.map((m) => (
              <div key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{m.title}</span>
                    <Badge status={m.status} />
                  </div>
                  {m.description && <p className="text-xs text-slate-500 mt-1">{m.description}</p>}
                  <p className="text-xs text-slate-400 mt-1">Due: {formatDate(m.dueDate)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900">{formatCurrency(m.amount)}</span>
                  {contract.status === 'ACTIVE' && m.status !== 'PAID' && (
                    <RazorpayCheckout
                      contractId={contract.id}
                      milestoneId={m.id}
                      amount={m.amount}
                      description={`Milestone: ${m.title}`}
                      onSuccess={load}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Work Submissions */}
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Work Submissions ({submissions.length})</h2>
          {submissions.length === 0 ? (
            <p className="text-sm text-slate-500">No work submitted yet.</p>
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
                    {sub.deliverableName || 'Download Deliverable'} <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                {sub.revisionFeedback && (
                  <p className="text-xs text-orange-700 bg-orange-50 p-2 rounded-lg">Feedback: {sub.revisionFeedback}</p>
                )}
                {sub.status === 'SUBMITTED' && (
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => handleApproveWork(sub.id)} className="btn-primary text-xs">
                      <CheckCircle className="h-3.5 w-3.5" /> Approve Work
                    </button>
                    <button onClick={() => setRevModal({ open: true, submissionId: sub.id, feedback: '' })} className="btn-secondary text-xs">
                      <RotateCcw className="h-3.5 w-3.5" /> Request Revision
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <Modal isOpen={revModal.open} onClose={() => setRevModal({ open: false, submissionId: null, feedback: '' })} title="Request Revision">
        <form onSubmit={handleRequestRevision} className="space-y-4">
          <textarea
            required
            rows={4}
            placeholder="Describe the changes needed..."
            value={revModal.feedback}
            onChange={(e) => setRevModal({ ...revModal, feedback: e.target.value })}
            className="input-field"
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setRevModal({ open: false, submissionId: null, feedback: '' })} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Submit Request</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={reviewModal} onClose={() => setReviewModal(false)} title="Rate & Review Freelancer">
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
            <StarRating rating={reviewData.rating} onChange={(r) => setReviewData({ ...reviewData, rating: r })} size="lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Comment</label>
            <textarea
              required
              rows={4}
              value={reviewData.comment}
              onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
              placeholder="Share your experience working with this freelancer..."
              className="input-field"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setReviewModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Submit Review</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={disputeModal} onClose={() => setDisputeModal(false)} title="Raise a Dispute">
        <form onSubmit={handleRaiseDispute} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
            <input
              type="text"
              required
              value={disputeData.reason}
              onChange={(e) => setDisputeData({ ...disputeData, reason: e.target.value })}
              placeholder="e.g., Missed deadline or incomplete deliverables"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Detailed Description</label>
            <textarea
              required
              rows={4}
              value={disputeData.description}
              onChange={(e) => setDisputeData({ ...disputeData, description: e.target.value })}
              className="input-field"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setDisputeModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-danger">Submit Dispute</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
