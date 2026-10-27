import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
    turbopack: {
        root: path.resolve(__dirname),
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
