/** @type {import('next').NextConfig} */

const securityHeaders = [
  // nobody can embed the site inside another site (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // browser must trust the file type we send
  { key: "X-Content-Type-Options", value: "nosniff" },
  // do not leak full page addresses to other sites
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // the site never needs camera, microphone or location
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // always use https once a browser has visited
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

const nextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // old single-company pages were removed, so old links are sent to the right place
  async redirects() {
    return [
      { source: "/admin", destination: "/company/login", permanent: false },
      { source: "/admin/:path*", destination: "/company/login", permanent: false },
      { source: "/candidate", destination: "/", permanent: false },
      { source: "/candidate/:path*", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;