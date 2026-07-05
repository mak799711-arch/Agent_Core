'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'partner' | 'business' | null>(null);
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkExistingSession() {
      try {
        const user = await authService.getCurrentUser();
        if (user && user.role) {
          router.push(`/${user.role}`);
        }
      } catch (err) {
        // ignore
      }
    }
    checkExistingSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isSignUp && !role) {
      setError('Please select an account type (Partner or Business) before continuing.');
      return;
    }
    
    setLoading(true);

    try {
      if (isSignUp) {
        await authService.signUp(email, password, role!, fullName);
        router.push(`/${role}`);
      } else {
        await authService.signIn(email, password);
        const user = await authService.getCurrentUser();
        if (user) {
          router.push(`/${user.role}`);
        }
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isSignUp && !role) {
      setError('Please select an account type (Partner or Business) before continuing with Google.');
      return;
    }
    try {
      setLoading(true);
      if (typeof window !== 'undefined' && role) {
        localStorage.setItem('agent_core_pending_role', role);
      }
      await authService.signInWithGoogle();
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Google authentication failed');
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

        <form onSubmit={handleSubmit} action="javascript:void(0)">
          
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
            <div style={{ position: 'relative' }}>
              <input
                className="input-field"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#888',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
          </div>
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
            type="button"
            onClick={(e) => { e.preventDefault(); setIsSignUp(!isSignUp); }}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: 'inherit' }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>

      </div>
    </div>
  );
}
