import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { projectApi, proposalApi, chatApi } from '../../api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/format';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { Check, X, MessageCircle, FileSignature, ArrowLeft } from 'lucide-react';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [project, setProject] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [projRes, propRes] = await Promise.all([
        projectApi.getById(id),
        proposalApi.projectProposals(id),
      ]);
      setProject(projRes.data.data);
      setProposals(propRes.data.data || []);
    } catch {
      error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleShortlist = async (propId) => {
    try {
      await proposalApi.shortlist(propId);
      success('Proposal shortlisted');
      load();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to shortlist');
    }
  };

  const handleReject = async (propId) => {
    try {
      await proposalApi.reject(propId);
      success('Proposal rejected');
      load();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to reject');
    }
  };

  const handleChat = async (freelancerId) => {
    try {
      const res = await chatApi.getOrCreate(freelancerId);
      navigate(`/chat/${res.data.data.id}`);
    } catch {
      error('Could not open chat');
    }
  };

  if (loading) return <DashboardLayout><Spinner className="py-16" /></DashboardLayout>;
  if (!project) return <DashboardLayout><div className="card">Project not found.</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Link to="/client/projects" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600">
          <ArrowLeft className="h-4 w-4" /> Back to My Projects
        </Link>

        <div className="card">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Badge status={project.status} />
              <span className="text-xs text-slate-500">{project.categoryName}</span>
            </div>
            <span className="text-sm font-semibold text-slate-900">
              {formatCurrency(project.budgetMin)} - {formatCurrency(project.budgetMax)} ({project.budgetType})
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{project.title}</h1>
          <p className="text-slate-600 mt-3 whitespace-pre-line">{project.description}</p>
          <p className="text-xs text-slate-400 mt-4">Deadline: {formatDate(project.deadline)}</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Received Proposals ({proposals.length})</h2>
          {proposals.length === 0 ? (
            <div className="card text-center py-8 text-sm text-slate-500">No proposals received yet.</div>
          ) : (
            proposals.map((prop) => (
              <div key={prop.id} className="card space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Link to={`/freelancers/${prop.freelancerId}`} className="font-semibold text-slate-900 hover:text-brand-600">
                        {prop.freelancerName}
                      </Link>
                      <Badge status={prop.status} />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Proposed: <strong className="text-slate-800">{formatCurrency(prop.proposedBudget)}</strong> • Est. {prop.estimatedDays} days
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => handleChat(prop.freelancerId)} className="btn-secondary text-xs">
                      <MessageCircle className="h-3.5 w-3.5" /> Chat
                    </button>
                    {prop.status === 'SUBMITTED' && (
                      <button onClick={() => handleShortlist(prop.id)} className="btn-secondary text-xs">
                        <Check className="h-3.5 w-3.5" /> Shortlist
                      </button>
                    )}
                    {(prop.status === 'SUBMITTED' || prop.status === 'SHORTLISTED') && (
                      <>
                        <button
                          onClick={() => navigate(`/client/contracts/new?proposalId=${prop.id}`)}
                          className="btn-primary text-xs"
                        >
                          <FileSignature className="h-3.5 w-3.5" /> Hire & Create Contract
                        </button>
                        <button onClick={() => handleReject(prop.id)} className="btn-danger text-xs">
                          <X className="h-3.5 w-3.5" /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl whitespace-pre-line">{prop.coverLetter}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
