'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// The database only answers signed-in requests, so nothing renders until Mint is logged in.
export default function AuthGate({ title, children }: { title: string; children: ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  if (session === undefined) return null;
  if (!session) return <LoginForm title={title} />;
  return <>{children}</>;
}

function translate(message: string) {
  if (message.includes('Invalid login credentials')) return '이메일 또는 비밀번호가 맞지 않아요.';
  if (message.includes('already registered')) return '이미 가입된 이메일이에요. 로그인해 주세요.';
  if (message.includes('Database error') || message.includes('초대된 사용자')) return '민트님 계정만 들어올 수 있어요.';
  if (message.toLowerCase().includes('password')) return '비밀번호는 6자 이상으로 정해주세요.';
  return message;
}

function LoginForm({ title }: { title: string }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');
    setPending(true);
    setError('');
    if (mode === 'signup') {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setError(translate(signUpError.message));
        setPending(false);
        return;
      }
    }
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) setError(translate(signInError.message));
    setPending(false);
  }

  const isLogin = mode === 'login';
  return (
    <div style={styles.page}>
      <form onSubmit={submit} style={styles.card}>
        <h1 style={styles.title}>{title}</h1>
        <p style={styles.sub}>{isLogin ? '로그인해 주세요' : '처음 한 번만 가입하면 돼요'}</p>
        <input name="email" type="email" required placeholder="이메일" autoComplete="email" style={styles.input} />
        <input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="비밀번호"
          autoComplete={isLogin ? 'current-password' : 'new-password'}
          style={styles.input}
        />
        {error && <p style={styles.error}>{error}</p>}
        <button type="submit" disabled={pending} style={styles.button}>
          {pending ? '잠시만요…' : isLogin ? '들어가기' : '가입하기'}
        </button>
        <button type="button" onClick={() => setMode(isLogin ? 'signup' : 'login')} style={styles.link}>
          {isLogin ? '처음이에요 (가입하기)' : '이미 가입했어요 (로그인)'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: '#f6f7f6', fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' },
  card: { width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 10, padding: 28, background: '#fff', border: '1px solid #e1e5e2', borderRadius: 16 },
  title: { margin: 0, fontSize: 22, fontWeight: 700, color: '#1c2420', textAlign: 'center' },
  sub: { margin: '0 0 8px', fontSize: 14, color: '#66706b', textAlign: 'center' },
  input: { padding: '10px 12px', fontSize: 15, border: '1px solid #e1e5e2', borderRadius: 8, outline: 'none' },
  error: { margin: 0, fontSize: 13, color: '#d1453b' },
  button: { padding: '10px 12px', fontSize: 15, fontWeight: 600, color: '#fff', background: '#1f9d8b', border: 'none', borderRadius: 8, cursor: 'pointer' },
  link: { padding: 4, fontSize: 13, color: '#127466', background: 'none', border: 'none', cursor: 'pointer' },
} as const;
