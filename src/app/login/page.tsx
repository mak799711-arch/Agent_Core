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
        // New users always go through 3-step onboarding
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

  const handleDemoLogin = async (type: 'partner' | 'business') => {
    alert("Демо-аккаунты отключены, так как мы перешли на реальную базу данных (Supabase). Пожалуйста, используй кнопку Sign Up, чтобы создать свой первый реальный аккаунт!");
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--background)',
      padding: 'var(--layout-padding)',
      position: 'relative',
      overflow: 'hidden'
    }}>


      <div className="glass-panel" style={{
        width: '100%', maxWidth: '440px', padding: 'var(--panel-padding)',
        boxShadow: 'none', borderRadius: '24px',
        zIndex: 1, border: '1px solid var(--surface-border)', background: 'var(--surface)'
      }}>
        <h2 style={{
          fontSize: '2.2rem', fontWeight: 800,
          color: 'var(--foreground)',
          marginBottom: '0.4rem', textAlign: 'center', letterSpacing: '-1px'
        }}>
          Agent Core
        </h2>
        <p style={{
          color: 'var(--foreground)', opacity: 0.6, fontSize: '0.9rem',
          textAlign: 'center', marginBottom: '2rem', fontWeight: 500
        }}>
          {isSignUp ? 'Create your account — 3-step setup' : 'Sign in to your dashboard'}
        </p>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.2)',
            color: 'var(--error)', padding: '10px 14px', borderRadius: '10px',
            fontSize: '0.85rem', marginBottom: '1.5rem', fontWeight: 500
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {isSignUp && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', opacity: 0.7, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Full Name / Business Name</label>
              <input
                type="text" value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required placeholder="e.g. John Doe"
              />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.8rem', opacity: 0.7, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Email Address</label>
            <input
              type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              required placeholder="name@domain.com"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.8rem', opacity: 0.7, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Password</label>
            <input
              type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              required placeholder="••••••••"
            />
          </div>

          {isSignUp && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', opacity: 0.7, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Account Type</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.2rem' }}>
                <button type="button" onClick={() => setRole('partner')} style={{
                  flex: '1 1 150px', padding: '12px', borderRadius: '10px', border: '1px solid',
                  borderColor: role === 'partner' ? 'var(--primary)' : 'var(--surface-border)',
                  background: role === 'partner' ? 'rgba(34, 211, 238, 0.08)' : 'rgba(255,255,255,0.01)',
                  color: 'white', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s ease'
                }}>
                  Partner (Promoter)
                </button>
                <button type="button" onClick={() => setRole('business')} style={{
                  flex: '1 1 150px', padding: '12px', borderRadius: '10px', border: '1px solid',
                  borderColor: role === 'business' ? 'var(--primary)' : 'var(--surface-border)',
                  background: role === 'business' ? 'rgba(34, 211, 238, 0.08)' : 'rgba(255,255,255,0.01)',
                  color: 'white', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s ease'
                }}>
                  Business (Venue)
                </button>
              </div>
            </div>
          )}

          <button
            type="submit" disabled={loading} className="btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', borderRadius: '12px', padding: '14px' }}
          >
            {loading ? 'Processing...' : isSignUp ? 'Create Account →' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.8rem', fontSize: '0.85rem' }}>
          <span style={{ opacity: 0.6 }}>
            {isSignUp ? 'Already have an account?' : 'New to Agent Core?'}
          </span>{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 700 }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>


      </div>
    </div>
  );
}
