import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) return setError('Please enter your email');

    const at = email.indexOf('@');
    if (at <= 0) return setError('Please enter a valid email (e.g. user@domain.com)');
    const dot = email.indexOf('.', at + 2); // require at least one char between @ and .
    if (dot === -1 || dot >= email.length - 1) return setError('Please enter a valid email (e.g. user@domain.com)');
    setLoading(true);

    try {
      // Demo: simulate API call
      await new Promise((r) => setTimeout(r, 800));
      // In a real app, call the backend endpoint to send a reset link
      setSent(true);
      toast.success('Password reset link sent! Check your email.');
    } catch {
      const msg = 'Failed to send reset link. Please try again later.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot your password?</h2>
          <p className="text-gray-600">Enter the email associated with your account and we'll send a reset link.</p>
        </div>

        <div className="glass-effect rounded-2xl shadow-soft-xl p-8 border border-gray-100">
          {sent ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                If an account with that email exists, we've sent a password reset link.
              </div>
              <div className="text-center">
                <Link to="/login" className="text-primary-600 hover:text-primary-500 font-medium">Back to sign in</Link>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-3 pr-3 py-2 rounded-md border border-gray-300"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send reset link'}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Remembered?</span>
                </div>
              </div>

              <div className="text-center">
                <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 text-base">Back to sign in →</Link>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500">© 2025 Eventra. All rights reserved.</p>
      </div>
    </div>
  );
};

export default ForgotPassword;
