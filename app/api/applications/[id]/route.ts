import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const applicationId = params.id;
        const body = await request.json();
        const { status } = body;

        if (!status || !['accepted', 'rejected', 'pending'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        // Fetch application to ensure it exists and get its target details
        const { data: application, error: fetchError } = await supabase
            .from('applications')
            .select('*')
            .eq('id', applicationId)
            .single();

        if (fetchError || !application) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        // We rely on RLS to ensure the user has permission to UPDATE the application.
        // If they don't, the update will simply fail or return no data.

        const { data: updatedApp, error: updateError } = await supabase
            .from('applications')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', applicationId)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating application:', updateError);
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        // If the application is accepted, we need to add the user to the appropriate table
        if (status === 'accepted') {
            if (application.target_type === 'team' && application.applicant_role === 'player') {
                // Add player to team
                const { error: insertError } = await supabase
                    .from('players')
                    .insert({
                        team_id: application.target_id,
                        profile_id: application.applicant_id,
                        // Note: In a real app we'd fetch the player's profile data to populate name, etc.
                        // For this MVP, we might just assume the player creates their profile first
                        status: 'active'
                    });

                if (insertError) {
                    console.error('Error adding player to team:', insertError);
                    // We don't fail the request here, but log it. Ideally we handle this gracefully
                }
            } else if (application.target_type === 'competition' && application.applicant_role === 'referee') {
                // The easiest way for now is to just rely on the 'applications' table or 
                // you could do something else here depending on how referees are linked to competitions
            }
        }

        return NextResponse.json({ data: updatedApp });
    } catch (err) {
        console.error('Error in PATCH /api/applications/[id]:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
