import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Create a new application
export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { targetId, targetType, role, message } = body;

        if (!targetId || !targetType || !role) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (!['team', 'competition'].includes(targetType)) {
            return NextResponse.json({ error: 'Invalid target type' }, { status: 400 });
        }

        if (!['player', 'referee'].includes(role)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        // Check if an application already exists
        const { data: existingApp, error: existingError } = await supabase
            .from('applications')
            .select('id')
            .eq('applicant_id', user.id)
            .eq('target_id', targetId)
            .single();

        if (existingApp) {
            return NextResponse.json({ error: 'You have already applied' }, { status: 400 });
        }

        if (existingError && existingError.code !== 'PGRST116') { // PGRST116 is "No rows found"
            console.error('Error checking existing application:', existingError);
            return NextResponse.json({ error: 'Failed to verify application status' }, { status: 500 });
        }

        // Create the application
        const { data: application, error } = await supabase
            .from('applications')
            .insert({
                applicant_id: user.id,
                applicant_role: role,
                target_id: targetId,
                target_type: targetType,
                message: message || null,
                status: 'pending'
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating application:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: application }, { status: 201 });
    } catch (err) {
        console.error('Error in POST /api/applications:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Get applications for the current user
export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type'); // 'sent' or 'received'

        if (type === 'sent') {
            // Get applications sent by the current user
            const { data: applications, error } = await supabase
                .from('applications')
                .select(`
                    *,
                    team:target_id(id, name, logo_url),
                    competition:target_id(id, name)
                `)
                .eq('applicant_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching sent applications:', error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            return NextResponse.json({ data: applications });
        } else if (type === 'received') {
            // Getting received applications requires querying based on ownership.
            // Our RLS policies allow SELECT for managers of teams and organizers of competitions.
            // We can fetch all applications where the user can SELECT them, and where they aren't the applicant.
            // This works natively because RLS filters out rows the user shouldn't see.

            const targetType = searchParams.get('targetType'); // Optional: filter by 'team' or 'competition'

            let query = supabase
                .from('applications')
                .select(`
                    *,
                    applicant:profiles(id, full_name, avatar_url, role)
                `)
                .neq('applicant_id', user.id) // Filter out their own sent applications
                .order('created_at', { ascending: false });

            if (targetType) {
                query = query.eq('target_type', targetType);
            }

            const { data: applications, error } = await query;

            if (error) {
                console.error('Error fetching received applications:', error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            return NextResponse.json({ data: applications });
        } else {
            return NextResponse.json({ error: 'Invalid type parameter. Must be "sent" or "received"' }, { status: 400 });
        }
    } catch (err) {
        console.error('Error in GET /api/applications:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
