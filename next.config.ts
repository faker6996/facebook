import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["platform-lookaside.fbsbx.com", "picsum.photos", "lh3.googleusercontent.com"],
  },
  webpack: (config, { isServer }) => {
    // Fix for pg-cloudflare issue
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }

    // Ignore cloudflare-specific modules
    config.externals = config.externals || [];
    config.externals.push({
      'cloudflare:sockets': 'commonjs cloudflare:sockets',
      'pg-native': 'commonjs pg-native',
    });

    return config;
  },
};

export default withNextIntl(nextConfig);
