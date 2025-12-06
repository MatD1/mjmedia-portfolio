'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';
import Script from 'next/script';
import Header from './Header';
import Footer from './Footer';
import PageTransition from './PageTransition';
import SkipLink from '../ui/SkipLink';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const UMAMI_SCRIPT_URL = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;

  // Admin routes have their own layout
  if (isAdminRoute) {
    return (
      <SessionProvider>
        <div className="min-h-screen bg-[var(--bg-primary)]">
          {children}
          
          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--bg-secondary)',
                border: '2px solid var(--border-primary)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-pixel)',
              },
              className: 'pixel-text',
            }}
          />

          {/* Umami Analytics */}
          {UMAMI_WEBSITE_ID && UMAMI_SCRIPT_URL ? (
            <Script
              src={UMAMI_SCRIPT_URL}
              data-website-id={UMAMI_WEBSITE_ID}
              strategy="afterInteractive"
            />
          ) : null}
        </div>
      </SessionProvider>
    );
  }

  return (
    <SessionProvider>
      <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
        {/* Skip Links for Accessibility */}
        <SkipLink href="#main-content">Skip to main content</SkipLink>
        <SkipLink href="#navigation">Skip to navigation</SkipLink>
        
        <Header />
        
        <main id="main-content" className="flex-1">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
        
        <Footer />
        
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-secondary)',
              border: '2px solid var(--border-primary)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-pixel)',
            },
            className: 'pixel-text',
          }}
        />

        {/* Umami Analytics */}
        {UMAMI_WEBSITE_ID && UMAMI_SCRIPT_URL ? (
          <Script
            src={UMAMI_SCRIPT_URL}
            data-website-id={UMAMI_WEBSITE_ID}
            strategy="afterInteractive"
          />
        ) : null}
      </div>
    </SessionProvider>
  );
};

export default Layout;
