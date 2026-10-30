/** Some browsers accept failIfMajorPerformanceCaveat even for a forced
 * software renderer. Keep this local; GPU identifiers are never recorded. */
export function usesSoftwareRenderer(context: WebGLRenderingContext | WebGL2RenderingContext): boolean {
  const info = context.getExtension('WEBGL_debug_renderer_info');
  if (!info) return false; // Privacy-restricted browsers retain the normal path.
  const name = String(context.getParameter(info.UNMASKED_RENDERER_WEBGL));
  return /swiftshader|llvmpipe|softpipe|software rasterizer|microsoft basic render driver/i.test(name);
}
