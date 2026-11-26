import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Eye, EyeOff, Briefcase, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '', role: 'CLIENT', phone: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setErrors({ ...errors, [e.target.name]: '' }); };

  const validate = () => {
    const errs = {};
    if (!form.fullName || form.fullName.length < 2) errs.fullName = 'Full name must be at least 2 characters';
    if (!form.email || !/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) errs.email = 'Invalid email address';
    if (!form.password || form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const user = await register({ fullName: form.fullName, email: form.email, password: form.password, role: form.role, phone: form.phone });
      toast.success('Account created! Please verify your email.');
      if (user.role === 'ROLE_CLIENT') navigate('/client/dashboard', { replace: true });
      else navigate('/freelancer/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const roleOption = (value, title, description) => (
    <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition
      ${form.role === value ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-slate-300'}`}>
      <input type="radio" name="role" value={value} checked={form.role === value} onChange={handleChange} className="mt-0.5 accent-brand-600" />
      <div>
        <p className="font-semibold text-slate-900 text-sm">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
    </label>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 justify-center mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">SkillConnect</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="text-slate-500 mt-1">Join thousands of professionals on SkillConnect</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">I want to...</label>
              <div className="grid grid-cols-2 gap-3">
                {roleOption('CLIENT', 'Hire Freelancers', 'Post projects and find talent')}
                {roleOption('FREELANCER', 'Find Work', 'Build your profile and earn')}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full name</label>
              <input name="fullName" value={form.fullName} onChange={handleChange}
                className={`input-field ${errors.fullName ? 'border-rose-400' : ''}`} placeholder="John Doe" />
              {errors.fullName && <p className="mt-1 text-xs text-rose-600">{errors.fullName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                className={`input-field ${errors.email ? 'border-rose-400' : ''}`} placeholder="you@example.com" />
              {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <input name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange}
                    className={`input-field pr-10 ${errors.password ? 'border-rose-400' : ''}`} placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm password</label>
                <input name="confirmPassword" type={showPass ? 'text' : 'password'} value={form.confirmPassword} onChange={handleChange}
                  className={`input-field ${errors.confirmPassword ? 'border-rose-400' : ''}`} placeholder="••••••••" />
                {errors.confirmPassword && <p className="mt-1 text-xs text-rose-600">{errors.confirmPassword}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone (optional)</label>
              <input name="phone" value={form.phone} onChange={handleChange}
                className="input-field" placeholder="+91 9876543210" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : 'Create Account'}
            </button>
            <p className="text-xs text-slate-400 text-center">
              By signing up, you agree to our <a href="#" className="text-brand-600">Terms of Service</a> and <a href="#" className="text-brand-600">Privacy Policy</a>.
            </p>
          </form>
          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
