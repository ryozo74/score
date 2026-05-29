import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: '.next',
  generateBuildId: () => 'score-fe-build',
  experimental: {
    outputFileTracingExcludes: {
      '*': ['**/.git/**', '**/node_modules/**']
    }
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/index',
          destination: '/indexhub',
        },
      ],
      afterFiles: [
        {
          source: '/api/bff/:path*',
          destination: 'http://localhost:8100/api/bff/:path*',
        },
        {
          source: '/api/health',
          destination: 'http://localhost:8100/api/health',
        },
      ],
      fallback: [],
    };
  },
}

export default withNextIntl(nextConfig);
