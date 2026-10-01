import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { tenantFetch } from "./tenant";
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const backendConfigured = Boolean(url && key);
export const demoMode = !backendConfigured && import.meta.env.DEV;
const offlineFetch: typeof fetch = async () =>
  new Response(
    JSON.stringify({ message: "Yeni Supabase projesi bağlı değil." }),
    {
      status: 503,
      headers: { "Content-Type": "application/json" },
    },
  );
export const supabase = createClient<Database>(
  url || "http://127.0.0.1:54321",
  key || "local-preview",
  {
    global: { fetch: backendConfigured ? tenantFetch : offlineFetch },
    auth: {
      storage: localStorage,
      persistSession: backendConfigured,
      autoRefreshToken: backendConfigured,
    },
  },
);
