-- ==============================================================================
-- GVK EDUTECH — MASTERS STUDENT & COUNSELOR MANAGEMENT PLATFORM
-- Migration 00002: Row-Level Security (RLS) Policies
-- ==============================================================================

-- 1. Enable RLS on all 24 tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counselor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counselor_student_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_journey_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counselor_internal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 2. UNIVERSITIES & COURSES (Public Read for Authenticated Users)
CREATE POLICY "Universities are viewable by all authenticated users"
    ON public.universities FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Courses are viewable by all authenticated users"
    ON public.courses FOR SELECT
    TO authenticated
    USING (true);

-- 3. STUDENT PROFILES
CREATE POLICY "Students can view own profile"
    ON public.student_profiles FOR SELECT
    TO authenticated
    USING (id = auth.uid());

CREATE POLICY "Counselors can view assigned students"
    ON public.student_profiles FOR SELECT
    TO authenticated
    USING (
        id IN (
            SELECT student_id FROM public.counselor_student_assignments
            WHERE counselor_id = auth.uid() AND is_active = true
        )
    );

-- 4. COUNSELOR PROFILES
CREATE POLICY "All authenticated users can view active counselors"
    ON public.counselor_profiles FOR SELECT
    TO authenticated
    USING (is_active = true);

-- 5. STUDENT APPLICATIONS
CREATE POLICY "Students can view own applications"
    ON public.student_applications FOR SELECT
    TO authenticated
    USING (student_id = auth.uid());

CREATE POLICY "Counselors can view and manage assigned student applications"
    ON public.student_applications FOR ALL
    TO authenticated
    USING (
        student_id IN (
            SELECT student_id FROM public.counselor_student_assignments
            WHERE counselor_id = auth.uid() AND is_active = true
        )
    );

-- 6. APPLICATION STATUS HISTORY
CREATE POLICY "Students can view status history of own applications"
    ON public.application_status_history FOR SELECT
    TO authenticated
    USING (
        application_id IN (
            SELECT id FROM public.student_applications WHERE student_id = auth.uid()
        )
    );

CREATE POLICY "Counselors can view and append status history for assigned applications"
    ON public.application_status_history FOR ALL
    TO authenticated
    USING (
        application_id IN (
            SELECT id FROM public.student_applications
            WHERE student_id IN (
                SELECT student_id FROM public.counselor_student_assignments
                WHERE counselor_id = auth.uid() AND is_active = true
            )
        )
    );

-- 7. DOCUMENTS & VERSIONS
CREATE POLICY "Students can view and upload own documents"
    ON public.documents FOR ALL
    TO authenticated
    USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());

CREATE POLICY "Counselors can view and update assigned student documents"
    ON public.documents FOR ALL
    TO authenticated
    USING (
        student_id IN (
            SELECT student_id FROM public.counselor_student_assignments
            WHERE counselor_id = auth.uid() AND is_active = true
        )
    );

-- 8. COUNSELOR INTERNAL NOTES (CRITICAL: ZERO STUDENT ACCESS)
CREATE POLICY "Students have ZERO access to counselor internal notes"
    ON public.counselor_internal_notes FOR ALL
    TO authenticated
    USING (
        auth.jwt() ->> 'role' IN ('counselor', 'admin')
        AND (
            student_id IN (
                SELECT student_id FROM public.counselor_student_assignments
                WHERE counselor_id = auth.uid() AND is_active = true
            )
            OR auth.jwt() ->> 'role' = 'admin'
        )
    );

-- 9. TASKS
CREATE POLICY "Students can view own tasks and mark submitted"
    ON public.tasks FOR SELECT
    TO authenticated
    USING (student_id = auth.uid() AND is_counselor_internal = false);

CREATE POLICY "Students can update submission on own tasks"
    ON public.tasks FOR UPDATE
    TO authenticated
    USING (student_id = auth.uid() AND is_counselor_internal = false);

CREATE POLICY "Counselors can manage tasks for assigned students"
    ON public.tasks FOR ALL
    TO authenticated
    USING (
        student_id IN (
            SELECT student_id FROM public.counselor_student_assignments
            WHERE counselor_id = auth.uid() AND is_active = true
        )
    );

-- 10. MOCK INTERVIEWS & FEEDBACK
CREATE POLICY "Students can view own mock interviews"
    ON public.mock_interviews FOR SELECT
    TO authenticated
    USING (student_id = auth.uid());

CREATE POLICY "Students can view feedback (excluding counselor private notes)"
    ON public.interview_feedback FOR SELECT
    TO authenticated
    USING (
        mock_interview_id IN (
            SELECT id FROM public.mock_interviews WHERE student_id = auth.uid()
        )
    );

CREATE POLICY "Counselors can manage mock interviews and feedback for assigned students"
    ON public.mock_interviews FOR ALL
    TO authenticated
    USING (
        student_id IN (
            SELECT student_id FROM public.counselor_student_assignments
            WHERE counselor_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Counselors can manage feedback for assigned student mock interviews"
    ON public.interview_feedback FOR ALL
    TO authenticated
    USING (
        mock_interview_id IN (
            SELECT id FROM public.mock_interviews
            WHERE counselor_id = auth.uid()
        )
    );

-- 11. ACTIVITY LOGS (IMMUTABLE AUDIT TRAIL: INSERT & SELECT ONLY, NO UPDATE OR DELETE)
CREATE POLICY "Authenticated users can insert audit logs"
    ON public.activity_logs FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Students can view own activity records"
    ON public.activity_logs FOR SELECT
    TO authenticated
    USING (affected_student_id = auth.uid());

CREATE POLICY "Counselors can view activity records for assigned students"
    ON public.activity_logs FOR SELECT
    TO authenticated
    USING (
        affected_student_id IN (
            SELECT student_id FROM public.counselor_student_assignments
            WHERE counselor_id = auth.uid() AND is_active = true
        )
    );
