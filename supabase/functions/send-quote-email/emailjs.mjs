// Server-only EmailJS adapter. Never import this module in the browser.
export const NOTIFICATION_RECIPIENT = "info@3dyanimda.com";
const brands = {
  "3dyanimda": "3dyanimda.com",
  "3dsanayi": "3dsanayi.com",
  "maketyanimda": "maketyanimda.com",
  "parcayanimda": "parcayanimda.com",
};
const email = /^[^\s@<>,";]+@[^\s@<>,";]+\.[^\s@<>,";]+$/;
export class EmailDeliveryError extends Error {
  constructor(code, status = 503) { super(code); this.status = status; }
}
export function readEmailJSConfig(get) {
  const names = ["EMAILJS_SERVICE_ID", "EMAILJS_QUOTE_TEMPLATE_ID", "EMAILJS_PUBLIC_KEY", "EMAILJS_PRIVATE_KEY"];
  const values = names.map(name => String(get(name) || "").trim());
  if (values.some(value => !value)) throw new EmailDeliveryError("emailjs_not_configured");
  return { service_id: values[0], template_id: values[1], user_id: values[2], accessToken: values[3] };
}
export function quoteNotificationParams(tenant, quote) {
  if (!tenant || tenant.status !== "active" || !Object.hasOwn(brands, tenant.slug) ||
      !quote || !tenant.id || quote.tenant_id !== tenant.id) {
    throw new EmailDeliveryError("notification_tenant_mismatch", 400);
  }
  const replyTo = String(quote.email || "").trim();
  if (!email.test(replyTo)) throw new EmailDeliveryError("invalid_reply_address", 400);
  const singleLine = value => String(value ?? "").replace(/[\r\n]/g, " ").slice(0, 254);
  return {
    // The notification recipient is owned by the application, never the form.
    to_email: NOTIFICATION_RECIPIENT,
    subject: singleLine(tenant.name) + " — Yeni proje talebi",
    brand_name: singleLine(tenant.name),
    source_domain: brands[tenant.slug],
    quote_id: String(quote.id),
    reply_to: replyTo,
    customer_name: singleLine(quote.full_name),
    customer_email: replyTo,
    customer_phone: singleLine(quote.phone),
    company: singleLine(quote.company),
    service_type: singleLine(quote.service_type),
    quantity: singleLine(quote.quantity),
    material: singleLine(quote.material_pref),
    message: String(quote.part_description || "").slice(0, 10000),
    file_name: singleLine(quote.stl_file_name),
    admin_url: "https://" + brands[tenant.slug] + "/admin",
  };
}
// Serializes calls inside one worker and respects EmailJS's 1 request/second limit.
// Run one non-overlapping scheduler for this shared account, not one per brand.
export function createEmailJSDispatcher(config, {
  fetchImpl = fetch,
  sleep = ms => new Promise(resolve => setTimeout(resolve, ms)),
  now = Date.now,
} = {}) {
  let previousStart = -Infinity;
  let chain = Promise.resolve();
  return params => {
    const next = chain.then(async () => {
      const wait = Math.max(0, 1100 - (now() - previousStart));
      if (wait) await sleep(wait);
      previousStart = now();
      let response;
      try {
        response = await fetchImpl("https://api.emailjs.com/api/v1.0/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...config, template_params: params }),
          signal: AbortSignal.timeout(8000),
        });
      } catch {
        // Do not expose credentials, customer data or upstream response bodies.
        throw new EmailDeliveryError("emailjs_network_error", 502);
      }
      if (!response.ok) throw new EmailDeliveryError("emailjs_rejected", response.status);
      return { accepted: true };
    });
    chain = next.catch(() => {});
    return next;
  };
}

