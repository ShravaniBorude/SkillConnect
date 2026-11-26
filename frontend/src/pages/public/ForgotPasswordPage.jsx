import { useState } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import { authApi } from '../../api';
import { useToast } from '../../context/ToastContext';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { success, error } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
      success('Password reset instructions sent if the email exists.');
    } catch (err) {
      error(err.response?.data?.message || 'Unable to process request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="card">
          <h1 className="text-2xl font-bold text-slate-900">Forgot Password</h1>
          <p className="text-sm text-slate-500 mt-1">Enter your registered email to receive a password reset link.</p>

          {sent ? (
            <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800">
              If an account exists for <strong>{email}</strong>, a reset token has been sent.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-field pl-10"
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline">
              <ArrowLeft className="h-4 w-4" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
