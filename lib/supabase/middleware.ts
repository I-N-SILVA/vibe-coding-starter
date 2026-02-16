import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { log } from '@/lib/logger';

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        // Cannot authenticate without Supabase — redirect to a static error or let the error boundary handle it
        return supabaseResponse;
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // getUser(). A simple mistake can make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // Public routes that don't require auth
    const isPublicRoute =
        pathname === '/' ||
        pathname.startsWith('/login') ||
        pathname.startsWith('/auth') ||
        pathname.startsWith('/league/public') ||
        pathname.startsWith('/api/');

    if (!user && !isPublicRoute) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    // If user is authenticated and accessing admin routes, check for organization
    // Skip this check for onboarding page to avoid redirect loop
    if (user && pathname.startsWith('/league') && !pathname.startsWith('/league/public') && !pathname.startsWith('/league/create')) {
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', user.id)
                .single();

            if (!error && !profile?.organization_id) {
                const url = request.nextUrl.clone();
                url.pathname = '/onboarding';
                return NextResponse.redirect(url);
            }
        } catch (e) {
            // If profile check fails, let the page handle it
            log.warn('Middleware profile check failed', { error: String(e) });
        }
    }

    return supabaseResponse;
}
