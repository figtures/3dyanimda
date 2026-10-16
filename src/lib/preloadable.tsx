import {recoverStaleAdminAsset} from "./asset-recovery";
import {lazy,useState,type ComponentType} from 'react';
/** A preloaded route renders synchronously during SSG and the first hydration. */
export function preloadable<T extends ComponentType<any>>(load:()=>Promise<{default:T}>) {
 let loaded:T|undefined;let pending:Promise<{default:T}>|undefined;
 const preload=()=>pending||=(load().then(module=>{loaded=module.default;return module;}).catch(error=>{pending=undefined;recoverStaleAdminAsset(error);throw error;}));
 const Deferred=lazy(preload);
 return Object.assign((props:React.ComponentProps<T>)=>{const [Component]=useState(()=>loaded||Deferred);return <Component {...props}/>;},{preload});
}
