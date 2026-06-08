import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | undefined;

function getClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _client;
}

// Proxy를 통해 클라이언트 생성을 런타임까지 지연 (Next.js 빌드 시 env 없어도 에러 방지)
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop: string | symbol) {
    const client = getClient();
    const value = client[prop as keyof SupabaseClient];
    if (typeof value === 'function') {
      return (value as Function).bind(client);
    }
    return value;
  },
});
