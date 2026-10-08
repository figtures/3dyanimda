import { describe, expect, it } from "vitest";
import { localDraftPreviewAllowed } from "./local-preview";

const local = {
  development: true,
  demoMode: true,
  hostname: "127.0.0.1",
  search: "?tenant=3dyanimda&previewDrafts=1",
};

describe("local draft preview boundary", () => {
  it.each(["127.0.0.1", "localhost", "[::1]", "::1"])(
    "allows explicit offline development preview on %s",
    (hostname) => expect(localDraftPreviewAllowed({ ...local, hostname })).toBe(true),
  );
  it("blocks a production build even on loopback", () => {
    expect(localDraftPreviewAllowed({ ...local, development: false })).toBe(false);
  });
  it("never widens a connected Supabase query", () => {
    expect(localDraftPreviewAllowed({ ...local, demoMode: false })).toBe(false);
  });
  it.each(["3dyanimda.com", "preview.workers.dev", "localhost.example.com", "192.168.1.10", ""])(
    "blocks a non-loopback hostname: %s",
    (hostname) => expect(localDraftPreviewAllowed({ ...local, hostname })).toBe(false),
  );
  it.each(["", "?previewDrafts=0", "?previewDrafts=true", "?preview=1"])(
    "requires the explicit preview flag: %s",
    (search) => expect(localDraftPreviewAllowed({ ...local, search })).toBe(false),
  );
});
