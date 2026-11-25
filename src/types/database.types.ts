export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "student" | "counselor" | "admin";
export type UserStatus = "pending_activation" | "active" | "suspended";

export type ApplicationStatus =
  | "shortlisted"
  | "documents_pending"
  | "ready_for_submission"
  | "submitted"
  | "under_review"
  | "additional_info_required"
  | "interview_required"
  | "conditional_offer"
  | "unconditional_offer"
  | "rejected"
  | "withdrawn"
  | "deposit_pending"
  | "deposit_paid"
  | "cas_pending"
  | "cas_received"
  | "visa_processing"
  | "completed";

export type DocumentCategory =
  | "personal"
  | "academic"
  | "english_proficiency"
  | "masters_prep"
  | "financial"
  | "visa";

export type DocumentVerificationStatus =
  | "required"
  | "not_uploaded"
  | "uploaded"
  | "under_review"
  | "verified"
  | "rejected"
  | "resubmission_required"
  | "not_applicable";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type TaskStatus =
  | "pending"
  | "in_progress"
  | "submitted"
  | "under_review"
  | "completed"
  | "overdue"
  | "cancelled";

export type JourneyStageStatus =
  | "not_started"
  | "in_progress"
  | "waiting_student"
  | "waiting_counselor"
  | "waiting_university"
  | "completed"
  | "on_hold"
  | "not_applicable";

export type MockInterviewStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "rescheduled";

export type MockInterviewOutcome = "PASS" | "FAIL";

export type LoanStage =
  | "not_required"
  | "bank_selected"
  | "info_submitted"
  | "bank_login"
  | "credit_call"
  | "doc_verification"
  | "physical_verification"
  | "approved"
  | "sanction_letter"
  | "disbursement_pending"
  | "disbursed";

export type FollowUpStatus =
  | "pending"
  | "contacted"
  | "awaiting_student"
  | "awaiting_university"
  | "on_hold"
  | "completed";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: UserRole;
          status: UserStatus;
          activation_code?: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role: UserRole;
          status?: UserStatus;
          activation_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          role?: UserRole;
          status?: UserStatus;
          activation_code?: string | null;
          updated_at?: string;
        };
      };
      student_profiles: {
        Row: {
          id: string;
          student_id_code: string;
          first_name: string;
          last_name: string;
          phone: string;
          avatar_url: string | null;
          preferred_country: string;
          target_intake: string;
          target_degree: string;
          activation_code?: string | null;
          ug_college: string | null;
          ug_cgpa_percentage: number | null;
          ug_backlogs: number;
          english_test_type: string | null;
          english_overall_score: number | null;
          gre_score: number | null;
          created_at: string;
          updated_at: string;
        };
      };
      counselor_profiles: {
        Row: {
          id: string;
          employee_id_code: string;
          first_name: string;
          last_name: string;
          phone: string;
          avatar_url: string | null;
          specialization_countries: string[];
          is_active: boolean;
          created_at: string;
        };
      };
      counselor_student_assignments: {
        Row: {
          id: string;
          counselor_id: string;
          student_id: string;
          is_active: boolean;
          assigned_at: string;
          assigned_by: string | null;
        };
      };
      universities: {
        Row: {
          id: string;
          name: string;
          country: string;
          city: string;
          campus: string | null;
          ranking: number | null;
          logo_url: string | null;
          website_url: string | null;
          is_active: boolean;
        };
      };
      courses: {
        Row: {
          id: string;
          university_id: string;
          name: string;
          degree_level: string;
          department: string | null;
          tuition_fee_currency: string;
          tuition_fee_amount: number;
          duration_months: number;
          intake_terms: string[];
        };
      };
      student_applications: {
        Row: {
          id: string;
          student_id: string;
          university_id: string;
          course_id: string;
          intake: string;
          app_ref_number: string | null;
          tuition_fee_currency: string;
          tuition_fee_amount: number;
          application_fee: number;
          submission_date: string | null;
          deadline: string | null;
          current_status: ApplicationStatus;
          offer_type: "none" | "conditional" | "unconditional";
          offer_conditions: string | null;
          deposit_amount: number | null;
          deposit_deadline: string | null;
          deposit_status: "pending" | "paid" | "waived";
          cas_number: string | null;
          cas_issued_at: string | null;
          visa_status: string | null;
          counselor_remarks: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      application_status_history: {
        Row: {
          id: string;
          application_id: string;
          previous_status: ApplicationStatus | null;
          new_status: ApplicationStatus;
          changed_by_user_id: string;
          source: string;
          remarks: string | null;
          created_at: string;
        };
      };
      documents: {
        Row: {
          id: string;
          student_id: string;
          category: DocumentCategory;
          document_type: string;
          title: string;
          verification_status: DocumentVerificationStatus;
          latest_version: number;
          is_reusable: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      document_versions: {
        Row: {
          id: string;
          document_id: string;
          version_number: number;
          file_name: string;
          file_path: string;
          file_size_bytes: number;
          mime_type: string;
          uploaded_by_user_id: string;
          created_at: string;
        };
      };
      document_reviews: {
        Row: {
          id: string;
          document_version_id: string;
          application_id: string | null;
          reviewed_by_counselor_id: string;
          decision: "verified" | "rejected" | "resubmission_required";
          counselor_comments: string | null;
          reviewed_at: string;
        };
      };
      student_journey_records: {
        Row: {
          id: string;
          student_id: string;
          stage_number: number;
          stage_name: string;
          description: string;
          status: JourneyStageStatus;
          is_mandatory: boolean;
          responsible_party: "student" | "counselor" | "university" | "external";
          start_date: string | null;
          completion_date: string | null;
          deadline: string | null;
          counselor_remarks: string | null;
          supporting_document_id: string | null;
          updated_by_user_id: string;
          updated_at: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          student_id: string;
          application_id: string | null;
          title: string;
          description: string | null;
          assigned_by_user_id: string;
          due_date: string;
          priority: TaskPriority;
          status: TaskStatus;
          supporting_document_id: string | null;
          student_submission_notes: string | null;
          is_counselor_internal: boolean;
          created_at: string;
          completed_at: string | null;
        };
      };
      mock_interviews: {
        Row: {
          id: string;
          student_id: string;
          counselor_id: string;
          application_id: string | null;
          title: string;
          scheduled_at: string;
          duration_minutes: number;
          instructions: string | null;
          zoom_meeting_url: string;
          zoom_meeting_id: string | null;
          zoom_passcode: string | null;
          status: MockInterviewStatus;
          retake_of_interview_id: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      interview_feedback: {
        Row: {
          id: string;
          mock_interview_id: string;
          evaluated_by_counselor_id: string;
          outcome: MockInterviewOutcome;
          strengths: string;
          areas_for_improvement: string;
          communication_score: number;
          academic_clarity_score: number;
          visa_intent_score: number;
          student_visible_feedback: string;
          counselor_private_notes: string | null;
          evaluated_at: string;
        };
      };
      loan_cases: {
        Row: {
          id: string;
          student_id: string;
          counselor_id: string;
          stage: LoanStage;
          lender_name: string | null;
          amount_requested: number | null;
          sanction_amount: number | null;
          interest_rate: number | null;
          counselor_notes: string | null;
          student_next_step: string | null;
          updated_at: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          category: string;
          entity_type: string | null;
          entity_id: string | null;
          is_read: boolean;
          created_at: string;
        };
      };
      counselor_internal_notes: {
        Row: {
          id: string;
          student_id: string;
          counselor_id: string;
          category: string;
          content: string;
          created_at: string;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          user_id: string;
          role: UserRole;
          action: string;
          affected_student_id: string | null;
          related_application_id: string | null;
          entity_type: string;
          entity_id: string | null;
          previous_value: Json | null;
          new_value: Json | null;
          context: Json | null;
          created_at: string;
        };
      };
    };
  };
}
