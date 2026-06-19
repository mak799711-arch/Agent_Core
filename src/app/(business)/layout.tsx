export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="business-layout">
      {/* Здесь будет навигация бизнеса */}
      {children}
    </div>
  );
}
