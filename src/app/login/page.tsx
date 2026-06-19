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
      } else {
        await authService.signIn(email, password);
      }
      
      // Направляем в соответствующий дашборд
      const user = await authService.getCurrentUser();
      if (user?.role === 'partner') {
        router.push('/partner');
      } else if (user?.role === 'business') {
        router.push('/business');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (type: 'partner' | 'business') => {
    setError('');
    setLoading(true);
    try {
      const email = type === 'partner' ? 'partner@agent.core' : 'business@agent.core';
      await authService.signIn(email, 'password123');
      router.push(`/${type}`);
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 10% 20%, rgba(0, 210, 255, 0.1) 0%, rgba(255, 0, 127, 0.05) 90%), #0a0a0a',
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '2.5rem',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 700,
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem',
          textAlign: 'center'
        }}>
          Agent Core
        </h2>
        <p style={{
          color: 'var(--foreground)',
          opacity: 0.6,
          fontSize: '0.9rem',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          {isSignUp ? 'Create your digital employee account' : 'Sign in to your dashboard'}
        </p>

        {error && (
          <div style={{
            background: 'rgba(255, 77, 79, 0.1)',
            border: '1px solid var(--error)',
            color: 'var(--error)',
            padding: '0.75rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '1.5rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {isSignUp && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>Full Name / Business Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--surface-border)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: 'white',
                  outline: 'none'
                }}
              />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--surface-border)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: 'white',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--surface-border)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: 'white',
                outline: 'none'
              }}
            />
          </div>

          {isSignUp && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>Account Type</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                <button
                  type="button"
                  onClick={() => setRole('partner')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: role === 'partner' ? 'var(--primary)' : 'var(--surface-border)',
                    background: role === 'partner' ? 'rgba(0, 210, 255, 0.1)' : 'transparent',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Partner (Promoter)
                </button>
                <button
                  type="button"
                  onClick={() => setRole('business')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: role === 'business' ? 'var(--primary)' : 'var(--surface-border)',
                    background: role === 'business' ? 'rgba(0, 210, 255, 0.1)' : 'transparent',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Business (Venue)
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem' }}>
          <span style={{ opacity: 0.6 }}>
            {isSignUp ? 'Already have an account?' : 'New to Agent Core?'}
          </span>{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>

        <div style={{ margin: '2rem 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--surface-border)' }}></div>
          <span style={{ fontSize: '0.75rem', opacity: 0.4 }}>DEMO LOGINS</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--surface-border)' }}></div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => handleDemoLogin('partner')}
            disabled={loading}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--surface-border)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.8rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px'
            }}
          >
            <span style={{ fontWeight: 600 }}>Demo Partner</span>
            <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>Bali Promoter</span>
          </button>
          <button
            onClick={() => handleDemoLogin('business')}
            disabled={loading}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--surface-border)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.8rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px'
            }}
          >
            <span style={{ fontWeight: 600 }}>Demo Business</span>
            <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>Venue Manager</span>
          </button>
        </div>
      </div>
    </div>
  );
}
