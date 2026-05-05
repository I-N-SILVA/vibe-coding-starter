import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { log } from '@/lib/logger';

const PROFILE_COOKIE = 'plyaz_pc';
const PROFILE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface ProfileCache {
    role: string;
    organization_id: string | null;
    uid: string;
    exp: number;
}

function readProfileCache(request: NextRequest, userId: string): ProfileCache | null {
    const raw = request.cookies.get(PROFILE_COOKIE)?.value;
    if (!raw) return null;
    try {
        const cache = JSON.parse(raw) as ProfileCache;
        if (cache.uid !== userId) return null;
        if (Date.now() > cache.exp) return null;
        return cache;
    } catch {
        return null;
    }
}

function setProfileCache(response: NextResponse, profile: ProfileCache) {
    response.cookies.set(PROFILE_COOKIE, JSON.stringify(profile), {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: PROFILE_TTL_MS / 1000,
        path: '/',
    });
}

export async function updateSession(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        return NextResponse.next({ request });
    }

    const supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) =>
                    supabaseResponse.cookies.set(name, value, options),
                );
            },
        },
    });

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
        pathname.startsWith('/api/') ||
        pathname === '/update-password' ||
        pathname === '/manifest.json' ||
        pathname === '/manifest.webmanifest' ||
        pathname === '/search.json';

    if (!user && !isPublicRoute) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    // Profile check only needed for routes that gate on role/org
    const needsProfileCheck =
        user &&
        (pathname === '/' ||
            pathname.startsWith('/login') ||
            (pathname.startsWith('/league') &&
                !pathname.startsWith('/league/public') &&
                !pathname.startsWith('/league/create')));

    if (needsProfileCheck) {
        try {
            // Serve from cookie cache when available — avoids a DB round-trip per navigation
            let profile = readProfileCache(request, user!.id);

            if (!profile) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('role, organization_id')
                    .eq('id', user!.id)
                    .single();

                if (!error && data) {
                    profile = {
                        role: data.role,
                        organization_id: data.organization_id ?? null,
                        uid: user!.id,
                        exp: Date.now() + PROFILE_TTL_MS,
                    };
                    setProfileCache(supabaseResponse, profile);
                } else if (pathname === '/' || pathname.startsWith('/login')) {
                    const url = request.nextUrl.clone();
                    url.pathname = '/onboarding';
                    return NextResponse.redirect(url);
                }
            }

            // Redirect from login/root to role-based dashboard
            if (pathname === '/' || pathname.startsWith('/login')) {
                const url = request.nextUrl.clone();
                if (!profile) {
                    url.pathname = '/onboarding';
                    return NextResponse.redirect(url);
                }

                switch (profile.role) {
                    case 'manager':
                    case 'coach':
                        url.pathname = '/league/coach/dashboard';
                        break;
                    case 'player':
                        url.pathname = '/league/player/dashboard';
                        break;
                    case 'referee':
                        url.pathname = '/league/referee';
                        break;
                    default:
                        url.pathname = '/league';
                }
                return NextResponse.redirect(url);
            }

            // Redirect to onboarding if no org
            if (profile && !profile.organization_id) {
                const url = request.nextUrl.clone();
                url.pathname = '/onboarding';
                return NextResponse.redirect(url);
            }
        } catch (e) {
            log.warn('Middleware profile check failed', { error: String(e) });
        }
    }

    return supabaseResponse;
}
