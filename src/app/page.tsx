export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 50%, rgba(0, 210, 255, 0.08) 0%, #0a0a0a 100%)',
      padding: '1.5rem',
      textAlign: 'center'
    }}>
      <h1 style={{
        fontSize: '3rem',
        fontWeight: 800,
        letterSpacing: '-0.05em',
        background: 'linear-gradient(135deg, #fff 30%, rgba(255,255,255,0.5) 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '1rem'
      }}>
        Agent Core
      </h1>
      <p style={{
        color: 'var(--foreground)',
        opacity: 0.6,
        maxWidth: '480px',
        lineHeight: 1.6,
        marginBottom: '2.5rem'
      }}>
        The first universal digital employee network. Connect venue offers with promoters and track local acquisitions reliably.
      </p>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <a href="/login" className="btn-primary" style={{ textDecoration: 'none' }}>
          Enter Portal
        </a>
      </div>
    </div>
  );
}
