import { test } from "node:test";
import assert from "node:assert/strict";
import { readEmailJSConfig, quoteNotificationParams, createEmailJSDispatcher } from "./emailjs.mjs";
const tenant = { id: "tenant-1", slug: "3dyanimda", name: "3D Yanımda", status: "active" };
const quote = { id: "quote-1", tenant_id: "tenant-1", email: "customer@example.test", full_name: "Customer", part_description: "<script>unsafe</script>", stl_file_path: "private/file.stl" };
const config = readEmailJSConfig(name => "test-" + name);
test("all four brands route to the owner's inbox; form values cannot override routing", () => {
  for (const slug of ["3dyanimda", "3dsanayi", "maketyanimda", "parcayanimda"]) {
    const params = quoteNotificationParams({ ...tenant, slug }, { ...quote, to_email: "attacker@example.test", source_domain: "attacker.test" });
    assert.equal(params.to_email, "info@3dyanimda.com");
    assert.equal(params.source_domain, slug + ".com");
    assert.equal(params.reply_to, quote.email);
    assert.equal(params.quote_id, quote.id);
    assert.equal(params.stl_file_path, undefined);
    assert.equal(params.message, quote.part_description); // EmailJS {{message}} escapes it.
  }
});
test("inactive, unknown and cross-tenant records cannot be sent", () => {
  for (const t of [{ ...tenant, status: "suspended" }, { ...tenant, slug: "__proto__" }, { ...tenant, id: "tenant-2" }])
    assert.throws(() => quoteNotificationParams(t, quote), /notification_tenant_mismatch/);
});
test("header injection and multiple reply recipients are rejected", () => {
  for (const email of ["x@example.test\r\nBcc:evil@example.test", "a@example.test,b@example.test", "", "bad"])
    assert.throws(() => quoteNotificationParams(tenant, { ...quote, email }), /invalid_reply_address/);
});
test("every server credential must exist before delivery", () => {
  for (const missing of ["EMAILJS_SERVICE_ID", "EMAILJS_QUOTE_TEMPLATE_ID", "EMAILJS_PUBLIC_KEY", "EMAILJS_PRIVATE_KEY"])
    assert.throws(() => readEmailJSConfig(name => name === missing ? "" : "configured"), /emailjs_not_configured/);
});
test("REST sends server credentials with fixed notification params and accepts text OK", async () => {
  const send = createEmailJSDispatcher(config, { fetchImpl: async (url, init) => {
    assert.equal(url, "https://api.emailjs.com/api/v1.0/email/send");
    assert.equal(init.method, "POST");
    const body = JSON.parse(init.body);
    assert.equal(body.accessToken, config.accessToken);
    assert.equal(body.template_id, config.template_id);
    assert.equal(body.template_params.to_email, "info@3dyanimda.com");
    return new Response("OK");
  }});
  assert.deepEqual(await send(quoteNotificationParams(tenant, quote)), { accepted: true });
});
test("parallel calls serialize with at least 1100ms between requests", async () => {
  let clock = 0; const starts = [];
  const send = createEmailJSDispatcher(config, {
    now: () => clock, sleep: async ms => { clock += ms; },
    fetchImpl: async () => { starts.push(clock); return new Response("OK"); },
  });
  await Promise.all([send({}), send({}), send({})]);
  assert.deepEqual(starts, [0, 1100, 2200]);
});
test("provider errors remain failures and do not leak response bodies or credentials", async () => {
  const send = createEmailJSDispatcher(config, { fetchImpl: async () => new Response("sensitive upstream text", { status: 429 }) });
  await assert.rejects(send({}), error => error.status === 429 && error.message === "emailjs_rejected");
});
test("network errors do not expose secrets; a later call can retry", async () => {
  let calls = 0;
  const send = createEmailJSDispatcher(config, { sleep: async () => {}, fetchImpl: async () => {
    if (!calls++) throw new Error(config.accessToken);
    return new Response("OK");
  }});
  await assert.rejects(send({}), /emailjs_network_error/);
  assert.deepEqual(await send({}), { accepted: true });
});
