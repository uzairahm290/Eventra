import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { apiService } from '../services/api';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [devUserId, setDevUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!devToken || !devUserId) {
      setError('No reset token available. Submit your email first.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await apiService.post('/Auth/ResetPassword', {
        userId: devUserId,
        token: devToken,
        newPassword
      });
      toast.success('Password reset successfully. You can now sign in.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to reset password.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

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
      const res = await apiService.post('/Auth/ForgotPassword', { email });
      setSent(true);
      if (res && typeof res === 'object') {
        // Backend returns { resetToken, userId } in dev; capture for inline reset
        type ForgotPasswordResponse = { resetToken?: string; userId?: string };
        const response = res as ForgotPasswordResponse;
        setDevToken(response.resetToken ?? null);
        setDevUserId(response.userId ?? null);
      }
      toast.success('If an account with that email exists, a reset link has been sent.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to send reset link. Please try again later.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-cyan-50 to-teal-50 py-12 px-4 sm:px-6 lg:px-8">
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
              {/* Development-only inline reset (no email needed) */}
              {devToken && devUserId && (
                <div className="mt-4 p-4 rounded-xl border border-gray-200 bg-white/70">
                  <p className="text-sm text-gray-700 mb-3">No email flow configured. Use the dev token below to reset your password now.</p>
                  <form onSubmit={handleReset} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <input type="password" className="block w-full pl-3 pr-3 py-2 rounded-md border border-gray-300" value={newPassword} onChange={e=>setNewPassword(e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                      <input type="password" className="block w-full pl-3 pr-3 py-2 rounded-md border border-gray-300" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} required />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary w-full py-2">{loading ? 'Resetting...' : 'Reset Password'}</button>
                    <details className="text-xs text-gray-500 mt-2 select-all">
                      <summary className="cursor-pointer">Show dev token</summary>
                      <div className="mt-1">
                        <div><span className="font-medium">UserId:</span> {devUserId}</div>
                        <div className="break-all"><span className="font-medium">Token:</span> {devToken}</div>
                      </div>
                    </details>
                  </form>
                </div>
              )}
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
