/** @type {import('next').NextConfig} */
const nextConfig = {
    /* config options here */
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'placehold.co',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'picsum.photos',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'afuwgdutybfeopffxwnu.supabase.co', // Your Supabase project hostname
                port: '',
                pathname: '/storage/v1/object/public/**', // Allow all images from public storage buckets
            },
        ],
    },
};

module.exports = nextConfig;
