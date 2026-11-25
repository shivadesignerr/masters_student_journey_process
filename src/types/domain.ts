import {
  ApplicationStatus,
  DocumentCategory,
  DocumentVerificationStatus,
  JourneyStageStatus,
  MockInterviewOutcome,
  MockInterviewStatus,
  TaskPriority,
  TaskStatus,
  UserRole,
} from "./database.types";

export interface CurrentUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  identifierCode: string; // e.g. GVK-STU-2026-0042 or GVK-EMP-014
  avatarUrl?: string | null;
}

export interface NextActionItem {
  id: string;
  title: string;
  description: string;
  deadline: string;
  priority: TaskPriority;
  actionType: "upload_document" | "attend_interview" | "pay_deposit" | "complete_task" | "waiting_counselor" | "waiting_university" | "attend_counseling" | "view_evaluation" | "shortlist_universities";
  actionUrl: string;
  actionButtonLabel: string;
  relatedEntityId?: string;
  responsibleParty: "student" | "counselor" | "university";
}

export interface UniversityApplicationCardData {
  id: string;
  universityName: string;
  country: string;
  campus?: string | null;
  courseName: string;
  intake: string;
  durationYears?: 1 | 2;
  tuitionFee: number;
  tuitionFeeCurrency: string;
  tuition1Year?: number;
  tuitionRange1Year?: string;
  tuition2Year?: number;
  tuitionRange2Year?: string;
  placementAvailable?: boolean;
  placementStructure?: string;
  placementFeeNote?: string;
  appRefNumber?: string | null;
  currentStatus: ApplicationStatus;
  offerType: "none" | "conditional" | "unconditional";
  offerConditions?: string | null;
  offerLetterFileName?: string | null;
  offerLetterUrl?: string | null;
  offerLetterUploadedAt?: string | null;
  depositAmount?: number | null;
  depositDeadline?: string | null;
  depositStatus: "pending" | "paid" | "waived";
  casNumber?: string | null;
  visaStatus?: string | null;
  counselorRemarks?: string | null;
  missingRequirementsCount: number;
  isFinalDestination?: boolean;
  decisionStatus?: "pending" | "accepted" | "declined" | "rejected";
  updatedAt: string;
}

export interface DocumentVaultItem {
  id: string;
  studentId: string;
  category: DocumentCategory;
  documentType: string;
  title: string;
  verificationStatus: DocumentVerificationStatus;
  latestVersion: number;
  fileName?: string;
  fileSize?: number;
  uploadedAt?: string;
  verifiedAt?: string | null;
  verifiedByCounselorId?: string | null;
  counselorComments?: string | null;
  isReusable: boolean;
}

export interface JourneyStageItem {
  id: string;
  stageNumber: number;
  stageName: string;
  description: string;
  status: JourneyStageStatus;
  isMandatory: boolean;
  responsibleParty: "student" | "counselor" | "university" | "external";
  startDate?: string | null;
  completionDate?: string | null;
  deadline?: string | null;
  counselorRemarks?: string | null;
  supportingDocumentId?: string | null;
  updatedAt?: string | null;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string | null;
  assignedByName: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  applicationName?: string;
  studentNotes?: string | null;
  isOverdue: boolean;
  isCounselorInternal: boolean;
  completionType?: "counselor_signoff" | "student_submission";
  meetingUrl?: string;
  meetingId?: string;
  meetingPasscode?: string;
  relatedStageNumber?: number;
}

export interface MockInterviewItem {
  id: string;
  studentId?: string;
  counselorId?: string;
  title: string;
  counselorName: string;
  studentName?: string;
  scheduledAt: string;
  durationMinutes: number;
  instructions?: string | null;
  zoomMeetingUrl: string;
  zoomMeetingId?: string | null;
  zoomPasscode?: string | null;
  status: MockInterviewStatus;
  cancellationReason?: string | null;
  cancelledAt?: string | null;
  feedback?: {
    outcome: MockInterviewOutcome;
    strengths: string;
    areasForImprovement: string;
    communicationScore: number;
    academicClarityScore: number;
    visaIntentScore: number;
    studentVisibleFeedback: string;
    counselorPrivateNotes?: string | null;
    evaluatedAt: string;
  } | null;
}

export interface ActivityLogItem {
  id: string;
  userId: string;
  userName?: string;
  role: UserRole;
  action: string;
  title?: string;
  description?: string;
  affectedStudentId?: string;
  affectedCounselorId?: string;
  relatedApplicationId?: string;
  entityType: string;
  entityId?: string;
  previousValue?: any;
  newValue?: any;
  context?: any;
  createdAt: string;
}
