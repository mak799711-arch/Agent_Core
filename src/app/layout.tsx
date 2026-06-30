import type { Metadata } from 'next';
import './globals.css';
import ThemeSelector from '@/app/components/ThemeSelector';

export const metadata: Metadata = {
  title: 'Agent Core | Referral Network',
  description: 'Global Local Acquisition Network starting in Bali',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AgentCore Cashier',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="orange">
      <head>
      </head>
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
