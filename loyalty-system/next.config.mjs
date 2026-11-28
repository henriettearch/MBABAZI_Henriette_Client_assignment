

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prevent Next.js from removing trailing slashes from API requests.
  skipTrailingSlashRedirect: true,

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: `${process.env.BACKEND_URL || "http://127.0.0.1:8000"}/api/:path*/`,
      },
    ];
  },
};

export default nextConfig;
