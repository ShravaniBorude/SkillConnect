import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell, MessageCircle, User, LogOut, Briefcase, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, isAuthenticated, logout, isClient, isFreelancer, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const getDashboardLink = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isClient) return '/client/dashboard';
    if (isFreelancer) return '/freelancer/dashboard';
    return '/dashboard';
  };

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">SkillConnect</span>
          </Link>

          {/* Center Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/projects" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition">Browse Projects</Link>
            <Link to="/freelancers" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition">Find Freelancers</Link>
            <Link to="/categories" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition">Categories</Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/chat" className="p-2 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition">
                  <MessageCircle className="h-5 w-5" />
                </Link>
                <Link to="/notifications" className="p-2 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition">
                  <Bell className="h-5 w-5" />
                </Link>
                <div className="relative">
                  <button onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-slate-100 transition">
                    <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center overflow-hidden">
                      {user?.avatarUrl
                        ? <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                        : <User className="h-4 w-4 text-brand-600" />}
                    </div>
                    <span className="text-sm font-medium text-slate-700 max-w-24 truncate">{user?.fullName}</span>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
                      <Link to={getDashboardLink()} onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        Dashboard
                      </Link>
                      {!isAdmin && (
                        <Link to={isClient ? '/client/profile' : '/freelancer/profile'} onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                          <User className="h-4 w-4" /> My Profile
                        </Link>
                      )}
                      <hr className="my-1 border-slate-200" />
                      <button onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50">
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm">Log in</Link>
                <Link to="/register" className="btn-primary text-sm">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
