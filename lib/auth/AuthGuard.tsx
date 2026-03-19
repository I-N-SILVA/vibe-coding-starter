import { ReactNode } from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function AuthGuard({ children, roles }: { children: ReactNode, roles: string[] }) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();

    // In mock mode (no Supabase env), allow all through
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return <>{children}</>;
    }

    if (!data?.user) {
        redirect('/login');
    }

    // Check user role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

    if (!profile || !roles.includes(profile.role)) {
        redirect('/login');
    }

    return <>{children}</>;
}
