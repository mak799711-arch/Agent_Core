export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-gradient)',
      padding: 'var(--layout-padding)',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background blur */}
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        background: 'var(--ambient-glow)',
        filter: 'blur(100px)',
        borderRadius: '50%',
        top: '10%',
        left: '20%',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        width: '350px',
        height: '350px',
        background: 'var(--ambient-glow)',
        filter: 'blur(100px)',
        borderRadius: '50%',
        bottom: '10%',
        right: '20%',
        pointerEvents: 'none'
      }} />

      <div style={{ zIndex: 1, maxWidth: '600px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--surface-border)',
          padding: '6px 14px',
          borderRadius: '30px',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'var(--primary)',
          letterSpacing: '0.5px',
          marginBottom: '2rem',
          textTransform: 'uppercase'
        }}>
          <span>🌐</span> Digital Employee Network
        </div>

        <h1 style={{
          fontSize: 'var(--title-size)',
          fontWeight: 800,
          letterSpacing: '-1.5px',
          lineHeight: '1.1',
          background: 'linear-gradient(135deg, #ffffff 40%, rgba(255,255,255,0.7) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '1.2rem',
          fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
          Agent Core
        </h1>
        
        <p style={{
          color: 'var(--foreground)',
          opacity: 0.7,
          maxWidth: '500px',
          fontSize: '1.05rem',
          lineHeight: 1.65,
          marginBottom: '2.5rem',
          marginRight: 'auto',
          marginLeft: 'auto'
        }}>
          The first universal digital employee network. Connect venue offers with local promoters and track acquisitions reliably.
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <a href="/login" className="btn-primary" style={{ 
            textDecoration: 'none',
            padding: '14px 32px',
            fontSize: '1rem',
            borderRadius: '12px'
          }}>
            Enter Portal 🚀
          </a>
        </div>
      </div>
    </div>
  );
}
