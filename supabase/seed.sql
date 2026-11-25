-- ==============================================================================
-- GVK EDUTECH — MASTERS STUDENT & COUNSELOR MANAGEMENT PLATFORM
-- Seed Dataset: Production-Ready Development Records
-- ==============================================================================

-- 1. UNIVERSITIES
INSERT INTO public.universities (id, name, country, city, campus, ranking, logo_url, website_url, is_active)
VALUES
    ('11111111-1111-1111-1111-111111111101', 'University of Manchester', 'United Kingdom', 'Manchester', 'Oxford Road', 32, 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=128&q=80', 'https://www.manchester.ac.uk', true),
    ('11111111-1111-1111-1111-111111111102', 'University of Birmingham', 'United Kingdom', 'Birmingham', 'Edgbaston', 84, 'https://images.unsplash.com/photo-1562774053-701939374585?w=128&q=80', 'https://www.birmingham.ac.uk', true),
    ('11111111-1111-1111-1111-111111111103', 'University of Warwick', 'United Kingdom', 'Coventry', 'Gibbet Hill', 67, 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=128&q=80', 'https://warwick.ac.uk', true),
    ('11111111-1111-1111-1111-111111111104', 'University of Leeds', 'United Kingdom', 'Leeds', 'Woodhouse', 75, 'https://images.unsplash.com/photo-1592280771190-4e29c045614d?w=128&q=80', 'https://www.leeds.ac.uk', true),
    ('11111111-1111-1111-1111-111111111105', 'University of Bristol', 'United Kingdom', 'Bristol', 'Clifton', 55, 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=128&q=80', 'https://www.bristol.ac.uk', true)
ON CONFLICT (id) DO NOTHING;

-- 2. COURSES
INSERT INTO public.courses (id, university_id, name, degree_level, department, tuition_fee_currency, tuition_fee_amount, duration_months, intake_terms)
VALUES
    ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', 'MSc Advanced Computer Science', 'Masters', 'School of Computer Science', 'GBP', 33500, 12, '{"Fall 2026"}'),
    ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111102', 'MSc Artificial Intelligence and Machine Learning', 'Masters', 'School of Informatics', 'GBP', 28500, 12, '{"Fall 2026", "Spring 2027"}'),
    ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111103', 'MSc Management with Information Systems', 'Masters', 'Warwick Business School', 'GBP', 36000, 12, '{"Fall 2026"}'),
    ('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111104', 'MSc Data Science and Analytics', 'Masters', 'Computing & Mathematics', 'GBP', 29000, 12, '{"Fall 2026"}'),
    ('22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111105', 'MSc Financial Technology (FinTech)', 'Masters', 'School of Economics', 'GBP', 34000, 12, '{"Fall 2026"}')
ON CONFLICT (id) DO NOTHING;

-- 3. USERS
INSERT INTO public.users (id, email, role, status)
VALUES
    ('33333333-3333-3333-3333-333333333301', 'counselor.priya@gvkedutech.com', 'counselor', 'active'),
    ('33333333-3333-3333-3333-333333333302', 'counselor.vikram@gvkedutech.com', 'counselor', 'active'),
    ('33333333-3333-3333-3333-333333333311', 'rahul.sharma@gmail.com', 'student', 'active'),
    ('33333333-3333-3333-3333-333333333312', 'ananya.reddy@gmail.com', 'student', 'active'),
    ('33333333-3333-3333-3333-333333333399', 'admin@gvkedutech.com', 'admin', 'active')
ON CONFLICT (id) DO NOTHING;

-- 4. COUNSELOR PROFILES
INSERT INTO public.counselor_profiles (id, employee_id_code, first_name, last_name, phone, specialization_countries, is_active)
VALUES
    ('33333333-3333-3333-3333-333333333301', 'GVK-EMP-014', 'Priya', 'Varma', '+91 98490 12345', '{"United Kingdom", "Ireland", "Australia"}', true),
    ('33333333-3333-3333-3333-333333333302', 'GVK-EMP-007', 'Vikram', 'Rathod', '+91 98490 67890', '{"United States", "Canada"}', true)
ON CONFLICT (id) DO NOTHING;

-- 5. STUDENT PROFILES
INSERT INTO public.student_profiles (
    id, student_id_code, first_name, last_name, phone, preferred_country, target_intake, target_degree,
    ug_college, ug_cgpa_percentage, ug_backlogs, english_test_type, english_overall_score, gre_score
)
VALUES
    (
        '33333333-3333-3333-3333-333333333311',
        'GVK-STU-2026-0042',
        'Rahul',
        'Sharma',
        '+91 98765 43210',
        'United Kingdom',
        'Fall 2026',
        'MSc Computer Science',
        'Osmania University College of Engineering',
        8.45,
        0,
        'IELTS',
        7.5,
        318
    ),
    (
        '33333333-3333-3333-3333-333333333312',
        'GVK-STU-2026-0089',
        'Ananya',
        'Reddy',
        '+91 97000 11223',
        'United Kingdom',
        'Fall 2026',
        'MSc Artificial Intelligence',
        'JNTU Hyderabad',
        8.80,
        0,
        'PTE',
        78,
        324
    )
ON CONFLICT (id) DO NOTHING;

-- 6. COUNSELOR STUDENT ASSIGNMENTS
INSERT INTO public.counselor_student_assignments (id, counselor_id, student_id, is_active)
VALUES
    ('44444444-4444-4444-4444-444444444401', '33333333-3333-3333-3333-333333333301', '33333333-3333-3333-3333-333333333311', true),
    ('44444444-4444-4444-4444-444444444402', '33333333-3333-3333-3333-333333333301', '33333333-3333-3333-3333-333333333312', true)
ON CONFLICT (id) DO NOTHING;

-- 7. STUDENT APPLICATIONS (RAHUL SHARMA HAS 4 APPLICATIONS WITH DIFFERENT STATUSES)
INSERT INTO public.student_applications (
    id, student_id, university_id, course_id, intake, app_ref_number, tuition_fee_currency, tuition_fee_amount,
    application_fee, submission_date, deadline, current_status, offer_type, offer_conditions, deposit_amount, deposit_deadline, deposit_status, counselor_remarks
)
VALUES
    (
        '55555555-5555-5555-5555-555555555501',
        '33333333-3333-3333-3333-333333333311',
        '11111111-1111-1111-1111-111111111101', -- Manchester
        '22222222-2222-2222-2222-222222222201',
        'Fall 2026',
        'UOM-2026-89410',
        'GBP',
        33500,
        60,
        '2026-10-15',
        '2026-12-01',
        'conditional_offer',
        'conditional',
        'Submit Consolidated Degree Certificate & Pay £2,000 tuition deposit by 15 Dec 2026',
        2000,
        '2026-12-15',
        'pending',
        'Conditional offer received! Priority is to pay deposit before 15 Dec to reserve seat.'
    ),
    (
        '55555555-5555-5555-5555-555555555502',
        '33333333-3333-3333-3333-333333333311',
        '11111111-1111-1111-1111-111111111102', -- Birmingham
        '22222222-2222-2222-2222-222222222202',
        'Fall 2026',
        'UOB-2026-55102',
        'GBP',
        28500,
        50,
        '2026-10-20',
        '2026-12-15',
        'under_review',
        'none',
        null,
        null,
        null,
        'pending',
        'Admissions department confirmed receipt. Departmental committee reviewing portfolio.'
    ),
    (
        '55555555-5555-5555-5555-555555555503',
        '33333333-3333-3333-3333-333333333311',
        '11111111-1111-1111-1111-111111111103', -- Warwick
        '22222222-2222-2222-2222-222222222203',
        'Fall 2026',
        'WAR-2026-11890',
        'GBP',
        36000,
        75,
        null,
        '2026-11-30',
        'documents_pending',
        'none',
        null,
        null,
        null,
        'pending',
        'Missing updated Statement of Purpose tailored specifically to Warwick modules.'
    ),
    (
        '55555555-5555-5555-5555-555555555504',
        '33333333-3333-3333-3333-333333333311',
        '11111111-1111-1111-1111-111111111104', -- Leeds
        '22222222-2222-2222-2222-222222222204',
        'Fall 2026',
        'LEE-2026-77341',
        'GBP',
        29000,
        0,
        '2026-09-28',
        '2026-11-15',
        'unconditional_offer',
        'unconditional',
        null,
        1500,
        '2026-12-20',
        'paid',
        'Unconditional offer confirmed! Deposit paid. Ready for CAS processing once financial docs verified.'
    )
ON CONFLICT (id) DO NOTHING;

-- 8. INITIALIZE 22 JOURNEY STAGES FOR RAHUL SHARMA
INSERT INTO public.student_journey_records (
    student_id, stage_number, stage_name, description, status, is_mandatory, responsible_party, start_date, completion_date, counselor_remarks
)
VALUES
    ('33333333-3333-3333-3333-333333333311', 1, 'Counseling Session', 'Initial counseling and study abroad destination roadmap', 'completed', true, 'counselor', '2026-08-10', '2026-08-10', 'Profile suitable for Russell Group UK universities.'),
    ('33333333-3333-3333-3333-333333333311', 2, 'Profile Evaluation', 'Academic and English proficiency evaluation', 'completed', true, 'counselor', '2026-08-12', '2026-08-14', 'CGPA 8.45 and IELTS 7.5 cleared all minimum requirements.'),
    ('33333333-3333-3333-3333-333333333311', 3, 'Document Collection', 'Gathering transcripts, certificates, passport & recommendation letters', 'in_progress', true, 'student', '2026-08-15', null, 'Pending updated Warwick SOP.'),
    ('33333333-3333-3333-3333-333333333311', 4, 'University Shortlisting', 'Curating dream, target, and safe university options', 'completed', true, 'counselor', '2026-08-25', '2026-08-28', 'Shortlisted Manchester, Birmingham, Warwick, Leeds, Bristol.'),
    ('33333333-3333-3333-3333-333333333311', 5, 'Application Submission', 'Official portal submissions with references', 'in_progress', true, 'counselor', '2026-09-25', null, '3 applications submitted, 1 pending documents.'),
    ('33333333-3333-3333-3333-333333333311', 6, 'Conditional Offer', 'Receipt and review of conditional admission offers', 'completed', true, 'university', '2026-10-25', '2026-11-05', 'Conditional offer received from Manchester; Unconditional from Leeds.'),
    ('33333333-3333-3333-3333-333333333311', 7, 'Interview / University Payment', 'Mock interview preparation and university deposit payment', 'waiting_student', true, 'student', '2026-11-06', null, 'Manchester deposit (£2,000) due by 15 Dec 2026.'),
    ('33333333-3333-3333-3333-333333333311', 8, 'TB Test', 'UKVI approved clinic Tuberculosis screening test', 'not_started', true, 'student', null, null, 'Schedule test in Hyderabad 2-3 months prior to travel.'),
    ('33333333-3333-3333-3333-333333333311', 9, 'Unconditional Offer', 'Conversion of conditional offer upon clearing academic/financial requirements', 'in_progress', true, 'university', '2026-11-01', null, 'Leeds confirmed unconditional.'),
    ('33333333-3333-3333-3333-333333333311', 10, 'CAS Request & Issuance', 'Confirmation of Acceptance for Studies generation', 'not_started', true, 'counselor', null, null, null),
    ('33333333-3333-3333-3333-333333333311', 11, 'Visa Application', 'Online UKVI Tier 4 student visa submission', 'not_started', true, 'counselor', null, null, null),
    ('33333333-3333-3333-3333-333333333311', 12, 'IHS Payment', 'Immigration Health Surcharge fee payment', 'not_started', true, 'student', null, null, null),
    ('33333333-3333-3333-3333-333333333311', 13, 'Visa Approval', 'VFS appointment and biometric passport stamp', 'not_started', true, 'external', null, null, null),
    ('33333333-3333-3333-3333-333333333311', 14, 'E-Visa Registration', 'UKVI digital status account creation', 'not_started', true, 'student', null, null, null),
    ('33333333-3333-3333-3333-333333333311', 15, 'Flight Tickets', 'Booking international flight tickets', 'not_started', false, 'student', null, null, null),
    ('33333333-3333-3333-3333-333333333311', 16, 'International Driving Permit', 'IDP application through RTA', 'not_started', false, 'student', null, null, null),
    ('33333333-3333-3333-3333-333333333311', 17, 'Police Clearance Certificate', 'Passport Seva Kendra PCC verification', 'not_started', false, 'student', null, null, null),
    ('33333333-3333-3333-3333-333333333311', 18, 'Pre-Departure Briefing', 'GVK Hyderabad pre-departure orientation briefing', 'not_started', true, 'counselor', null, null, null),
    ('33333333-3333-3333-3333-333333333311', 19, 'Hyderabad Airport Drop', 'GVK coordinated RGIA Hyderabad airport send-off', 'not_started', false, 'counselor', null, null, null),
    ('33333333-3333-3333-3333-333333333311', 20, 'London Heathrow Pick-up', 'GVK airport pickup and transfer in the UK', 'not_started', false, 'external', null, null, null),
    ('33333333-3333-3333-3333-333333333311', 21, 'Accommodation Check-in', 'University hall or private student accommodation move-in', 'not_started', true, 'student', null, null, null),
    ('33333333-3333-3333-3333-333333333311', 22, 'College Enrollment', 'Campus registration, student ID card and BRP collection', 'not_started', true, 'student', null, null, null)
ON CONFLICT (student_id, stage_number) DO NOTHING;

-- 9. TASKS FOR RAHUL SHARMA
INSERT INTO public.tasks (
    id, student_id, application_id, title, description, assigned_by_user_id, due_date, priority, status, is_counselor_internal
)
VALUES
    (
        '66666666-6666-6666-6666-666666666601',
        '33333333-3333-3333-3333-333333333311',
        '55555555-5555-5555-5555-555555555503',
        'Upload missing Statement of Purpose for Warwick',
        'Statement of Purpose must highlight your final year project in AI and align with Warwick MSc Management with IS curriculum.',
        '33333333-3333-3333-3333-333333333301',
        '2026-11-20',
        'urgent',
        'pending',
        false
    ),
    (
        '66666666-6666-6666-6666-666666666602',
        '33333333-3333-3333-3333-333333333311',
        '55555555-5555-5555-5555-555555555501',
        'Pay £2,000 Tuition Deposit for University of Manchester',
        'Transfer the initial deposit via Flywire or Convera to secure your seat before the deadline.',
        '33333333-3333-3333-3333-333333333301',
        '2026-12-15',
        'high',
        'pending',
        false
    )
ON CONFLICT (id) DO NOTHING;

-- 10. MOCK INTERVIEWS & FEEDBACK
INSERT INTO public.mock_interviews (
    id, student_id, counselor_id, application_id, title, scheduled_at, duration_minutes, instructions, zoom_meeting_url, status
)
VALUES
    (
        '77777777-7777-7777-7777-777777777701',
        '33333333-3333-3333-3333-333333333311',
        '33333333-3333-3333-3333-333333333301',
        '55555555-5555-5555-5555-555555555501',
        'University of Manchester Readiness Mock Interview',
        '2026-11-18 15:30:00+05:30',
        30,
        'Be prepared with your SOP discussion, reasons for choosing Manchester over other universities, and post-study career goals.',
        'https://zoom.us/j/98490123456?pwd=GVKMOCK2026',
        'scheduled'
    )
ON CONFLICT (id) DO NOTHING;

-- 11. LOAN CASE
INSERT INTO public.loan_cases (
    id, student_id, counselor_id, stage, lender_name, amount_requested, sanction_amount, interest_rate, counselor_notes, student_next_step
)
VALUES
    (
        '88888888-8888-8888-8888-888888888801',
        '33333333-3333-3333-3333-333333333311',
        '33333333-3333-3333-3333-333333333301',
        'credit_call',
        'HDFC Credila',
        4000000,
        null,
        10.25,
        'Application logged with HDFC Credila branch. Telephonic credit verification scheduled.',
        'Answer credit manager verification call and confirm parent co-borrower ITR details.'
    )
ON CONFLICT (id) DO NOTHING;
