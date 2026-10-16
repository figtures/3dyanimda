3D model preview components

occt-import-js 0.0.23 (unmodified WebAssembly engine; CSP-adapted JavaScript bindings)
Copyright Viktor Kovacs and Open CASCADE contributors.
License: LGPL 2.1; Open CASCADE LGPL 2.1 with its additional exception.
License texts: /licenses/occt-import-js.txt and /licenses/opencascade.txt
Corresponding source and build instructions: https://github.com/kovacsv/occt-import-js
Exact distributed release: https://registry.npmjs.org/occt-import-js/-/occt-import-js-0.0.23.tgz
The library is loaded as a separate JavaScript module and WebAssembly asset.
It can be replaced/rebuilt in the application's source using package.json and Vite.

Modification dated 2026-10-16: replace the two dynamic JavaScript binding
generators with static closures adapted from Emscripten 3.1.69's
DYNAMIC_EXECUTION=0 branches. No runtime eval or Function constructor is enabled.
Exact adapter source: /licenses/occt-csp-adapter.txt
To reproduce: pass the pinned package's dist/occt-import-js.js text to
cspSafeOcct(source) from that adapter, then bundle the returned CommonJS module.
The WASM file is unchanged. The adapter verifies the normalized source hash.
Emscripten source: https://github.com/emscripten-core/emscripten/tree/3.1.69/src/embind
Emscripten license: /licenses/emscripten.txt (MIT option)

Three.js (MIT): https://github.com/mrdoob/three.js
fflate 0.8.3 (MIT): https://github.com/101arrowz/fflate
@xmldom/xmldom 0.9.12 (MIT): https://github.com/xmldom/xmldom
