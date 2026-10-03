export const themeNames = ["industrial", "editorial", "studio"] as const;
export type SiteTheme = (typeof themeNames)[number];
export function isSiteTheme(value: unknown): value is SiteTheme {
  return themeNames.includes(value as SiteTheme);
}
export function resolveTheme(
  global: string | undefined,
  override?: string,
  preview?: string,
): SiteTheme {
  if (isSiteTheme(preview)) return preview;
  if (isSiteTheme(override)) return override;
  return isSiteTheme(global) ? global : "studio";
}
const overrides: Record<string, string | undefined> = {
  "3dyanimda": import.meta.env.VITE_THEME_3DYANIMDA,
  "3dsanayi": import.meta.env.VITE_THEME_3DSANAYI,
  maketyanimda: import.meta.env.VITE_THEME_MAKETYANIMDA,
  parcayanimda: import.meta.env.VITE_THEME_PARCAYANIMDA,
};
export function getSiteTheme(brand: string, search = ""): SiteTheme {
  return resolveTheme(
    import.meta.env.VITE_SITE_THEME,
    overrides[brand],
    import.meta.env.DEV
      ? new URLSearchParams(search).get("theme") || undefined
      : undefined,
  );
}
