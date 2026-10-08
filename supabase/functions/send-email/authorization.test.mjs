import { test } from "node:test";
import assert from "node:assert/strict";
import { EmailAuthorizationError, resolveEmailDelivery } from "./authorization.mjs";

const tenant = "10000000-0000-4000-8000-000000000001";
const otherTenant = "10000000-0000-4000-8000-000000000002";
const quoteId = "20000000-0000-4000-8000-000000000001";
const caller = "30000000-0000-4000-8000-000000000001";
const quote = { tenant_id: tenant, email: "Customer@Example.test", full_name: "Stored customer" };

function deps(permissions = ["quotes.edit"], storedQuote = quote) {
  const checks = [];
  const lookups = [];
  return {
    checks,
    lookups,
    findQuote: async (id) => { lookups.push(id); return storedQuote; },
    hasPermission: async (tenantId, permission, userId) => {
      checks.push({ tenantId, permission, userId });
      return tenantId === tenant && userId === caller && permissions.includes(permission);
    },
  };
}

const status = (code) => (error) => error instanceof EmailAuthorizationError && error.status === code;

test("quote editor replies only to stored recipient with authoritative tenant and variables", async () => {
  const dependencies = deps();
  const result = await resolveEmailDelivery({
    quoteId,
    to: ["attacker@example.test", "another@example.test"],
    variables: { name: "Forged name", email: "attacker@example.test", reference: "R1" },
  }, caller, dependencies);
  assert.deepEqual(result, {
    tenantId: tenant,
    recipients: ["customer@example.test"],
    variables: { name: "Stored customer", email: "customer@example.test", reference: "R1" },
  });
  assert.deepEqual(dependencies.lookups, [quoteId]);
  assert.deepEqual(dependencies.checks, [{ tenantId: tenant, permission: "quotes.edit", userId: caller }]);
});

test("quote editor cannot use generic sending to choose another recipient", async () => {
  await assert.rejects(resolveEmailDelivery({ tenantId: tenant, to: "arbitrary@example.test" }, caller, deps()), status(403));
});

test("template permission alone does not grant quote reply rights", async () => {
  await assert.rejects(resolveEmailDelivery({ quoteId }, caller, deps(["email_templates.edit"])), status(403));
});

test("foreign quote authorization uses stored tenant even when request claims an allowed tenant", async () => {
  const dependencies = deps(["quotes.edit"], { ...quote, tenant_id: otherTenant });
  await assert.rejects(resolveEmailDelivery({ quoteId, tenantId: tenant }, caller, dependencies), status(403));
  assert.deepEqual(dependencies.checks, [{ tenantId: otherTenant, permission: "quotes.edit", userId: caller }]);
});

test("mismatched tenant is rejected even for an otherwise accessible quote", async () => {
  await assert.rejects(resolveEmailDelivery({ quoteId, tenantId: otherTenant }, caller, deps()), status(403));
});

test("malformed quote IDs cannot fall through into generic sending", async () => {
  const dependencies = deps(["email_templates.edit"]);
  for (const id of [null, "", "not-a-uuid", 42]) {
    await assert.rejects(resolveEmailDelivery({ quoteId: id, tenantId: tenant, to: "allowed@example.test" }, caller, dependencies), status(400));
  }
  assert.deepEqual(dependencies.lookups, []);
  assert.deepEqual(dependencies.checks, []);
});

test("missing quotes fail with the same status as unauthorized quotes", async () => {
  const dependencies = deps(["quotes.edit"], null);
  await assert.rejects(resolveEmailDelivery({ quoteId }, caller, dependencies), status(403));
  assert.deepEqual(dependencies.checks, []);
});

test("invalid stored recipient cannot be replaced with a client-supplied address", async () => {
  await assert.rejects(resolveEmailDelivery({ quoteId, to: "override@example.test" }, caller, deps(["quotes.edit"], { ...quote, email: "" })), status(400));
});

test("authorized generic/template sending retains its existing recipient behavior", async () => {
  const result = await resolveEmailDelivery({
    tenantId: tenant, to: [" First@Example.test ", "invalid", "second@example.test"], variables: { name: "Test" },
  }, caller, deps(["email_templates.edit"]));
  assert.deepEqual(result, { tenantId: tenant, recipients: ["first@example.test", "second@example.test"], variables: { name: "Test" } });
});

test("unverified caller is rejected before database lookups", async () => {
  const dependencies = deps();
  await assert.rejects(resolveEmailDelivery({ quoteId }, "", dependencies), status(401));
  assert.deepEqual(dependencies.lookups, []);
});
