export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="partner-layout">
      {/* Здесь будет навигация партнера (нижний tab bar для PWA) */}
      {children}
    </div>
  );
}
