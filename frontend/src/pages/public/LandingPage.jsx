import { Link } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import {
  Search, Shield, MessageCircle, CreditCard,
  Star, TrendingUp, ArrowRight, CheckCircle, Briefcase,
  Code2, Palette, BrainCircuit, Cloud, Smartphone
} from 'lucide-react';

function StatCard({ value, label }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="text-brand-100 text-sm mt-1">{label}</div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="card hover:shadow-md transition group">
      <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mb-4 group-hover:bg-brand-100 transition">
        <Icon className="h-6 w-6 text-brand-600" />
      </div>
      <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500">{desc}</p>
    </div>
  );
}

function CategoryCard({ icon: Icon, name, count, to }) {
  return (
    <Link to={to} className="card hover:shadow-md hover:border-brand-200 transition group text-center">
      <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mx-auto mb-3 group-hover:bg-brand-100 transition">
        <Icon className="h-6 w-6 text-brand-600" />
      </div>
      <h3 className="font-semibold text-slate-900 text-sm">{name}</h3>
      <p className="text-xs text-slate-400 mt-1">{count} projects</p>
    </Link>
  );
}

function StepCard({ num, title, desc }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">{num}</div>
      <div>
        <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
        <p className="text-sm text-slate-500">{desc}</p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-brand-400 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-brand-600 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-500/20 border border-brand-500/30 rounded-full px-4 py-1.5 text-sm font-medium text-brand-200 mb-6">
            <TrendingUp className="h-3.5 w-3.5" /> Trusted by 50,000+ professionals
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
            Connect. Collaborate.
            <br />
            <span className="text-brand-400">Deliver Excellence.</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10">
            SkillConnect is the professional freelance marketplace where top clients find exceptional freelancers for every project — from design to development, writing to marketing.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <Link to="/register" className="btn-primary text-base px-8 py-3.5 shadow-lg shadow-brand-500/30">
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/projects" className="inline-flex items-center gap-2 text-slate-300 hover:text-white font-medium transition">
              Browse Projects <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative bg-white/5 border-t border-white/10 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <StatCard value="50K+" label="Active Freelancers" />
              <StatCard value="30K+" label="Projects Completed" />
              <StatCard value="₹25Cr+" label="Total Paid Out" />
              <StatCard value="4.9★" label="Average Rating" />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Browse by Category</h2>
            <p className="text-slate-500 mt-2">Find experts in every field</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <CategoryCard icon={Code2} name="Web Development" count="2,400+" to="/projects?category=web-development" />
            <CategoryCard icon={Smartphone} name="Mobile Apps" count="1,200+" to="/projects?category=mobile-app-development" />
            <CategoryCard icon={Palette} name="UI/UX Design" count="980+" to="/projects?category=ui-ux-design" />
            <CategoryCard icon={BrainCircuit} name="Data Science & AI" count="650+" to="/projects?category=data-science-ai" />
          </div>
          <div className="text-center mt-8">
            <Link to="/categories" className="btn-secondary">View All Categories</Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Why SkillConnect?</h2>
            <p className="text-slate-500 mt-2">Everything you need to hire and get hired</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard icon={Shield} title="Verified Professionals" desc="All freelancers are identity-verified with document checks for your peace of mind." />
            <FeatureCard icon={MessageCircle} title="Real-Time Communication" desc="Built-in live chat and notifications keep projects moving without leaving the platform." />
            <FeatureCard icon={CreditCard} title="Secure Payments" desc="Razorpay-powered payments with milestone tracking ensure work is paid on time, every time." />
            <FeatureCard icon={Star} title="Transparent Reviews" desc="Honest ratings from real clients and freelancers help you make confident decisions." />
            <FeatureCard icon={TrendingUp} title="Milestone Tracking" desc="Break projects into milestones, track progress, and release payments step by step." />
            <FeatureCard icon={Briefcase} title="Contract Management" desc="Legally sound digital contracts protect both clients and freelancers on every engagement." />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">How It Works</h2>
            <p className="text-slate-500 mt-2">From idea to completion in four simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-lg font-semibold text-brand-600 mb-6">For Clients</h3>
              <div className="space-y-6">
                <StepCard num="1" title="Post Your Project" desc="Describe your requirements, set your budget, and add skills needed." />
                <StepCard num="2" title="Review Proposals" desc="Compare bids from verified freelancers and pick the best fit." />
                <StepCard num="3" title="Collaborate Easily" desc="Use real-time chat, shared documents, and milestone tracking." />
                <StepCard num="4" title="Pay Securely" desc="Release payment milestone by milestone when you're satisfied." />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-brand-600 mb-6">For Freelancers</h3>
              <div className="space-y-6">
                <StepCard num="1" title="Build Your Profile" desc="Showcase your skills, experience, and portfolio to attract clients." />
                <StepCard num="2" title="Find Perfect Projects" desc="Browse and filter hundreds of projects that match your expertise." />
                <StepCard num="3" title="Submit Your Proposal" desc="Write a compelling cover letter and propose your competitive rate." />
                <StepCard num="4" title="Get Paid Reliably" desc="Deliver great work and receive payment directly to your account." />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-brand-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-brand-100 text-lg mb-8">Join over 50,000 professionals on SkillConnect today. It's free to sign up.</p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <Link to="/register?role=CLIENT" className="bg-white text-brand-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-brand-50 transition shadow">
              Hire a Freelancer
            </Link>
            <Link to="/register?role=FREELANCER" className="bg-brand-700 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-brand-800 transition shadow">
              Find Work
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
