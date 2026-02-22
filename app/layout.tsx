// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from './providers/theme-provider';
import { TutorialProvider } from './components/contexts/TutorialContext'; // Add this import
import { TutorialOverlay } from './components/tutorial/TutorialOverlay'; // Add this import
import './globals.css';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kazistack - Task Management',
  description: 'Manage your tasks efficiently with Kazistack',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <TutorialProvider> {/* Wrap with TutorialProvider */}
            {children}
            <TutorialOverlay /> {/* Add the tutorial overlay */}
            <Toaster 
              position="top-right" 
              richColors 
              closeButton 
              toastOptions={{
                style: {
                  background: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))',
                  border: '1px solid hsl(var(--border))',
                },
              }}
            />
          </TutorialProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}