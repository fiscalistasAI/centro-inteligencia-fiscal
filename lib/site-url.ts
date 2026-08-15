export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL;
  const url = configuredUrl ?? (vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000");

  return url.replace(/\/$/, "");
}
