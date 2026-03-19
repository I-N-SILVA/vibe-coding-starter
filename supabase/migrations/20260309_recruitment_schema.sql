-- Add recruitment fields to teams table
ALTER TABLE public.teams
ADD COLUMN is_recruiting_players BOOLEAN DEFAULT false,
ADD COLUMN needed_positions TEXT[] DEFAULT '{}',
ADD COLUMN recruitment_message TEXT;

-- Add recruitment fields to competitions table
ALTER TABLE public.competitions
ADD COLUMN is_recruiting_referees BOOLEAN DEFAULT false,
ADD COLUMN recruitment_message TEXT;

-- Create applications table
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    applicant_role TEXT NOT NULL CHECK (applicant_role IN ('player', 'referee')),
    target_id UUID NOT NULL, -- references teams.id or competitions.id
    target_type TEXT NOT NULL CHECK (target_type IN ('team', 'competition')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure an applicant can't spam applications to the same target
    UNIQUE(applicant_id, target_id)
);

-- RLS Policies for applications
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Applicants can view their own applications
CREATE POLICY "Applicants can view their own applications" 
ON public.applications FOR SELECT 
USING (auth.uid() = applicant_id);

-- Applicants can create applications
CREATE POLICY "Applicants can create applications" 
ON public.applications FOR INSERT 
WITH CHECK (auth.uid() = applicant_id);

-- Managers can view applications for their teams
CREATE POLICY "Managers can view team applications"
ON public.applications FOR SELECT
USING (
    target_type = 'team' AND target_id IN (
        SELECT id FROM public.teams WHERE manager_id = auth.uid() OR organization_id IN (
            SELECT id FROM public.organizations WHERE owner_id = auth.uid()
        )
    )
);

-- Managers can update applications for their teams
CREATE POLICY "Managers can update team applications"
ON public.applications FOR UPDATE
USING (
    target_type = 'team' AND target_id IN (
        SELECT id FROM public.teams WHERE manager_id = auth.uid() OR organization_id IN (
            SELECT id FROM public.organizations WHERE owner_id = auth.uid()
        )
    )
);

-- Organizers can view applications for their competitions
CREATE POLICY "Organizers can view competition applications"
ON public.applications FOR SELECT
USING (
    target_type = 'competition' AND target_id IN (
        SELECT id FROM public.competitions WHERE organization_id IN (
            SELECT id FROM public.organizations WHERE owner_id = auth.uid()
        )
    )
);

-- Organizers can update applications for their competitions
CREATE POLICY "Organizers can update competition applications"
ON public.applications FOR UPDATE
USING (
    target_type = 'competition' AND target_id IN (
        SELECT id FROM public.competitions WHERE organization_id IN (
            SELECT id FROM public.organizations WHERE owner_id = auth.uid()
        )
    )
);
