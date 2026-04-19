import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { rateLimit } from '@/lib/api/rate-limit';

export async function middleware(request: NextRequest) {
    // Rate-limit all mutating API calls at the edge
    const { method, nextUrl } = request;
    const isWriteApiCall =
        ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method) &&
        nextUrl.pathname.startsWith('/api/');

    if (isWriteApiCall) {
        const limited = await rateLimit(request, 60, 60_000);
        if (limited) return limited;
    }

    return await updateSession(request);
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - static assets
         */
        '/((?!_next/static|_next/image|_next/webpack-hmr|favicon|manifest|sw|static|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$).*)',
    ],
};
