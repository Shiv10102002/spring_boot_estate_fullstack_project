import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success === false) {
        setError(data.message);
        setLoading(false);
        return;
      }
      setSubmitted(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="py-20 px-4 max-w-lg mx-auto text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8">
          <h1 className="text-2xl font-semibold text-green-800 mb-3">Check your email</h1>
          <p className="text-green-700 mb-4">
            If an account with <strong>{email}</strong> exists, we've sent a password reset link.
          </p>
          <p className="text-sm text-green-600 mb-6">
            The link expires in 1 hour. Check your spam folder if you don't see it.
          </p>
          <Link to="/sign-in" className="text-slate-700 hover:underline font-semibold">
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 px-4 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center mb-2">Forgot Password</h1>
      <p className="text-slate-500 text-center mb-8">
        Enter your email and we'll send you a reset link.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email address"
          className="border rounded-lg p-3 outline-none focus:ring-2 focus:ring-slate-300"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          disabled={loading}
          className="bg-slate-700 text-white p-3 rounded-lg hover:opacity-95 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
      {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
      <div className="text-center mt-6">
        <Link to="/sign-in" className="text-slate-600 hover:underline text-sm">
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
