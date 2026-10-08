const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class EmailAuthorizationError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "EmailAuthorizationError";
    this.status = status;
  }
}

/** The caller ID must come from verified Auth, never from the request body. */
export async function resolveEmailDelivery(body, callerId, { findQuote, hasPermission }) {
  if (!callerId) throw new EmailAuthorizationError("Unauthorized", 401);
  if (!body || typeof body !== "object" || Array.isArray(body))
    throw new EmailAuthorizationError("Invalid request", 400);

  if (body.quoteId !== undefined) {
    if (typeof body.quoteId !== "string" || !uuid.test(body.quoteId))
      throw new EmailAuthorizationError("Invalid quote", 400);
    const quote = await findQuote(body.quoteId);
    // Missing and inaccessible quotes deliberately have the same response.
    if (!quote || !(await hasPermission(quote.tenant_id, "quotes.edit", callerId)))
      throw new EmailAuthorizationError("Quote unavailable", 403);
    if (body.tenantId !== undefined && body.tenantId !== quote.tenant_id)
      throw new EmailAuthorizationError("Quote unavailable", 403);
    const recipient = String(quote.email || "").trim().toLowerCase();
    if (!email.test(recipient))
      throw new EmailAuthorizationError("Quote recipient unavailable", 400);
    return {
      tenantId: quote.tenant_id,
      recipients: [recipient],
      variables: { ...body.variables, name: quote.full_name || "", email: recipient },
    };
  }

  if (typeof body.tenantId !== "string" || !uuid.test(body.tenantId))
    throw new EmailAuthorizationError("Tenant required", 400);
  if (!(await hasPermission(body.tenantId, "email_templates.edit", callerId)))
    throw new EmailAuthorizationError("Forbidden", 403);
  const recipients = (Array.isArray(body.to) ? body.to : [body.to])
    .map((recipient) => String(recipient || "").trim().toLowerCase())
    .filter((recipient) => email.test(recipient));
  if (!recipients.length)
    throw new EmailAuthorizationError("Geçerli alıcı yok.", 400);
  return { tenantId: body.tenantId, recipients, variables: body.variables || {} };
}
