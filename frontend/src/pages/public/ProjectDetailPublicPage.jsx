import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import { projectApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate, timeSince } from '../../utils/format';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { Calendar, DollarSign, FileText, Paperclip, ArrowLeft, Send } from 'lucide-react';

export default function ProjectDetailPublicPage() {
  const { id } = useParams();
  const { isAuthenticated, isFreelancer } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectApi.getById(id)
      .then((r) => setProject(r.data.data))
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PublicLayout><Spinner className="py-20" /></PublicLayout>;
  if (!project) return <PublicLayout><div className="max-w-4xl mx-auto py-20 text-center text-slate-500">Project not found.</div></PublicLayout>;

  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link to="/projects" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Projects
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge status={project.status} />
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">{project.categoryName}</span>
                <span className="text-xs text-slate-400">Posted {timeSince(project.createdAt)}</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">{project.title}</h1>
              <div className="mt-6 prose prose-slate max-w-none">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Project Description</h3>
                <p className="text-slate-600 whitespace-pre-line leading-relaxed">{project.description}</p>
              </div>

              {project.requiredSkills?.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.requiredSkills.map((s) => (
                      <span key={s.id} className="px-3 py-1 bg-brand-50 text-brand-700 rounded-lg text-xs font-semibold">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {project.attachments?.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Attachments</h3>
                  <div className="space-y-2">
                    {project.attachments.map((att) => (
                      <a key={att.id} href={att.fileUrl} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 text-sm text-brand-600 hover:underline">
                        <Paperclip className="h-4 w-4" /> {att.fileName}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 flex items-center gap-1.5"><DollarSign className="h-4 w-4" /> Budget</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(project.budgetMin)} - {formatCurrency(project.budgetMax)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Budget Type</span>
                <span className="text-sm font-medium text-slate-700">{project.budgetType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Experience</span>
                <span className="text-sm font-medium text-slate-700">{project.experienceLevel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Deadline</span>
                <span className="text-sm font-medium text-slate-700">{formatDate(project.deadline)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 flex items-center gap-1.5"><FileText className="h-4 w-4" /> Proposals</span>
                <span className="text-sm font-medium text-slate-700">{project.proposalCount || 0}</span>
              </div>

              <hr className="border-slate-100" />

              {project.status === 'OPEN' && (
                isFreelancer ? (
                  <button onClick={() => navigate(`/freelancer/projects/${project.id}/propose`)} className="btn-primary w-full">
                    <Send className="h-4 w-4" /> Submit Proposal
                  </button>
                ) : !isAuthenticated ? (
                  <Link to="/login" className="btn-primary w-full">
                    Log in as Freelancer to Apply
                  </Link>
                ) : null
              )}
            </div>

            <div className="card">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">About the Client</h3>
              <p className="font-medium text-slate-900">{project.clientName}</p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
