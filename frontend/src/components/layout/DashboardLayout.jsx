import { Link, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, FolderOpen, FileText, Users, MessageCircle,
  CreditCard, Star, Settings, Briefcase, TrendingUp, Shield, BarChart3
} from 'lucide-react';

function NavItem({ to, icon: Icon, label, active }) {
  return (
    <Link to={to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition
        ${active ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
      <Icon className="h-4 w-4 flex-shrink-0" />
      {label}
    </Link>
  );
}

function ClientSidebar({ path }) {
  return (
    <nav className="space-y-1">
      <NavItem to="/client/dashboard" icon={LayoutDashboard} label="Dashboard" active={path === '/client/dashboard'} />
      <NavItem to="/client/projects/new" icon={Briefcase} label="Post a Project" active={path.includes('/projects/new')} />
      <NavItem to="/client/projects" icon={FolderOpen} label="My Projects" active={path === '/client/projects'} />
      <NavItem to="/client/contracts" icon={FileText} label="Contracts" active={path.includes('/contracts')} />
      <NavItem to="/chat" icon={MessageCircle} label="Messages" active={path === '/chat'} />
      <NavItem to="/client/payments" icon={CreditCard} label="Payments" active={path.includes('/payments')} />
      <NavItem to="/client/reviews" icon={Star} label="Reviews" active={path.includes('/reviews')} />
      <NavItem to="/client/profile" icon={Settings} label="Profile" active={path === '/client/profile'} />
    </nav>
  );
}

function FreelancerSidebar({ path }) {
  return (
    <nav className="space-y-1">
      <NavItem to="/freelancer/dashboard" icon={LayoutDashboard} label="Dashboard" active={path === '/freelancer/dashboard'} />
      <NavItem to="/projects" icon={Briefcase} label="Browse Projects" active={path === '/projects'} />
      <NavItem to="/freelancer/proposals" icon={FileText} label="My Proposals" active={path === '/freelancer/proposals'} />
      <NavItem to="/freelancer/contracts" icon={FolderOpen} label="Contracts" active={path.includes('/contracts')} />
      <NavItem to="/chat" icon={MessageCircle} label="Messages" active={path === '/chat'} />
      <NavItem to="/freelancer/earnings" icon={TrendingUp} label="Earnings" active={path.includes('/earnings')} />
      <NavItem to="/freelancer/reviews" icon={Star} label="Reviews" active={path.includes('/reviews')} />
      <NavItem to="/freelancer/profile" icon={Settings} label="Profile" active={path === '/freelancer/profile'} />
    </nav>
  );
}

function AdminSidebar({ path }) {
  return (
    <nav className="space-y-1">
      <NavItem to="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" active={path === '/admin/dashboard'} />
      <NavItem to="/admin/users" icon={Users} label="Users" active={path === '/admin/users'} />
      <NavItem to="/admin/verifications" icon={Shield} label="Verifications" active={path.includes('/verifications')} />
      <NavItem to="/admin/projects" icon={Briefcase} label="Projects" active={path === '/admin/projects'} />
      <NavItem to="/admin/transactions" icon={CreditCard} label="Transactions" active={path.includes('/transactions')} />
      <NavItem to="/admin/disputes" icon={FileText} label="Disputes" active={path.includes('/disputes')} />
      <NavItem to="/admin/categories" icon={FolderOpen} label="Categories" active={path.includes('/categories')} />
      <NavItem to="/admin/reports" icon={BarChart3} label="Reports" active={path.includes('/reports')} />
    </nav>
  );
}

export default function DashboardLayout({ children }) {
  const { isClient, isFreelancer, isAdmin, user } = useAuth();
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Sidebar */}
        <aside className="hidden md:flex w-56 flex-col flex-shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm sticky top-20">
            <div className="mb-4 pb-3 border-b border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                {isClient ? 'Client' : isFreelancer ? 'Freelancer' : 'Admin'}
              </p>
              <p className="text-sm font-semibold text-slate-900 truncate">{user?.fullName}</p>
            </div>
            {isClient && <ClientSidebar path={path} />}
            {isFreelancer && <FreelancerSidebar path={path} />}
            {isAdmin && <AdminSidebar path={path} />}
          </div>
        </aside>
        {/* Main content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
