import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const rawToken = params.get('token');
    if (!rawToken) {
      setError('Invalid or missing reset token. Please request a new reset link.');
      return;
    }
    setToken(rawToken);
    // Remove token from URL to prevent leakage via browser history / referrer
    window.history.replaceState({}, document.title, '/reset-password');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (data.success === false) {
        setError(data.message);
        setLoading(false);
        return;
      }
      setSuccess(true);
      setTimeout(() => navigate('/sign-in'), 3000);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="py-20 px-4 max-w-lg mx-auto text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8">
          <h1 className="text-2xl font-semibold text-green-800 mb-3">Password Reset!</h1>
          <p className="text-green-700 mb-2">
            Your password has been updated successfully.
          </p>
          <p className="text-sm text-green-600">Redirecting to Sign In...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 px-4 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center mb-2">Reset Password</h1>
      <p className="text-slate-500 text-center mb-8">Enter your new password below.</p>

      {!token && error ? (
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Link to="/forgot-password" className="text-blue-700 hover:underline">
            Request a new reset link
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="New password (min 8 characters)"
            className="border rounded-lg p-3 outline-none focus:ring-2 focus:ring-slate-300"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            className="border rounded-lg p-3 outline-none focus:ring-2 focus:ring-slate-300"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button
            disabled={loading || !token}
            className="bg-slate-700 text-white p-3 rounded-lg hover:opacity-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </form>
      )}

      <div className="text-center mt-6">
        <Link to="/sign-in" className="text-slate-600 hover:underline text-sm">
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
