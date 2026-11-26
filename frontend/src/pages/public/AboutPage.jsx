import { Link } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import { ShieldCheck, Zap, MessageSquare, CreditCard } from 'lucide-react';

export default function AboutPage() {
  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-slate-900">About SkillConnect</h1>
          <p className="text-lg text-slate-600 mt-4 leading-relaxed">
            SkillConnect is a modern freelance marketplace built to connect ambitious clients with verified,
            high-skill independent professionals through transparent contracts, milestone tracking, and real-time collaboration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <ShieldCheck className="h-8 w-8 text-brand-600 mb-3" />
            <h3 className="text-lg font-semibold text-slate-900">Verified Talent & Trust</h3>
            <p className="text-sm text-slate-600 mt-2">
              Freelancers can verify their identity and showcase real portfolio projects, while bidirectional reviews keep quality high.
            </p>
          </div>
          <div className="card">
            <CreditCard className="h-8 w-8 text-brand-600 mb-3" />
            <h3 className="text-lg font-semibold text-slate-900">Milestone-Based Payments</h3>
            <p className="text-sm text-slate-600 mt-2">
              Powered by Razorpay with HMAC-SHA256 server-side signature verification and transparent platform fee tracking.
            </p>
          </div>
          <div className="card">
            <MessageSquare className="h-8 w-8 text-brand-600 mb-3" />
            <h3 className="text-lg font-semibold text-slate-900">Real-Time WebSocket Chat</h3>
            <p className="text-sm text-slate-600 mt-2">
              Instant one-to-one messaging and live notifications keep clients and freelancers aligned from proposal to delivery.
            </p>
          </div>
          <div className="card">
            <Zap className="h-8 w-8 text-brand-600 mb-3" />
            <h3 className="text-lg font-semibold text-slate-900">Structured Work Delivery</h3>
            <p className="text-sm text-slate-600 mt-2">
              Submit deliverables, request revisions, approve completed work, and resolve disputes through a fair admin workflow.
            </p>
          </div>
        </div>

        <div className="card bg-brand-600 text-white text-center py-10">
          <h2 className="text-2xl font-bold">Ready to start your next project?</h2>
          <p className="text-brand-100 mt-2">Join SkillConnect as a client or freelancer today.</p>
          <div className="flex justify-center gap-4 mt-6">
            <Link to="/register" className="px-6 py-2.5 rounded-xl bg-white text-brand-700 font-semibold hover:bg-brand-50 transition">
              Create Account
            </Link>
            <Link to="/projects" className="px-6 py-2.5 rounded-xl border border-brand-400 text-white font-semibold hover:bg-brand-700 transition">
              Browse Projects
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
