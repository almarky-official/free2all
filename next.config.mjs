/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  serverExternalPackages: ["ffmpeg-static"],
  experimental: {
    optimizePackageImports: ["lucide-react"]
  }
};

export default nextConfig;
