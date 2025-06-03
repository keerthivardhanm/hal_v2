import type {Metadata} from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from "@/components/ui/toaster";
import { Inter } from 'next/font/google'; // Using next/font for Inter

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'ApprovalFlow',
  description: 'Streamlined Approval Request Management',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Inter font is now handled by next/font, but keeping existing links if they were for other fonts. 
            The prompt explicitly mentioned Inter to be used via next/font if possible, 
            but general guidelines suggest <link> tags. Sticking to next/font for Inter as it's best practice.
            If other fonts are needed, add <link> tags below.
        */}
         <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet"></link>
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
