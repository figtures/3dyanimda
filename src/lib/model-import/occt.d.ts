declare module 'occt-import-js' {
  const initialize: (options: {wasmBinary: ArrayBuffer; locateFile?: (path:string)=>string; print?: (text:string)=>void; printErr?: (text:string)=>void}) => Promise<{
    ReadStepFile: (data:Uint8Array, params:Record<string,unknown>)=>import('./cad').CadResult;
    ReadIgesFile: (data:Uint8Array, params:Record<string,unknown>)=>import('./cad').CadResult;
  }>;
  export default initialize;
}
