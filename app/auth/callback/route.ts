import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  // PKCE flow uses 'code', magic link uses 'token_hash' + 'type'
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as 'email' | 'magiclink' | null;
  const next = searchParams.get('next') ?? '/';

  console.log('[AUTH CALLBACK] =====================================');
  console.log('[AUTH CALLBACK] Request received');
  console.log('[AUTH CALLBACK] URL:', request.url);
  console.log('[AUTH CALLBACK] code present:', !!code);
  console.log('[AUTH CALLBACK] token_hash present:', !!token_hash);
  console.log('[AUTH CALLBACK] type:', type);
  console.log('[AUTH CALLBACK] redirect target:', next);
  console.log('[AUTH CALLBACK] origin:', origin);
  console.log('[AUTH CALLBACK] Incoming cookies:', request.cookies.getAll().map(c => c.name));

  const redirectUrl = `${origin}${next}`;
  let response = NextResponse.redirect(redirectUrl);

  // Check if we have either PKCE code or token_hash
  if (code || (token_hash && type)) {
    console.log('[AUTH CALLBACK] Supabase URL configured:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('[AUTH CALLBACK] Supabase key configured:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            const cookies = request.cookies.getAll();
            console.log('[AUTH CALLBACK] getAll() called, returning:', cookies.map(c => c.name));
            return cookies;
          },
          setAll(cookiesToSet) {
            console.log('[AUTH CALLBACK] setAll() called with:', cookiesToSet.map(c => ({ name: c.name, hasValue: !!c.value, options: c.options })));
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    let error: Error | null = null;
    let userEmail: string | null = null;
    let hasSession = false;

    if (code) {
      // PKCE flow - exchange code for session
      console.log('[AUTH CALLBACK] Using PKCE flow - exchangeCodeForSession...');
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      error = exchangeError;
      userEmail = data?.user?.email || null;
      hasSession = !!data?.session;

      console.log('[AUTH CALLBACK] exchangeCodeForSession result:');
      console.log('[AUTH CALLBACK]   - error:', error?.message || 'none');
      console.log('[AUTH CALLBACK]   - data.user:', userEmail || 'none');
      console.log('[AUTH CALLBACK]   - data.session:', hasSession ? 'present' : 'none');
    } else if (token_hash && type) {
      // Direct token verification flow
      console.log('[AUTH CALLBACK] Using token_hash flow - verifyOtp...');
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        token_hash,
        type: type === 'email' ? 'email' : 'magiclink',
      });
      error = verifyError;
      userEmail = data?.user?.email || null;
      hasSession = !!data?.session;

      console.log('[AUTH CALLBACK] verifyOtp result:');
      console.log('[AUTH CALLBACK]   - error:', error?.message || 'none');
      console.log('[AUTH CALLBACK]   - data.user:', userEmail || 'none');
      console.log('[AUTH CALLBACK]   - data.session:', hasSession ? 'present' : 'none');
    }

    if (error) {
      console.log('[AUTH CALLBACK] ERROR: Redirecting to error page');
      return NextResponse.redirect(
        `${origin}/?auth_error=${encodeURIComponent(error.message)}`
      );
    }

    const responseCookies = response.cookies.getAll();
    console.log('[AUTH CALLBACK] Response cookies being sent:', responseCookies.map(c => ({ name: c.name, hasValue: !!c.value })));
    console.log('[AUTH CALLBACK] SUCCESS: Redirecting to', redirectUrl);
    console.log('[AUTH CALLBACK] =====================================');
    return response;
  }

  console.log('[AUTH CALLBACK] Missing parameters, redirecting to home');
  return NextResponse.redirect(`${origin}/`);
}
