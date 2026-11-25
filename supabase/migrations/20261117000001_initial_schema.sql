-- ==============================================================================
-- GVK EDUTECH — MASTERS STUDENT & COUNSELOR MANAGEMENT PLATFORM
-- Migration 00001: Initial Relational Database Schema (24 Tables)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'counselor', 'admin')),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('pending_activation', 'active', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. STUDENT PROFILES
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    student_id_code VARCHAR(50) UNIQUE NOT NULL, -- e.g. GVK-STU-2026-0042
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(25) NOT NULL,
    avatar_url TEXT,
    preferred_country VARCHAR(100) NOT NULL DEFAULT 'United Kingdom',
    target_intake VARCHAR(50) NOT NULL DEFAULT 'Fall 2026',
    target_degree VARCHAR(100) NOT NULL DEFAULT 'MSc Computer Science',
    ug_college VARCHAR(255),
    ug_cgpa_percentage NUMERIC(5,2),
    ug_backlogs INTEGER DEFAULT 0,
    english_test_type VARCHAR(50) DEFAULT 'IELTS',
    english_overall_score NUMERIC(4,2),
    gre_score INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. COUNSELOR PROFILES
CREATE TABLE IF NOT EXISTS public.counselor_profiles (
    id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    employee_id_code VARCHAR(50) UNIQUE NOT NULL, -- e.g. GVK-EMP-014
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(25) NOT NULL,
    avatar_url TEXT,
    specialization_countries TEXT[] DEFAULT '{"United Kingdom", "United States", "Ireland", "Australia"}',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. COUNSELOR STUDENT ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.counselor_student_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    counselor_id UUID NOT NULL REFERENCES public.counselor_profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_by UUID REFERENCES public.users(id),
    UNIQUE(counselor_id, student_id)
);

-- 5. UNIVERSITIES
CREATE TABLE IF NOT EXISTS public.universities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    campus VARCHAR(100),
    ranking INTEGER,
    logo_url TEXT,
    website_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. COURSES
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    university_id UUID NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    degree_level VARCHAR(50) NOT NULL DEFAULT 'Masters',
    department VARCHAR(100),
    tuition_fee_currency VARCHAR(10) NOT NULL DEFAULT 'GBP',
    tuition_fee_amount NUMERIC(12,2) NOT NULL DEFAULT 22000,
    duration_months INTEGER NOT NULL DEFAULT 12,
    intake_terms TEXT[] DEFAULT '{"Fall 2026", "Spring 2027"}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. STUDENT APPLICATIONS (ONE STUDENT -> MULTIPLE APPLICATIONS)
CREATE TABLE IF NOT EXISTS public.student_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    university_id UUID NOT NULL REFERENCES public.universities(id) ON DELETE RESTRICT,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE RESTRICT,
    intake VARCHAR(50) NOT NULL DEFAULT 'Fall 2026',
    app_ref_number VARCHAR(100),
    tuition_fee_currency VARCHAR(10) NOT NULL DEFAULT 'GBP',
    tuition_fee_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    application_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
    submission_date DATE,
    deadline DATE,
    current_status VARCHAR(60) NOT NULL DEFAULT 'shortlisted' CHECK (
        current_status IN (
            'shortlisted',
            'documents_pending',
            'ready_for_submission',
            'submitted',
            'under_review',
            'additional_info_required',
            'interview_required',
            'conditional_offer',
            'unconditional_offer',
            'rejected',
            'withdrawn',
            'deposit_pending',
            'deposit_paid',
            'cas_pending',
            'cas_received',
            'visa_processing',
            'completed'
        )
    ),
    offer_type VARCHAR(50) DEFAULT 'none' CHECK (offer_type IN ('none', 'conditional', 'unconditional')),
    offer_conditions TEXT,
    deposit_amount NUMERIC(12,2),
    deposit_deadline DATE,
    deposit_status VARCHAR(50) DEFAULT 'pending' CHECK (deposit_status IN ('pending', 'paid', 'waived')),
    cas_number VARCHAR(100),
    cas_issued_at DATE,
    visa_status VARCHAR(100),
    counselor_remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. APPLICATION STATUS HISTORY (AUDIT PER APPLICATION)
CREATE TABLE IF NOT EXISTS public.application_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES public.student_applications(id) ON DELETE CASCADE,
    previous_status VARCHAR(60),
    new_status VARCHAR(60) NOT NULL,
    changed_by_user_id UUID NOT NULL REFERENCES public.users(id),
    source VARCHAR(100) NOT NULL DEFAULT 'counselor_portal',
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. APPLICATION REQUIREMENTS
CREATE TABLE IF NOT EXISTS public.application_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES public.student_applications(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'waived'))
);

-- 10. DOCUMENTS (CENTRALIZED VAULT)
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('personal', 'academic', 'english_proficiency', 'masters_prep', 'financial', 'visa')),
    document_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    verification_status VARCHAR(50) NOT NULL DEFAULT 'not_uploaded' CHECK (
        verification_status IN (
            'required',
            'not_uploaded',
            'uploaded',
            'under_review',
            'verified',
            'rejected',
            'resubmission_required',
            'not_applicable'
        )
    ),
    latest_version INTEGER NOT NULL DEFAULT 1,
    is_reusable BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. DOCUMENT VERSIONS
CREATE TABLE IF NOT EXISTS public.document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL DEFAULT 1,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_by_user_id UUID NOT NULL REFERENCES public.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. DOCUMENT REVIEWS
CREATE TABLE IF NOT EXISTS public.document_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_version_id UUID NOT NULL REFERENCES public.document_versions(id) ON DELETE CASCADE,
    application_id UUID REFERENCES public.student_applications(id) ON DELETE SET NULL,
    reviewed_by_counselor_id UUID NOT NULL REFERENCES public.counselor_profiles(id),
    decision VARCHAR(50) NOT NULL CHECK (decision IN ('verified', 'rejected', 'resubmission_required')),
    counselor_comments TEXT,
    reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. JOURNEY TEMPLATES
CREATE TABLE IF NOT EXISTS public.journey_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    country_code VARCHAR(10) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. JOURNEY STAGES (22 STAGES)
CREATE TABLE IF NOT EXISTS public.journey_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES public.journey_templates(id) ON DELETE CASCADE,
    stage_number INTEGER NOT NULL,
    stage_name VARCHAR(255) NOT NULL,
    description TEXT,
    is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
    responsible_party VARCHAR(50) NOT NULL DEFAULT 'student' CHECK (responsible_party IN ('student', 'counselor', 'university', 'external')),
    applicable_countries TEXT[] DEFAULT '{"United Kingdom"}',
    UNIQUE(template_id, stage_number)
);

-- 15. STUDENT JOURNEY RECORDS
CREATE TABLE IF NOT EXISTS public.student_journey_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    stage_id UUID REFERENCES public.journey_stages(id) ON DELETE SET NULL,
    stage_number INTEGER NOT NULL,
    stage_name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'not_started' CHECK (
        status IN (
            'not_started',
            'in_progress',
            'waiting_student',
            'waiting_counselor',
            'waiting_university',
            'completed',
            'on_hold',
            'not_applicable'
        )
    ),
    is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
    responsible_party VARCHAR(50) NOT NULL DEFAULT 'student' CHECK (responsible_party IN ('student', 'counselor', 'university', 'external')),
    start_date DATE,
    completion_date DATE,
    deadline DATE,
    counselor_remarks TEXT,
    supporting_document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    updated_by_user_id UUID REFERENCES public.users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, stage_number)
);

-- 16. TASKS
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    application_id UUID REFERENCES public.student_applications(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_by_user_id UUID NOT NULL REFERENCES public.users(id),
    due_date DATE NOT NULL,
    priority VARCHAR(50) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'submitted', 'under_review', 'completed', 'overdue', 'cancelled')),
    supporting_document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    student_submission_notes TEXT,
    is_counselor_internal BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 17. MOCK INTERVIEWS
CREATE TABLE IF NOT EXISTS public.mock_interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    counselor_id UUID NOT NULL REFERENCES public.counselor_profiles(id) ON DELETE RESTRICT,
    application_id UUID REFERENCES public.student_applications(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    instructions TEXT,
    zoom_meeting_url TEXT NOT NULL,
    zoom_meeting_id VARCHAR(100),
    zoom_passcode VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled')),
    retake_of_interview_id UUID REFERENCES public.mock_interviews(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. INTERVIEW FEEDBACK (PASS / FAIL ASSESSMENT)
CREATE TABLE IF NOT EXISTS public.interview_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mock_interview_id UUID UNIQUE NOT NULL REFERENCES public.mock_interviews(id) ON DELETE CASCADE,
    evaluated_by_counselor_id UUID NOT NULL REFERENCES public.counselor_profiles(id),
    outcome VARCHAR(20) NOT NULL CHECK (outcome IN ('PASS', 'FAIL')),
    strengths TEXT NOT NULL,
    areas_for_improvement TEXT NOT NULL,
    communication_score INTEGER NOT NULL CHECK (communication_score BETWEEN 1 AND 5),
    academic_clarity_score INTEGER NOT NULL CHECK (academic_clarity_score BETWEEN 1 AND 5),
    visa_intent_score INTEGER NOT NULL CHECK (visa_intent_score BETWEEN 1 AND 5),
    student_visible_feedback TEXT NOT NULL,
    counselor_private_notes TEXT, -- STRICTLY HIDDEN FROM STUDENT
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. LOAN CASES (11 STAGES)
CREATE TABLE IF NOT EXISTS public.loan_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID UNIQUE NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    counselor_id UUID NOT NULL REFERENCES public.counselor_profiles(id) ON DELETE RESTRICT,
    stage VARCHAR(50) NOT NULL DEFAULT 'bank_selected' CHECK (
        stage IN (
            'not_required',
            'bank_selected',
            'info_submitted',
            'bank_login',
            'credit_call',
            'doc_verification',
            'physical_verification',
            'approved',
            'sanction_letter',
            'disbursement_pending',
            'disbursed'
        )
    ),
    lender_name VARCHAR(150),
    amount_requested NUMERIC(12,2),
    sanction_amount NUMERIC(12,2),
    interest_rate NUMERIC(5,2),
    counselor_notes TEXT,
    student_next_step TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 21. COMMUNICATION THREADS
CREATE TABLE IF NOT EXISTS public.communication_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    counselor_id UUID NOT NULL REFERENCES public.counselor_profiles(id) ON DELETE CASCADE,
    application_id UUID REFERENCES public.student_applications(id) ON DELETE SET NULL,
    subject VARCHAR(255) NOT NULL,
    is_closed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 22. MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID NOT NULL REFERENCES public.communication_threads(id) ON DELETE CASCADE,
    sender_user_id UUID NOT NULL REFERENCES public.users(id),
    message_body TEXT NOT NULL,
    attachment_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 23. COUNSELOR INTERNAL NOTES (ZERO STUDENT VISIBILITY)
CREATE TABLE IF NOT EXISTS public.counselor_internal_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    counselor_id UUID NOT NULL REFERENCES public.counselor_profiles(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 24. ACTIVITY LOGS (APPEND-ONLY AUDIT LOG)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    affected_student_id UUID REFERENCES public.student_profiles(id) ON DELETE SET NULL,
    related_application_id UUID REFERENCES public.student_applications(id) ON DELETE SET NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    previous_value JSONB,
    new_value JSONB,
    context JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_users_role_status ON public.users(role, status);
CREATE INDEX IF NOT EXISTS idx_student_profiles_id_code ON public.student_profiles(student_id_code);
CREATE INDEX IF NOT EXISTS idx_counselor_profiles_emp_code ON public.counselor_profiles(employee_id_code);
CREATE INDEX IF NOT EXISTS idx_assignments_counselor ON public.counselor_student_assignments(counselor_id);
CREATE INDEX IF NOT EXISTS idx_assignments_student ON public.counselor_student_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_student ON public.student_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.student_applications(current_status);
CREATE INDEX IF NOT EXISTS idx_documents_student ON public.documents(student_id);
CREATE INDEX IF NOT EXISTS idx_tasks_student ON public.tasks(student_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON public.tasks(due_date, status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_student ON public.activity_logs(affected_student_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.activity_logs(created_at DESC);
