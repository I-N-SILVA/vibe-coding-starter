import { Playfair_Display } from 'next/font/google';
import { siteConfig } from '@/data/config/site.settings';
import { ThemeProviders } from './theme-providers';
import { Metadata } from 'next';

import { colors } from '@/data/config/colors.js';

import '@/css/globals.css';
import { SearchProvider } from '@/components/shared/SearchProvider';
import { AnalyticsWrapper } from '@/components/shared/Analytics';
import { QueryProvider, ToastProvider } from '@/components/providers';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ClientShortcuts } from '@/components/shared/ClientShortcuts';
import { PWARegistration } from '@/components/shared/PWARegistration';
import { AuthProviderWrapper } from '@/components/providers/AuthProviderWrapper';

const displayFont = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-display',
});

const globalColors = colors;
const style: string[] = [];

Object.keys(globalColors).map((variant) => {
  return Object.keys(globalColors[variant]).map((color) => {
    const value = globalColors[variant][color];
    style.push(`--${variant}-${color}: ${value}`);
  });
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.title}`,
  },
  description: siteConfig.description,
  manifest: '/manifest.json',
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: './',
    siteName: siteConfig.title,
    images: [siteConfig.socialBanner],
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: './',
    types: {
      'application/rss+xml': `${siteConfig.siteUrl}/feed.xml`,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    title: siteConfig.title,
    card: 'summary_large_image',
    images: [siteConfig.socialBanner],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang={siteConfig.language}
      className={`${displayFont.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=general-sans@200,300,400,500,600,700&display=swap"
          rel="stylesheet"
        />
        <style>
          {`
          :root, :before, :after {
            ${style.join(';')}
          }
        `}
        </style>
        <link rel="icon" type="image/png" sizes="112x112" href="/favicon.png" />
        <link rel="icon" type="image/png" href="/static/branding/logo-circle.png" />
        <link rel="apple-touch-icon" href="/static/branding/logo-circle.png" />
        <meta name="description" content="10,000+ players are released each year. PLYAZ keeps their journeys alive. Elite tournament management and real-time statistics." />
      </head>

      <body className="min-h-screen bg-surface-elevated text-secondary-main antialiased selection:bg-accent-lighter/30">
        <ThemeProviders>
          <QueryProvider>
            <ToastProvider>
              <ErrorBoundary>
                <AnalyticsWrapper />
                <ClientShortcuts />
                <PWARegistration />

                <SearchProvider>
                  <AuthProviderWrapper>
                    {children}
                  </AuthProviderWrapper>
                </SearchProvider>
              </ErrorBoundary>
            </ToastProvider>
          </QueryProvider>
        </ThemeProviders>
      </body>
    </html>
  );
}
