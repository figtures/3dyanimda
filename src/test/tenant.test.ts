import { describe, it, expect, vi, afterEach } from "vitest";
import {
  normalizeHost,
  requestHost,
  tenantFetch,
  setTenantId,
  previewRequestHost,
} from "@/lib/tenant";
describe("tenant routing", () => {
  it('limits private preview selection to the enrolled host and four public brands',()=>{
    expect(previewRequestHost('preview.example','?tenant=3dsanayi','preview.example')).toBe('3dsanayi.com');
    expect(previewRequestHost('3dyanimda.com','?tenant=3dsanayi','preview.example')).toBeUndefined();
    expect(previewRequestHost('preview.example','?tenant=other','preview.example')).toBe('invalid.preview');
  });
  it("normalizes ports, case and trailing DNS dot", () =>
    expect(normalizeHost("BRAND.EXAMPLE.:8080")).toBe("brand.example"));
  it("does not allow production query strings to select another brand", () =>
    expect(requestHost("3dsanayi.example", "?tenant=3dyanimda", false)).toBe(
      "3dsanayi.example",
    ));
  it("only permits preview selection on local development hosts", () => {
    expect(requestHost("localhost", "?tenant=maketyanimda", true)).toBe(
      "maketyanimda.localhost",
    );
    expect(
      requestHost("production.example", "?tenant=maketyanimda", true),
    ).toBe("production.example");
  });
  it("rejects malformed preview selectors", () =>
    expect(requestHost("localhost", "?tenant=x,slug.eq.other", true)).toBe(
      "invalid.localhost",
    ));
  it("sends authoritative current client context, not a stale supplied tenant header", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("[]"));
    vi.stubGlobal("fetch", fetchMock);
    setTenantId("new-tenant");
    await tenantFetch("https://project.supabase.co/rest/v1/pages", {
      headers: { "x-tenant-id": "stale", Authorization: "Bearer example" },
    });
    const headers = fetchMock.mock.calls[0][1].headers as Headers;
    expect(headers.get("x-tenant-id")).toBe("new-tenant");
    expect(headers.get("Authorization")).toBe("Bearer example");
  });
  afterEach(() => {
    setTenantId(null);
    vi.unstubAllGlobals();
  });
});
