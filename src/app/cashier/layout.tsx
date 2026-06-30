export default function CashierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="cashier-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* We intentionally omit navigation headers/footers here to make it look like a native full-screen app */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
    </div>
  );
}
