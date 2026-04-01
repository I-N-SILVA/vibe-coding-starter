const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// You might need to insert additional domains in script-src if you are using external services
// NOTE: 'unsafe-eval' is currently required for some development tools and specific 
// framer-motion/lucide-react patterns. In a highly secure production environment, 
// this should be reviewed and removed if possible by using pre-compiled templates.
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.vercel-analytics.com https://*.vercel-scripts.com https://*.cloudflareinsights.com https://vercel.live;
  style-src 'self' 'unsafe-inline' https://api.fontshare.com https://fonts.googleapis.com;
  style-src-elem 'self' 'unsafe-inline' https://api.fontshare.com https://fonts.googleapis.com;
  img-src 'self' https://*.supabase.co blob: data:;
  media-src 'self' https://*.s3.amazonaws.com https://*.shipixen.com;
  connect-src 'self' https://*.supabase.co https://*.vercel-analytics.com https://*.vercel-scripts.com https://vercel.live https://api.fontshare.com https://fonts.googleapis.com https://cdn.fontshare.com;
  font-src 'self' data: https://fonts.gstatic.com https://cdn.fontshare.com https://api.fontshare.com;
`
  .replace(/\s{2,}/g, ' ')
  .trim();

const securityHeaders = [
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy,
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-DNS-Prefetch-Control
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

/**
 * @type {import('next/dist/next-server/server/config').NextConfig}
 **/
module.exports = () => {
  const plugins = [withBundleAnalyzer];
  return plugins.reduce((acc, next) => next(acc), {
    reactStrictMode: true,
    pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
    eslint: {
      dirs: ['app', 'components', 'layouts', 'scripts'],
    },
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'picsum.photos',
          port: '',
          pathname: '**/*',
        },
        {
          protocol: 'https',
          hostname: 'images.unsplash.com',
          port: '',
          pathname: '**/*',
        },
        {
          protocol: 'https',
          hostname: 'shipixen.com',
          port: '',
          pathname: '**/*',
        },
      ],
    },
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: securityHeaders,
        },
      ];
    },
    webpack: (config, options) => {
      config.module.rules.push({
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      });

      return config;
    },
  });
};
