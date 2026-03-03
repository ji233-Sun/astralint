import { createClient } from "@supabase/supabase-js";

/**
 * 服务端 Supabase 客户端，使用 service role key 绕过 RLS。
 * 仅在 Route Handler / Server Action 中使用。
 */
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
