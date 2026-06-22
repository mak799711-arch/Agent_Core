'use client';

import { useState, useEffect, useRef } from 'react';

const themeOptions = [
  { id: 'dark', name: 'Dark', label: '🌙 Dark', gradient: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#3b82f6' },
  { id: 'light', name: 'Light', label: '☀️ Light', gradient: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)', color: '#0284c7' },
  { id: 'neon', name: 'Neon', label: '🌴 Neon', gradient: 'linear-gradient(135deg, #00d2ff 0%, #ff007f 100%)', color: '#00d2ff' }
] as const;

export default function ThemeSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState<'neon' | 'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'neon' || savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
      }
    }
    return 'dark';
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Handle click outside to collapse
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeTheme = (themeId: 'neon' | 'dark' | 'light') => {
    setActiveTheme(themeId);
    localStorage.setItem('theme', themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    setIsOpen(false);
    
    // Dispatch a custom event to notify other components if necessary
    window.dispatchEvent(new Event('themechange'));
  };

  const currentThemeOpt = themeOptions.find(t => t.id === activeTheme) || themeOptions[0];

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '10px',
        fontFamily: 'Inter, sans-serif'
      }}
    >
      {/* Expanded options */}
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--glass-border)',
          borderRadius: '16px',
          padding: '8px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          transform: isOpen ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(10px)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          transformOrigin: 'bottom right'
        }}
      >
        {themeOptions.map((t) => (
          <button
            key={t.id}
            onClick={() => changeTheme(t.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: activeTheme === t.id ? 'rgba(255,255,255,0.08)' : 'transparent',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '10px',
              color: 'var(--foreground)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              textAlign: 'left',
              width: '130px',
              transition: 'background 0.2s ease',
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = activeTheme === t.id ? 'rgba(255,255,255,0.08)' : 'transparent';
            }}
          >
            <span 
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: t.gradient,
                boxShadow: `0 0 8px ${t.color}`
              }}
            />
            {t.label}
          </button>
        ))}
      </div>

      {/* Primary Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: currentThemeOpt.gradient,
          border: '1px solid var(--glass-border)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 4px 20px ${currentThemeOpt.color}50`,
          transition: 'all 0.3s ease',
          opacity: isOpen ? 1 : 0.65,
          outline: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.transform = 'scale(1.08)';
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.opacity = '0.65';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title="Switch Theme"
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke={activeTheme === 'light' ? '#1c1e21' : '#ffffff'} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          style={{
            transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.4s ease'
          }}
        >
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      </button>
    </div>
  );
}
