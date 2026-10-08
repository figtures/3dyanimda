/** Local QA only: production builds and connected database sessions cannot opt in. */
export function localDraftPreviewAllowed({
  development,
  demoMode,
  hostname,
  search,
}: {
  development: boolean;
  demoMode: boolean;
  hostname: string;
  search: string;
}): boolean {
  return (
    development &&
    demoMode &&
    ["localhost", "127.0.0.1", "[::1]", "::1"].includes(hostname) &&
    new URLSearchParams(search).get("previewDrafts") === "1"
  );
}
