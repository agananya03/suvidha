import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /^\/(kiosk)/,
        handler: "NetworkFirst",
        options: {
          cacheName: "kiosk-pages",
          networkTimeoutSeconds: 3,
          expiration: { maxEntries: 20, maxAgeSeconds: 86400 },
        },
      },
      {
        urlPattern: /^\/api\/bills/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "bills-cache",
          expiration: { maxEntries: 50, maxAgeSeconds: 3600 },
        },
      },
      {
        urlPattern: /^\/api\/user\/dashboard/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "dashboard-cache",
          expiration: { maxEntries: 10, maxAgeSeconds: 3600 },
        },
      },
      {
        urlPattern: /\.(js|css|woff2)$/,
        handler: "CacheFirst",
        options: {
          cacheName: "static-assets",
          expiration: { maxEntries: 100, maxAgeSeconds: 604800 },
        },
      },
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default withPWA(nextConfig);
