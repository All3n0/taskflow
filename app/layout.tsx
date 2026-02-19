import { ThemeProvider } from './providers/theme-provider';
import './globals.css';
import { Toaster } from 'sonner';
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
          <Toaster position='top-right' richColors closeButton/>
        </ThemeProvider>
      </body>
    </html>
  );
}