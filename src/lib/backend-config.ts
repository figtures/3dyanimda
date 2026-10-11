export const backendUrl=import.meta.env.VITE_SUPABASE_URL;
export const backendKey=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const backendConfigured=Boolean(backendUrl&&backendKey);
export const demoMode=!backendConfigured&&import.meta.env.DEV;
/** Loading the API SDK is a data operation, not a prerequisite for reading exported HTML. */
export const getSupabase=()=>import('./supabase').then(module=>module.supabase);
