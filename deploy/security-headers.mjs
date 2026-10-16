export const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' https://www.googletagmanager.com https://static.cloudflareinsights.com",
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://cloudflareinsights.com",
  "worker-src 'self' blob:",
  "media-src 'self' blob: https:",
  "frame-src https://www.google.com https://maps.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

export function secureResponse(response, { privateRoute = false } = {}) {
  const result = new Response(response.body, response);
  result.headers.set('Content-Security-Policy', contentSecurityPolicy);
  result.headers.set('X-Frame-Options', 'DENY');
  result.headers.set('X-Content-Type-Options', 'nosniff');
  result.headers.set('Strict-Transport-Security', 'max-age=31536000');
  result.headers.set('Referrer-Policy', privateRoute ? 'no-referrer' : 'strict-origin-when-cross-origin');
  result.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (privateRoute) result.headers.set('Cache-Control', 'no-store');
  return result;
}
