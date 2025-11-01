/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    esmExternals: true,
    optimizePackageImports: ["react", "react-dom"],
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
