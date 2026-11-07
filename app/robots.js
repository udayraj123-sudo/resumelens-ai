export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/owner", "/admin", "/company", "/setup", "/verify", "/reset", "/api"],
      },
    ],
  };
}