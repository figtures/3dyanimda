import {createHash} from 'node:crypto';

// occt-import-js 0.0.23 ships Emscripten 3.1.69 glue with two JIT bindings.
// Adapt the upstream DYNAMIC_EXECUTION=0 branches, without changing its WASM.
// https://github.com/emscripten-core/emscripten/tree/3.1.69/src/embind
// Copyright Emscripten contributors; MIT license: public/licenses/emscripten.txt.
const sourceHash='8b090be386bc8ffba32222aa19f38742ae8ed35707819beb7f8ab4938a28c97a';
const invoker=`function craftInvokerFunction(humanName,argTypes,classType,cppInvokerFunc,cppTargetFunc,isAsync){
  if(argTypes.length<2||isAsync)throwBindingError('Unsupported CAD binding signature');
  var isMethod=argTypes[1]!==null&&classType!==null;
  var needsStack=usesDestructorStack(argTypes);
  return createNamedFunction(humanName,function(...args){
    var destructors=[],wired=[],callArgs=[cppTargetFunc],thisWired;
    if(isMethod){thisWired=argTypes[1].toWireType(destructors,this);callArgs.push(thisWired);}
    for(var i=2;i<argTypes.length;i++){wired[i-2]=argTypes[i].toWireType(destructors,args[i-2]);callArgs.push(wired[i-2]);}
    var rv=cppInvokerFunc(...callArgs);
    if(needsStack)runDestructors(destructors);
    else for(var i=isMethod?1:2;i<argTypes.length;i++)if(argTypes[i].destructorFunction!==null)argTypes[i].destructorFunction(i===1?thisWired:wired[i-2]);
    if(argTypes[0].name!=='void')return argTypes[0].fromWireType(rv);
  });
}`;
const methodCaller=`var __emval_get_method_caller=(argCount,argTypes,kind)=>{
  var types=emval_lookupTypes(argCount,argTypes),retType=types.shift();
  var invokerFunction=(obj,func,destructorsRef,args)=>{
    var values=[],offset=0;
    for(var i=0;i<types.length;i++){values.push(types[i].readValueFromPointer(args+offset));offset+=types[i].argPackAdvance;}
    var rv=kind===1?Reflect.construct(func,values):func.apply(obj,values);
    if(!retType.isVoid)return emval_returnValue(retType,destructorsRef,rv);
  };
  return emval_addMethodCaller(createNamedFunction('methodCaller',invokerFunction));
};`;
function replaceSection(code,start,end,replacement){
  const from=code.indexOf(start),to=code.indexOf(end,from);
  if(from<0||to<=from)throw Error('CAD CSP binding boundaries changed; review the pinned dependency.');
  return code.slice(0,from)+replacement+code.slice(to);
}
export function cspSafeOcct(source){
  source=source.replace(/\r\n/g,'\n');
  if(createHash('sha256').update(source).digest('hex')!==sourceHash)throw Error('CAD dependency changed; CSP adapter requires review.');
  let result=replaceSection(source,'function craftInvokerFunction(','var ensureOverloadTable=',invoker);
  result=replaceSection(result,'var __emval_get_method_caller=','var __emval_get_property=',methodCaller);
  // Remove now-unused code generators as well as their two call sites.
  result=replaceSection(result,'function newFunc(','function craftInvokerFunction(', '');
  if(/newFunc\s*\(\s*Function|\beval\s*\(|new\s+Function\b/.test(result))throw Error('CAD glue still contains dynamic JavaScript execution.');
  return result;
}
export function occtCspPlugin(){
  return {name:'occt-csp-bindings',enforce:'pre',transform(code,id){
    if(id.replaceAll('\\','/').endsWith('/occt-import-js/dist/occt-import-js.js'))return {code:cspSafeOcct(code),map:null};
  }};
}
