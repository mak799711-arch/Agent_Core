'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'partner' | 'business'>('partner');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await authService.signUp(email, password, role, fullName);
        router.push('/onboarding');
      } else {
        await authService.signIn(email, password);
        const user = await authService.getCurrentUser();
        if (user) {
          if (!user.cardBound) {
            router.push('/onboarding');
          } else {
            router.push(`/${user.role}`);
          }
        }
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="panel" style={{ width: '100%', maxWidth: '420px', padding: 'var(--panel-padding)' }}>
        
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.25rem', textAlign: 'center', letterSpacing: '-0.02em' }}>
          Agent Core
        </h1>
        <p style={{ color: '#888888', textAlign: 'center', marginBottom: '2.5rem', fontSize: '0.9rem' }}>
          {isSignUp ? 'Create your account' : 'Sign in to continue'}
        </p>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '12px 16px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.5rem', fontWeight: 500, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {isSignUp && (
            <div className="form-group">
              <label className="form-label">Full Name / Business Name</label>
              <input
                className="input-field"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="e.g. John Doe"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="input-field"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@domain.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="input-field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          {isSignUp && (
            <div className="form-group">
              <label className="form-label">Account Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setRole('partner')}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: role === 'partner' ? 'var(--primary)' : 'var(--surface-border)',
                    background: role === 'partner' ? 'rgba(249, 115, 22, 0.1)' : 'var(--background)',
                    color: 'var(--foreground)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Partner
                </button>
                <button
                  type="button"
                  onClick={() => setRole('business')}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: role === 'business' ? 'var(--primary)' : 'var(--surface-border)',
                    background: role === 'business' ? 'rgba(249, 115, 22, 0.1)' : 'var(--background)',
                    color: 'var(--foreground)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Business
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
          >
            {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.85rem' }}>
          <span style={{ color: '#888888' }}>
            {isSignUp ? 'Already have an account?' : 'New to Agent Core?'}
          </span>{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: 'inherit' }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>

      </div>
    </div>
  );
}
