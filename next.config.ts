import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    turbopack: {
        root: process.cwd(),
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'assets.coingecko.com',
            },
            {
                protocol: 'https',
                hostname: 'coin-images.coingecko.com',
            },
        ],
    },
};

export default nextConfig;
