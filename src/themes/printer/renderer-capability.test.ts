import { describe, expect, it, vi } from 'vitest';
import { usesSoftwareRenderer } from './renderer-capability';

function context(name: string, exposed = true) {
  return {
    getExtension: vi.fn(() => exposed ? { UNMASKED_RENDERER_WEBGL: 37446 } : null),
    getParameter: vi.fn(() => name),
  } as unknown as WebGLRenderingContext;
}

describe('printer renderer selection', () => {
  it.each(['ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device))', 'llvmpipe (LLVM 15.0.7, 256 bits)', 'softpipe', 'Software Rasterizer', 'Microsoft Basic Render Driver'])('uses the animated canvas fallback for %s', name => {
    expect(usesSoftwareRenderer(context(name))).toBe(true);
  });
  it.each(['ANGLE (Intel, Intel(R) UHD Graphics)', 'Apple M2', 'Mesa Intel(R) Graphics', 'Adreno (TM) 740'])('preserves the WebGL scene for %s', name => {
    expect(usesSoftwareRenderer(context(name))).toBe(false);
  });
  it('does not require GPU-identifying information from privacy-restricted browsers', () => {
    const gl = context('', false);
    expect(usesSoftwareRenderer(gl)).toBe(false);
    expect(gl.getParameter).not.toHaveBeenCalled();
  });
});
