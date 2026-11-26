import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import { authApi } from '../../api';
import Spinner from '../../components/ui/Spinner';
import { CheckCircle, XCircle } from 'lucide-react';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Verification token is missing.');
      return;
    }
    authApi.verifyEmail(token)
      .then((res) => {
        setStatus('success');
        setMessage(res.data.message || 'Email verified successfully!');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed or token expired.');
      });
  }, [token]);

  return (
    <PublicLayout>
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="card text-center py-10">
          {status === 'loading' && (
            <>
              <Spinner className="mb-4" />
              <p className="text-slate-600">Verifying your email address...</p>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-slate-900">Email Verified</h1>
              <p className="text-sm text-slate-600 mt-2">{message}</p>
              <Link to="/login" className="btn-primary mt-6">Continue to Sign In</Link>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle className="h-12 w-12 text-rose-600 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-slate-900">Verification Failed</h1>
              <p className="text-sm text-slate-600 mt-2">{message}</p>
              <Link to="/login" className="btn-secondary mt-6">Go to Sign In</Link>
            </>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
