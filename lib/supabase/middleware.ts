import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;
  console.log('[MIDDLEWARE] =====================================');
  console.log('[MIDDLEWARE] Path:', path);
  console.log('[MIDDLEWARE] Request cookies:', request.cookies.getAll().map(c => c.name));

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          console.log('[MIDDLEWARE] setAll() called with:', cookiesToSet.map(c => c.name));
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Use getUser() for server-side validation
  // getUser() validates the token against Supabase Auth server
  // getSession() does not guarantee revalidation and is unsafe for server code
  const { data: { user }, error } = await supabase.auth.getUser();
  console.log('[MIDDLEWARE] getUser result:', {
    user: user?.email || null,
    error: error?.message || null
  });
  console.log('[MIDDLEWARE] Response cookies:', supabaseResponse.cookies.getAll().map(c => c.name));
  console.log('[MIDDLEWARE] =====================================');

  return supabaseResponse;
}
