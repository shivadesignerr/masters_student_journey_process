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
  UserStatus,
} from "@/types/database.types";
import {
  ActivityLogItem,
  CurrentUser,
  DocumentVaultItem,
  JourneyStageItem,
  MockInterviewItem,
  NextActionItem,
  TaskItem,
  UniversityApplicationCardData,
} from "@/types/domain";
import { ALL_UK_UNIVERSITIES, ALL_GLOBAL_UNIVERSITIES } from "@/lib/data/universities";

// In-Memory Database store with seed data
export interface DbStore {
  users: Array<{
    id: string;
    email: string;
    role: UserRole;
    status: "active" | "pending_activation" | "suspended";
    passwordHash?: string;
    activationCode?: string;
    isActivated?: boolean;
  }>;
  studentProfiles: Array<{
    id: string;
    studentIdCode: string;
    firstName: string;
    lastName: string;
    phone: string;
    preferredCountry: string;
    targetIntake: string;
    targetDegree: string;
    ugCollege: string;
    ugCgpa: number;
    ugBacklogs: number;
    englishTestType: string;
    englishScore: number;
    greScore?: number;
    activationCode?: string;
    isActivated?: boolean;
    finalDestinationUniversity?: string;
    finalDestinationAppId?: string;
  }>;
  counselorProfiles: Array<{
    id: string;
    employeeIdCode: string;
    firstName: string;
    lastName: string;
    phone: string;
    specializationCountries: string[];
    isActive: boolean;
    defaultZoomMeetingUrl?: string;
    defaultZoomMeetingId?: string;
    defaultZoomPasscode?: string;
  }>;
  counselorAssignments: Array<{
    counselorId: string;
    studentId: string;
    isActive: boolean;
    assignedAt?: string;
    assignedBy?: string;
    notes?: string;
    previousCounselorId?: string;
  }>;
  universities: Array<{
    id: string;
    catalogNo?: number;
    name: string;
    country: string;
    city: string;
    campus?: string;
    ranking: number;
    qsRankDisplay?: string;
    theRankDisplay?: string;
    typeGroup?: string;
    estimatedTuition?: string;
    tuitionFee?: number;
    tuition1Year?: number;
    tuitionRange1Year?: string;
    depositAmount?: number;
    currency?: string;
    mainIntakes?: string;
    typicalIelts?: string;
    keyStrengths?: string;
    tier?: "ambitious" | "target" | "safe";
    russellGroup?: boolean;
    logoUrl?: string;
    websiteUrl: string;
    minCgpa?: string;
    minIelts?: string;
    intakeDeadlines?: string;
  }>;
  courses?: Array<{
    id: string;
    universityId: string;
    universityName: string;
    courseName: string;
    degreeLevel: string;
    discipline: string;
    intake: string;
    durationYears: 1 | 2;
    tuitionFee: number;
    tuitionFeeCurrency: string;
    placementAvailable: boolean;
    placementStructure?: string;
    minIeltsScore: number;
    minCgpa: number;
    scholarshipAvailable: boolean;
    scholarshipDetails?: string;
  }>;
  applications: Array<{
    id: string;
    studentId: string;
    universityId: string;
    universityName: string;
    country: string;
    courseName: string;
    intake: string;
    appRefNumber?: string;
    durationYears?: 1 | 2;
    tuitionFeeCurrency: string;
    tuitionFeeAmount: number;
    tuition1Year?: number;
    tuitionRange1Year?: string;
    tuition2Year?: number;
    tuitionRange2Year?: string;
    placementAvailable?: boolean;
    placementStructure?: string;
    placementFeeNote?: string;
    applicationFee: number;
    submissionDate?: string;
    deadline?: string;
    currentStatus: ApplicationStatus;
    offerType: "none" | "conditional" | "unconditional";
    offerConditions?: string;
    offerLetterFileName?: string;
    offerLetterUrl?: string;
    offerLetterUploadedAt?: string;
    depositAmount?: number;
    depositDeadline?: string;
    depositStatus: "pending" | "paid" | "waived";
    casNumber?: string;
    visaStatus?: string;
    counselorRemarks?: string;
    isFinalDestination?: boolean;
    decisionStatus?: "pending" | "accepted" | "declined" | "rejected";
    updatedAt: string;
  }>;
  documents: Array<DocumentVaultItem>;
  journeyRecords: Array<{
    id: string;
    studentId: string;
    stageNumber: number;
    stageName: string;
    description: string;
    status: JourneyStageStatus;
    isMandatory: boolean;
    responsibleParty: "student" | "counselor" | "university" | "external";
    startDate?: string;
    completionDate?: string;
    deadline?: string;
    counselorRemarks?: string;
    updatedAt: string;
  }>;
  tasks: Array<{
    id: string;
    studentId: string;
    applicationId?: string;
    title: string;
    description?: string;
    assignedByUserId: string;
    assignedByName: string;
    dueDate: string;
    priority: TaskPriority;
    status: TaskStatus;
    studentSubmissionNotes?: string;
    isCounselorInternal: boolean;
    completionType?: "counselor_signoff" | "student_submission";
    relatedStageNumber?: number;
    meetingUrl?: string;
    meetingId?: string;
    meetingPasscode?: string;
    createdAt: string;
  }>;
  mockInterviews: Array<MockInterviewItem & { studentId: string; counselorId: string }>;
  loanCases: Array<{
    id: string;
    studentId: string;
    counselorId: string;
    stage: string;
    lenderName: string;
    amountRequested: number;
    sanctionAmount?: number;
    interestRate: number;
    counselorNotes?: string;
    studentNextStep?: string;
    updatedAt: string;
  }>;
  counselorInternalNotes: Array<{
    id: string;
    studentId: string;
    counselorId: string;
    category: string;
    content: string;
    createdAt: string;
  }>;
  messages: Array<{
    id: string;
    studentId: string;
    counselorId: string;
    senderRole: "student" | "counselor";
    senderName: string;
    content: string;
    createdAt: string;
    isRead?: boolean;
  }>;
  adminCounselorMessages?: Array<{
    id: string;
    counselorId: string;
    senderRole: "admin" | "counselor";
    senderName: string;
    content: string;
    createdAt: string;
    isRead?: boolean;
  }>;
  counselorPeerMessages?: Array<{
    id: string;
    senderId: string;
    senderName: string;
    recipientId: string;
    recipientName: string;
    content: string;
    createdAt: string;
    isRead?: boolean;
  }>;
  notifications: Array<{
    id: string;
    userId: string;
    title: string;
    message: string;
    category: string;
    isRead: boolean;
    createdAt: string;
    readAt?: string;
  }>;
  activityLogs: Array<ActivityLogItem>;
}

// Global in-memory singleton initialized with realistic seed data
export const initialStore: DbStore = {
  users: [
    {
      id: "usr-counselor-01",
      email: "counselor.priya@gvkedutech.com",
      role: "counselor",
      status: "active",
      passwordHash: "Counselor@123",
    },
    {
      id: "usr-counselor-01",
      email: "counselor1@gmail.com",
      role: "counselor",
      status: "active",
      passwordHash: "Counselor@123",
    },
    {
      id: "usr-counselor-01",
      email: "shivdesignerr@gmail.com",
      role: "counselor",
      status: "active",
      passwordHash: "Counselor@123",
    },
    {
      id: "usr-counselor-1795090237245",
      email: "vikram.rao@gvkedutech.com",
      role: "counselor",
      status: "active",
      passwordHash: "Counselor@123",
    },
    {
      id: "usr-counselor-03",
      email: "ananya.sen@gvkedutech.com",
      role: "counselor",
      status: "active",
      passwordHash: "Counselor@123",
    },
    {
      id: "usr-counselor-04",
      email: "rajesh.mehta@gvkedutech.com",
      role: "counselor",
      status: "active",
      passwordHash: "Counselor@123",
    },
    {
      id: "usr-student-01",
      email: "rahul.sharma@gmail.com",
      role: "student",
      status: "active",
      passwordHash: "Student@123",
      activationCode: "GVK-ACT-784910-UK",
    },
    {
      id: "usr-admin-01",
      email: "admin@gvkedutech.com",
      role: "admin",
      status: "active",
      passwordHash: "Error!@#2026",
    },
  ],
  studentProfiles: [
    {
      id: "usr-student-01",
      studentIdCode: "GVK-STU-2026-0042",
      firstName: "Rahul",
      lastName: "Sharma",
      phone: "+91 98765 43210",
      preferredCountry: "United Kingdom",
      targetIntake: "September Intake",
      targetDegree: "MSc Computer Science",
      ugCollege: "Osmania University College of Engineering",
      ugCgpa: 8.45,
      ugBacklogs: 0,
      englishTestType: "IELTS",
      englishScore: 7.5,
      greScore: 318,
      activationCode: "GVK-ACT-784910-UK",
      isActivated: true,
    },
  ],
  counselorProfiles: [
    {
      id: "usr-counselor-01",
      employeeIdCode: "GVK-EMP-001",
      firstName: "Priya",
      lastName: "Varma",
      phone: "+91 98490 12345",
      specializationCountries: ["United Kingdom", "Ireland", "Australia"],
      isActive: true,
      defaultZoomMeetingUrl: "https://zoom.us/start/videomeeting",
      defaultZoomMeetingId: "984 9012 3456",
      defaultZoomPasscode: "GVK2026",
    },
    {
      id: "usr-counselor-1795090237245",
      employeeIdCode: "GVK-EMP-002",
      firstName: "Vikram",
      lastName: "Rao",
      phone: "+91 98490 12346",
      specializationCountries: ["United Kingdom", "Canada", "USA"],
      isActive: true,
      defaultZoomMeetingUrl: "https://zoom.us/start/videomeeting",
      defaultZoomMeetingId: "984 9012 3457",
      defaultZoomPasscode: "GVK2026",
    },
    {
      id: "usr-counselor-03",
      employeeIdCode: "GVK-EMP-003",
      firstName: "Ananya",
      lastName: "Sen",
      phone: "+91 98490 12347",
      specializationCountries: ["United Kingdom", "Ireland", "Germany"],
      isActive: true,
      defaultZoomMeetingUrl: "https://zoom.us/start/videomeeting",
      defaultZoomMeetingId: "984 9012 3458",
      defaultZoomPasscode: "GVK2026",
    },
    {
      id: "usr-counselor-04",
      employeeIdCode: "GVK-EMP-004",
      firstName: "Rajesh",
      lastName: "Mehta",
      phone: "+91 98490 12348",
      specializationCountries: ["United Kingdom", "Global Education Loans", "Finance"],
      isActive: true,
      defaultZoomMeetingUrl: "https://zoom.us/start/videomeeting",
      defaultZoomMeetingId: "984 9012 3459",
      defaultZoomPasscode: "GVK2026",
    },
  ],
  counselorAssignments: [
    {
      counselorId: "usr-counselor-01",
      studentId: "usr-student-01",
      isActive: true,
    },
  ],
  universities: ALL_GLOBAL_UNIVERSITIES.map((u, i) => ({
    id: u.id || `univ-${String(i + 1).padStart(2, "0")}`,
    catalogNo: u.catalogNo || (i + 1),
    name: u.name,
    country: u.country,
    city: u.city,
    campus: "Main Campus",
    ranking: u.ranking,
    qsRankDisplay: u.qsRankDisplay || `#${u.ranking}`,
    theRankDisplay: u.theRankDisplay || "Top Global",
    typeGroup: u.typeGroup || (u.russellGroup ? "Public (Russell Group)" : "Public"),
    estimatedTuition: u.estimatedTuition || u.tuitionRange1Year,
    tuitionFee: u.tuitionFee || u.tuition1Year || 25000,
    mainIntakes: u.mainIntakes || "Sep, Jan",
    typicalIelts: u.typicalIelts || u.minIelts,
    keyStrengths: u.keyStrengths || u.course,
    tier: u.tier,
    russellGroup: u.russellGroup,
    websiteUrl: u.websiteUrl,
    minCgpa: u.minCgpa || "60%",
    minIelts: u.minIelts || "6.5",
    intakeDeadlines: u.mainIntakes ? `Intakes: ${u.mainIntakes}` : "Sep, Jan: Rolling",
  })),
  courses: ALL_GLOBAL_UNIVERSITIES.flatMap((u, i) => {
    const list: Array<NonNullable<DbStore["courses"]>[0]> = [
      {
        id: `course-${i + 1}-01`,
        universityId: `univ-${String(i + 1).padStart(2, "0")}`,
        universityName: u.name,
        courseName: u.course,
        degreeLevel: "Postgraduate (MSc)",
        discipline: "Computer Science & Artificial Intelligence",
        intake: u.intake || "Fall 2026",
        durationYears: (u.tuition2Year ? 2 : 1) as 1 | 2,
        tuitionFee: u.tuitionFee || 28000,
        tuitionFeeCurrency: u.currency || "GBP",
        placementAvailable: u.placementAvailable,
        placementStructure: u.placementStructure,
        minIeltsScore: parseFloat(u.minIelts) || 6.5,
        minCgpa: parseFloat(u.minCgpa) || 6.5,
        scholarshipAvailable: true,
        scholarshipDetails: "GVK Partner Merit Scholarship (£2,500 - £4,000 waiver)",
      },
    ];
    if (u.alternativeCourses) {
      u.alternativeCourses.forEach((alt, idx) => {
        list.push({
          id: `course-${i + 1}-${String(idx + 2).padStart(2, "0")}`,
          universityId: `univ-${String(i + 1).padStart(2, "0")}`,
          universityName: u.name,
          courseName: alt,
          degreeLevel: "Postgraduate (MSc)",
          discipline: "Information Systems & Data Engineering",
          intake: u.intake || "Fall 2026",
          durationYears: 1,
          tuitionFee: u.tuitionFee || 27500,
          tuitionFeeCurrency: u.currency || "GBP",
          placementAvailable: u.placementAvailable,
          placementStructure: u.placementStructure,
          minIeltsScore: parseFloat(u.minIelts) || 6.5,
          minCgpa: parseFloat(u.minCgpa) || 6.5,
          scholarshipAvailable: false,
        });
      });
    }
    return list;
  }),
  applications: [],
  documents: [],
  journeyRecords: [
    {
      id: "j-01",
      studentId: "usr-student-01",
      stageNumber: 1,
      stageName: "Counseling Session",
      description: "Initial counseling and study abroad destination roadmap",
      status: "in_progress",
      isMandatory: true,
      responsibleParty: "counselor",
      startDate: "2026-11-19",
      counselorRemarks: "Initial 1-on-1 counseling session scheduled to establish overseas destinations, intake planning, and degree specialization.",
      updatedAt: "2026-11-19T09:00:00Z",
    },
    {
      id: "j-02",
      studentId: "usr-student-01",
      stageNumber: 2,
      stageName: "Profile Evaluation",
      description: "Academic and English proficiency evaluation",
      status: "not_started",
      isMandatory: true,
      responsibleParty: "counselor",
      updatedAt: "2026-11-19T09:00:00Z",
    },
    {
      id: "j-03",
      studentId: "usr-student-01",
      stageNumber: 3,
      stageName: "Document Collection",
      description: "Gathering transcripts, certificates, passport & recommendation letters",
      status: "not_started",
      isMandatory: true,
      responsibleParty: "student",
      updatedAt: "2026-11-19T09:00:00Z",
    },
    {
      id: "j-04",
      studentId: "usr-student-01",
      stageNumber: 4,
      stageName: "University Shortlisting",
      description: "Curating dream, target, and safe university options",
      status: "not_started",
      isMandatory: true,
      responsibleParty: "counselor",
      updatedAt: "2026-11-01T00:00:00Z",
    },
    {
      id: "j-05",
      studentId: "usr-student-01",
      stageNumber: 5,
      stageName: "Application Submission",
      description: "Official portal submissions with references",
      status: "not_started",
      isMandatory: true,
      responsibleParty: "counselor",
      updatedAt: "2026-11-01T00:00:00Z",
    },
    {
      id: "j-06",
      studentId: "usr-student-01",
      stageNumber: 6,
      stageName: "Conditional Offer",
      description: "Receipt and review of conditional admission offers",
      status: "not_started",
      isMandatory: true,
      responsibleParty: "university",
      updatedAt: "2026-11-01T00:00:00Z",
    },
    {
      id: "j-07",
      studentId: "usr-student-01",
      stageNumber: 7,
      stageName: "Mock Admissions Interview",
      description: "Internal readiness interview conducted by GVK counseling desk",
      status: "not_started",
      isMandatory: true,
      responsibleParty: "counselor",
      updatedAt: "2026-11-01T00:00:00Z",
    },
    {
      id: "j-08",
      studentId: "usr-student-01",
      stageNumber: 8,
      stageName: "University Admissions Interview",
      description: "Official interview conducted by University Admissions Committee",
      status: "not_started",
      isMandatory: true,
      responsibleParty: "university",
      updatedAt: "2026-11-01T00:00:00Z",
    },
    {
      id: "j-09",
      studentId: "usr-student-01",
      stageNumber: 9,
      stageName: "University Deposit Payment",
      description: "Tuition deposit payment to secure admission seat",
      status: "not_started",
      isMandatory: true,
      responsibleParty: "student",
      updatedAt: "2026-11-01T00:00:00Z",
    },
    {
      id: "j-10",
      studentId: "usr-student-01",
      stageNumber: 10,
      stageName: "TB Test",
      description: "UKVI approved clinic Tuberculosis screening test",
      status: "not_started",
      isMandatory: true,
      responsibleParty: "student",
      updatedAt: "2026-11-01T00:00:00Z",
    },
    {
      id: "j-11",
      studentId: "usr-student-01",
      stageNumber: 11,
      stageName: "Unconditional Offer",
      description: "Conversion of conditional offer upon clearing academic/financial requirements",
      status: "not_started",
      isMandatory: true,
      responsibleParty: "university",
      updatedAt: "2026-11-01T00:00:00Z",
    },
    {
      id: "j-12",
      studentId: "usr-student-01",
      stageNumber: 12,
      stageName: "CAS Request & Issuance",
      description: "Confirmation of Acceptance for Studies generation",
      status: "not_started",
      isMandatory: true,
      responsibleParty: "counselor",
      updatedAt: "2026-11-01T00:00:00Z",
    },
    {
      id: "j-13",
      studentId: "usr-student-01",
      stageNumber: 13,
      stageName: "Visa Application",
      description: "Online UKVI Tier 4 student visa submission",
      status: "not_started",
      isMandatory: true,
      responsibleParty: "counselor",
      updatedAt: "2026-11-01T00:00:00Z",
    },
    {
      id: "j-14",
      studentId: "usr-student-01",
      stageNumber: 14,
      stageName: "IHS Payment",
      description: "Immigration Health Surcharge fee payment",
      status: "not_started",
      isMandatory: true,
      responsibleParty: "student",
      updatedAt: "2026-11-01T00:00:00Z",
    },
    {
      id: "j-15",
      studentId: "usr-student-01",
      stageNumber: 15,
      stageName: "Visa Approval",
      description: "VFS appointment and biometric passport stamp",
      status: "not_started",
      isMandatory: true,
      responsibleParty: "external",
      updatedAt: "2026-11-01T00:00:00Z",
    },
    {
      id: "j-16",
      studentId: "usr-student-01",
      stageNumber: 16,
      stageName: "E-Visa Registration",
      description: "UKVI digital status account creation",
      status: "not_started",
      isMandatory: true,
      responsibleParty: "student",
      updatedAt: "2026-11-01T00:00:00Z",
    },
    {
      id: "j-17",
      studentId: "usr-student-01",
      stageNumber: 17,
      stageName: "Flight Tickets",
      description: "Booking international flight tickets",
      status: "not_started",
      isMandatory: false,
      responsibleParty: "student",
      updatedAt: "2026-11-01T00:00:00Z",
    },
    {
      id: "j-18",
      studentId: "usr-student-01",
      stageNumber: 18,
      stageName: "Pre-Departure Briefing",
      description: "GVK Hyderabad pre-departure orientation briefing",
      status: "not_started",
      isMandatory: true,
      responsibleParty: "counselor",
      updatedAt: "2026-11-01T00:00:00Z",
    },
    {
      id: "j-19",
      studentId: "usr-student-01",
      stageNumber: 19,
      stageName: "Hyderabad Airport Drop",
      description: "GVK coordinated RGIA Hyderabad airport send-off",
      status: "not_started",
      isMandatory: false,
      responsibleParty: "counselor",
      updatedAt: "2026-11-01T00:00:00Z",
    },
    {
      id: "j-20",
      studentId: "usr-student-01",
      stageNumber: 20,
      stageName: "London Heathrow Pick-up",
      description: "GVK airport pickup and transfer in the UK",
      status: "not_started",
      isMandatory: false,
      responsibleParty: "external",
      updatedAt: "2026-11-01T00:00:00Z",
    },
    {
      id: "j-21",
      studentId: "usr-student-01",
      stageNumber: 21,
      stageName: "Accommodation Check-in",
      description: "University hall or private student accommodation move-in",
      status: "not_started",
      isMandatory: true,
      responsibleParty: "student",
      updatedAt: "2026-11-01T00:00:00Z",
    },
    {
      id: "j-22",
      studentId: "usr-student-01",
      stageNumber: 22,
      stageName: "College Enrollment",
      description: "Campus registration, student ID card and BRP collection",
      status: "not_started",
      isMandatory: true,
      responsibleParty: "student",
      updatedAt: "2026-11-01T00:00:00Z",
    },
    {
      id: "j-23",
      studentId: "usr-student-01",
      stageNumber: 23,
      stageName: "GP Registration",
      description: "Registration with local General Practice (GP) surgery for National Health Service (NHS) access",
      status: "not_started",
      isMandatory: true,
      responsibleParty: "student",
      updatedAt: "2026-11-01T00:00:00Z",
    },
    {
      id: "j-24",
      studentId: "usr-student-01",
      stageNumber: 24,
      stageName: "NI Registration",
      description: "National Insurance (NI) number application with the UK Department for Work and Pensions (DWP)",
      status: "not_started",
      isMandatory: true,
      responsibleParty: "student",
      updatedAt: "2026-11-01T00:00:00Z",
    },
    {
      id: "j-25",
      studentId: "usr-student-01",
      stageNumber: 25,
      stageName: "Part Time Job Support",
      description: "GVK post-landing career desk assistance for CV formatting, NI verification, 20-hour work rights compliance, and local part-time job placement",
      status: "not_started",
      isMandatory: false,
      responsibleParty: "counselor",
      updatedAt: "2026-11-01T00:00:00Z",
    },
  ],
  tasks: [
    {
      id: "tsk-01",
      studentId: "usr-student-01",
      title: "In-Person Masters Counseling Session with Rahul Sharma",
      description: "Conduct offline in-person counseling session at GVK Overseas Education Center to evaluate profile, map destinations, and review roadmap.",
      assignedByUserId: "usr-counselor-01",
      assignedByName: "Priya Varma",
      dueDate: "2026-11-20",
      priority: "urgent",
      status: "completed",
      isCounselorInternal: true,
      completionType: "counselor_signoff",
      relatedStageNumber: 1,
      createdAt: "2026-11-19T09:00:00Z",
    },
  ],
  mockInterviews: [],
  loanCases: [],
  counselorInternalNotes: [
    {
      id: "note-01",
      studentId: "usr-student-01",
      counselorId: "usr-counselor-01",
      category: "academic_risk",
      content:
        "Initial candidate intake. Rahul Sharma has strong B.Tech academics (8.45 CGPA) targeting UK Russell Group Fall 2026. Scheduled Stage 01 counseling session to establish university tiers and intake window.",
      createdAt: "2026-11-19T09:00:00Z",
    },
  ],
  messages: [
    {
      id: "msg-01",
      studentId: "usr-student-01",
      counselorId: "usr-counselor-01",
      senderRole: "counselor",
      senderName: "Priya Varma",
      content: "Hello Rahul, welcome to GVK Masters! Please review your onboarding tasks and message me here with any queries.",
      createdAt: "2026-11-19T09:00:00Z",
      isRead: false,
    },
  ],
  adminCounselorMessages: [
    {
      id: "ac-msg-01",
      counselorId: "usr-counselor-01",
      senderRole: "admin",
      senderName: "GVK Central Admissions Admin",
      content: "Hello Priya, please ensure Rahul Sharma's application milestones for UK Fall 2026 intake are prioritized this week.",
      createdAt: "2026-11-19T09:30:00Z",
      isRead: true,
    },
    {
      id: "ac-msg-02",
      counselorId: "usr-counselor-01",
      senderRole: "counselor",
      senderName: "Priya Varma",
      content: "Acknowledged Central Admin! I have updated Rahul's document queue and initiated the education loan checklist.",
      createdAt: "2026-11-19T10:15:00Z",
      isRead: false,
    },
  ],
  counselorPeerMessages: [
    {
      id: "cpm-01",
      senderId: "usr-counselor-02",
      senderName: "Vikram Rao",
      recipientId: "usr-counselor-01",
      recipientName: "Priya Varma",
      content: "Hi Priya! I reviewed Rahul Sharma's visa timeline. His maintenance funds must be held for 28 consecutive days before we request CAS.",
      createdAt: "2026-11-20T11:30:00Z",
      isRead: true,
    },
    {
      id: "cpm-02",
      senderId: "usr-counselor-01",
      senderName: "Priya Varma",
      recipientId: "usr-counselor-02",
      recipientName: "Vikram Rao",
      content: "Thanks Vikram! I have notified Rahul and verified his latest bank balance statement. Everything is on schedule.",
      createdAt: "2026-11-20T12:00:00Z",
      isRead: true,
    },
  ],
  notifications: [
    {
      id: "notif-01",
      userId: "usr-student-01",
      title: "Welcome to GVK Masters!",
      message: "Your overseas admissions journey has begun. Assigned senior counselor: Priya Varma.",
      category: "journey",
      isRead: false,
      createdAt: "2026-11-19T09:00:00Z",
    },
    {
      id: "notif-02",
      userId: "usr-student-01",
      title: "Stage 01 In-Person Counseling Session Scheduled",
      message: "In-person consultation scheduled at GVK Overseas Education Center with Priya Varma to map out your target destinations and degree roadmap.",
      category: "journey",
      isRead: false,
      createdAt: "2026-11-19T09:05:00Z",
    },
    {
      id: "notif-03",
      userId: "usr-student-01",
      title: "Action Item Assigned: Onboarding Consultation",
      message: "Your counselor scheduled your initial in-person counseling milestone at GVK Center.",
      category: "task",
      isRead: false,
      createdAt: "2026-11-19T09:10:00Z",
    },
    {
      id: "notif-coun-01",
      userId: "usr-counselor-01",
      title: "New Document Uploaded: Passport Front & Back",
      message: "Rahul Sharma (GVK-STU-2026-0042) uploaded passport_front_back_rahul.pdf for Personal & Passport verification.",
      category: "document",
      isRead: false,
      createdAt: "2026-11-20T11:00:00Z",
    },
    {
      id: "notif-coun-02",
      userId: "usr-counselor-01",
      title: "New Document Uploaded: Statement of Purpose (SOP)",
      message: "Rahul Sharma (GVK-STU-2026-0042) uploaded sop_msc_cs_uk_rahul_final.pdf for SOP, LOR & Resume verification.",
      category: "document",
      isRead: false,
      createdAt: "2026-11-20T11:15:00Z",
    },
    {
      id: "notif-coun-03",
      userId: "usr-counselor-01",
      title: "Task Tick-Marked & Submitted: Complete Masters Profile Questionnaire",
      message: "Candidate Rahul Sharma tick-marked task as completed. Submission note: 'All questionnaire responses provided.'",
      category: "task",
      isRead: false,
      createdAt: "2026-11-20T11:20:00Z",
    },
    {
      id: "notif-coun-04",
      userId: "usr-counselor-02",
      title: "Candidate Document Upload: Degree Transcripts",
      message: "Rohan Verma (GVK-STU-2026-0043) uploaded btech_transcripts_consolidated.pdf. Available in Verification Queue.",
      category: "document",
      isRead: false,
      createdAt: "2026-11-20T11:30:00Z",
    },
    {
      id: "notif-admin-01",
      userId: "admin",
      title: "Candidate Document Upload: Rahul Sharma",
      message: "Rahul Sharma (GVK-STU-2026-0042) uploaded passport_front_back_rahul.pdf under Personal & Passport. Awaiting counselor verification.",
      category: "document",
      isRead: false,
      createdAt: "2026-11-20T11:00:00Z",
    },
    {
      id: "notif-admin-02",
      userId: "admin",
      title: "Candidate Document Upload: Rahul Sharma",
      message: "Rahul Sharma (GVK-STU-2026-0042) uploaded sop_msc_cs_uk_rahul_final.pdf under SOP, LOR & Resume. Awaiting counselor verification.",
      category: "document",
      isRead: false,
      createdAt: "2026-11-20T11:15:00Z",
    },
    {
      id: "notif-admin-03",
      userId: "admin",
      title: "Candidate Task Submitted: Rahul Sharma",
      message: "Rahul Sharma tick-marked task 'Complete Masters Profile Questionnaire' as completed.",
      category: "task",
      isRead: false,
      createdAt: "2026-11-20T11:20:00Z",
    },
    {
      id: "notif-admin-04",
      userId: "admin",
      title: "Milestone Verified: In-Person Counseling Session",
      message: "Counselor Priya Varma verified and completed Stage 01 offline counseling session for Rahul Sharma.",
      category: "journey",
      isRead: false,
      createdAt: "2026-11-20T11:45:00Z",
    },
  ],
  activityLogs: [
    {
      id: "act-01",
      userId: "usr-admin-01",
      userName: "GVK Admissions Admin",
      role: "admin",
      action: "STUDENT_PROVISIONED",
      title: "Student Onboarded & Provisioned",
      description: "Admin provisioned Rahul Sharma (GVK-STU-2026-0042) for UK Fall 2026 intake.",
      affectedStudentId: "usr-student-01",
      entityType: "student_profile",
      newValue: { studentIdCode: "GVK-STU-2026-0042", email: "rahul.sharma@gmail.com" },
      createdAt: "2026-11-19T08:30:00Z",
    },
    {
      id: "act-02",
      userId: "usr-admin-01",
      userName: "GVK Admissions Admin",
      role: "admin",
      action: "COUNSELOR_ASSIGNED",
      title: "Senior Counselor Assigned",
      description: "Assigned senior counselor Priya Varma to Rahul Sharma.",
      affectedStudentId: "usr-student-01",
      entityType: "counselor_assignment",
      newValue: { counselorId: "usr-counselor-01", studentId: "usr-student-01" },
      createdAt: "2026-11-19T08:45:00Z",
    },
    {
      id: "act-03",
      userId: "usr-counselor-01",
      userName: "Priya Varma (Counselor)",
      role: "counselor",
      action: "JOURNEY_STAGE_INITIATED",
      title: "Stage 01 Counseling Session Scheduled",
      description: "Counselor scheduled Initial 1-on-1 Masters Counseling Session via Zoom.",
      affectedStudentId: "usr-student-01",
      entityType: "journey_stage",
      newValue: "in_progress",
      context: { stageNumber: 1, stageName: "Counseling Session" },
      createdAt: "2026-11-19T09:00:00Z",
    },
    {
      id: "act-04",
      userId: "usr-counselor-01",
      userName: "Priya Varma (Counselor)",
      role: "counselor",
      action: "TASK_CREATED",
      title: "Onboarding Deliverables Dispatched",
      description: "Counselor assigned onboarding deliverable: Initial 1-on-1 counseling session attendance.",
      affectedStudentId: "usr-student-01",
      entityType: "task",
      newValue: { count: 1 },
      createdAt: "2026-11-19T09:05:00Z",
    },
  ],
};

// Singleton storage in global scope to persist across server action calls during dev
declare global {
  var __GVK_STORE__: DbStore | undefined;
}

export function generateUniqueActivationCode(country = "United Kingdom", existingCodes: string[] = []): string {
  const countryCodeMap: Record<string, string> = {
    "United Kingdom": "UK",
    "United States": "US",
    "USA": "US",
    "Canada": "CA",
    "Australia": "AU",
    "Germany": "DE",
    "New Zealand": "NZ",
    "Ireland": "IE",
    "France": "FR",
    "Sweden": "SE",
    "Netherlands": "NL",
  };
  const cc = countryCodeMap[country] || "UK";
  let code = "";
  let isUnique = false;
  let attempts = 0;
  const upperExisting = existingCodes.map((c) => c?.toUpperCase()).filter(Boolean);
  while (!isUnique && attempts < 200) {
    attempts++;
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    code = `GVK-ACT-${randomDigits}-${cc}`;
    if (!upperExisting.includes(code.toUpperCase())) {
      isUnique = true;
    }
  }
  return code || `GVK-ACT-${Math.floor(100000 + Math.random() * 900000)}-${cc}`;
}

if (!global.__GVK_STORE__) {
  global.__GVK_STORE__ = initialStore;
}

const store = global.__GVK_STORE__;

// Pub/Sub and Cross-Tab / Cross-Window Synchronization
export type StoreSyncEvent = {
  type: string;
  payload?: any;
};

type StoreListener = (event: StoreSyncEvent) => void;
const storeListeners = new Set<StoreListener>();

let sharedBroadcastChannel: BroadcastChannel | null = null;
function getSharedBroadcastChannel(): BroadcastChannel | null {
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    if (!sharedBroadcastChannel) {
      try {
        sharedBroadcastChannel = new BroadcastChannel("GVK_MASTERS_CHANNEL");
        sharedBroadcastChannel.onmessage = (event) => {
          try {
            const saved = localStorage.getItem("GVK_MASTERS_STORE_V4");
            if (saved) {
              const parsed = JSON.parse(saved);
              if (parsed.messages && Array.isArray(parsed.messages)) {
                store.messages = parsed.messages;
              }
              if (parsed.adminCounselorMessages && Array.isArray(parsed.adminCounselorMessages)) {
                store.adminCounselorMessages = parsed.adminCounselorMessages;
              }
              if (parsed.notifications && Array.isArray(parsed.notifications)) {
                store.notifications = parsed.notifications;
              }
              Object.assign(store, parsed);
            }
            storeListeners.forEach((listener) => {
              try {
                listener(event.data);
              } catch (e) {}
            });
          } catch (e) {}
        };
      } catch (err) {}
    }
    return sharedBroadcastChannel;
  }
  return null;
}

export function broadcastStoreChange(type: string, payload?: any) {
  // 1. In-memory listeners
  storeListeners.forEach((listener) => {
    try {
      listener({ type, payload });
    } catch (err) {
      console.error("Store listener error:", err);
    }
  });

  // 2. Browser LocalStorage & BroadcastChannel
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("GVK_MASTERS_STORE_V4", JSON.stringify(store));
      window.dispatchEvent(new CustomEvent("gvk_store_change", { detail: { type, payload } }));
      const bc = getSharedBroadcastChannel();
      if (bc) {
        bc.postMessage({ type, payload });
      }
    } catch (e) {
      // Ignore storage errors in restricted contexts
    }
  }
}

/**
 * Dispatches mutations directly to MongoDB Atlas via /api/db/action
 */
export async function dispatchMongoAction(action: string, payload: any) {
  if (typeof window !== "undefined") {
    try {
      fetch("/api/db/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload }),
      }).catch((e) => console.warn(`[Mongo Action ${action} deferred]:`, e));
    } catch (e) {
      console.warn(`[Mongo Action ${action} error]:`, e);
    }
  }
}

// Client-side initialization & continuous synchronization with MongoDB Atlas
if (typeof window !== "undefined") {
  try {
    if (localStorage.getItem("GVK_STORE_RESET_KEY") !== "v22_global_multi_country_universities") {
      // Preserve genuine human-sent messages, but purge automated test strings
      const saved = localStorage.getItem("GVK_MASTERS_STORE_V4");
      let humanMsgs: any[] = [];
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed.messages)) {
            humanMsgs = parsed.messages.filter(
              (m: any) =>
                !m.content.includes("Stage 01 counseling call") &&
                !m.content.includes("Welcome to GVK Masters Overseas Education, Rahul!") &&
                !m.content.includes("Congratulations on receiving the conditional offer") &&
                !m.content.includes("shortlisted UK universities look solid") &&
                !m.content.includes("review my UK university shortlist") &&
                !m.content.includes("make sure your 28-day bank statement") &&
                !m.content.includes("financial documents are needed for my CAS") &&
                m.studentId === "usr-student-01"
            );
          }
        } catch (e) {}
      }
      localStorage.clear();
      localStorage.setItem("GVK_STORE_RESET_KEY", "v22_global_multi_country_universities");
      store.messages = humanMsgs.length > 0 ? humanMsgs : store.messages;
      store.tasks = store.tasks.filter((t) => !t.title.includes("Aspiration Questionnaire") && t.id !== "tsk-02");
      localStorage.setItem("GVK_MASTERS_STORE_V4", JSON.stringify(store));
    } else {
      const saved = localStorage.getItem("GVK_MASTERS_STORE_V4");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.tasks)) {
          parsed.tasks = parsed.tasks.filter(
            (t: any) => !t.title.includes("Aspiration Questionnaire") && t.id !== "tsk-02"
          );
        }
        if (Array.isArray(parsed.documents)) {
          parsed.documents = parsed.documents.filter(
            (d: any) => !(d.studentId === "usr-student-01" && d.fileName && d.fileName.includes("GRE_Official_Scorecard"))
          );
        }
        if (
          !parsed.universities ||
          !Array.isArray(parsed.universities) ||
          parsed.universities.length < ALL_GLOBAL_UNIVERSITIES.length ||
          !parsed.courses ||
          !Array.isArray(parsed.courses) ||
          parsed.courses.length < (store.courses?.length || 0)
        ) {
          parsed.universities = store.universities;
          parsed.courses = store.courses;
        }
        Object.assign(store, parsed);
      }
    }
  } catch (e) {}

  // Fetch and hydrate directly from MongoDB Atlas
  const syncWithMongo = async () => {
    try {
      const res = await fetch("/api/db/sync");
      const data = await res.json();
      if (data.success && data.store) {
        // Purge unwanted aspiration questionnaire task from sync
        if (data.store.tasks && Array.isArray(data.store.tasks)) {
          data.store.tasks = data.store.tasks.filter(
            (t: any) => !t.title.includes("Aspiration Questionnaire") && t.id !== "tsk-02"
          );
        }
        if (data.store.documents && Array.isArray(data.store.documents)) {
          data.store.documents = data.store.documents.filter(
            (d: any) => !(d.studentId === "usr-student-01" && d.fileName && d.fileName.includes("GRE_Official_Scorecard"))
          );
        }

        // CRDT UNION MERGE: Keep all local messages + add any new ones from Mongo
        if (data.store.messages && Array.isArray(data.store.messages)) {
          const existingMap = new Map((store.messages || []).map((m: any) => [m.id, m]));
          data.store.messages.forEach((mongoMsg: any) => {
            const existing = existingMap.get(mongoMsg.id);
            if (existing) {
              existingMap.set(mongoMsg.id, {
                ...mongoMsg,
                isRead: existing.isRead === true ? true : mongoMsg.isRead,
              });
            } else {
              existingMap.set(mongoMsg.id, mongoMsg);
            }
          });
          data.store.messages = Array.from(existingMap.values()).sort((a: any, b: any) =>
            a.createdAt.localeCompare(b.createdAt)
          );
        } else {
          data.store.messages = store.messages || [];
        }

        // CRDT UNION MERGE: Keep all local admin-counselor messages + add new ones from Mongo
        if (data.store.adminCounselorMessages && Array.isArray(data.store.adminCounselorMessages)) {
          const existingMap = new Map((store.adminCounselorMessages || []).map((m: any) => [m.id, m]));
          data.store.adminCounselorMessages.forEach((mongoMsg: any) => {
            const existing = existingMap.get(mongoMsg.id);
            if (existing) {
              existingMap.set(mongoMsg.id, {
                ...mongoMsg,
                isRead: existing.isRead === true ? true : mongoMsg.isRead,
              });
            } else {
              existingMap.set(mongoMsg.id, mongoMsg);
            }
          });
          data.store.adminCounselorMessages = Array.from(existingMap.values()).sort((a: any, b: any) =>
            a.createdAt.localeCompare(b.createdAt)
          );
        } else {
          data.store.adminCounselorMessages = store.adminCounselorMessages || [];
        }

        // CRDT UNION MERGE: Counselor Peer Messages
        if (data.store.counselorPeerMessages && Array.isArray(data.store.counselorPeerMessages)) {
          const existingMap = new Map((store.counselorPeerMessages || []).map((m: any) => [m.id, m]));
          data.store.counselorPeerMessages.forEach((mongoMsg: any) => {
            const existing = existingMap.get(mongoMsg.id);
            if (existing) {
              existingMap.set(mongoMsg.id, {
                ...mongoMsg,
                isRead: existing.isRead === true ? true : mongoMsg.isRead,
              });
            } else {
              existingMap.set(mongoMsg.id, mongoMsg);
            }
          });
          data.store.counselorPeerMessages = Array.from(existingMap.values()).sort((a: any, b: any) =>
            a.createdAt.localeCompare(b.createdAt)
          );
        } else {
          data.store.counselorPeerMessages = store.counselorPeerMessages || [];
        }

        // CRDT UNION MERGE: Notifications
        if (data.store.notifications && Array.isArray(data.store.notifications)) {
          const existingMap = new Map((store.notifications || []).map((n: any) => [n.id, n]));
          data.store.notifications.forEach((mongoNotif: any) => {
            const existing = existingMap.get(mongoNotif.id);
            if (existing) {
              existingMap.set(mongoNotif.id, {
                ...mongoNotif,
                isRead: existing.isRead === true ? true : mongoNotif.isRead,
              });
            } else {
              existingMap.set(mongoNotif.id, mongoNotif);
            }
          });
          data.store.notifications = Array.from(existingMap.values()).sort((a: any, b: any) =>
            b.createdAt.localeCompare(a.createdAt)
          );
        } else {
          data.store.notifications = store.notifications || [];
        }

        // Protect Global Universities catalog and courses from legacy/partial/duplicated Mongo payloads
        const rawMongoUnis = Array.isArray(data.store.universities) ? data.store.universities : [];
        const seenM = new Set<string>();
        const dedupedMongoUnis: any[] = [];
        for (const u of rawMongoUnis) {
          const key = u.name?.trim().toLowerCase();
          if (key && !seenM.has(key)) {
            seenM.add(key);
            dedupedMongoUnis.push(u);
          }
        }
        if (dedupedMongoUnis.length < ALL_GLOBAL_UNIVERSITIES.length) {
          data.store.universities = store.universities;
        } else {
          data.store.universities = dedupedMongoUnis;
        }
        if (!data.store.courses || !Array.isArray(data.store.courses) || data.store.courses.length < (store.courses?.length || 0)) {
          data.store.courses = store.courses;
        }

        Object.assign(store, data.store);
        localStorage.setItem("GVK_MASTERS_STORE_V4", JSON.stringify(store));
        storeListeners.forEach((listener) => {
          try {
            listener({ type: "MONGODB_SYNC", payload: data.store });
          } catch (e) {}
        });
      }
    } catch (err) {
      // Deferred offline
    }
  };

  // Initial sync immediately upon load
  syncWithMongo();

  // Sync continuously every 3 seconds to capture any updates across clients
  setInterval(syncWithMongo, 3000);

  // Sync when window/tab regains focus
  window.addEventListener("focus", syncWithMongo);

  // Initialize shared broadcast channel
  getSharedBroadcastChannel();

  window.addEventListener("storage", (e) => {
    if (e.key === "GVK_MASTERS_STORE_V4" && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (parsed.messages && Array.isArray(parsed.messages)) {
          store.messages = parsed.messages;
        }
        if (parsed.adminCounselorMessages && Array.isArray(parsed.adminCounselorMessages)) {
          store.adminCounselorMessages = parsed.adminCounselorMessages;
        }
        if (parsed.counselorPeerMessages && Array.isArray(parsed.counselorPeerMessages)) {
          store.counselorPeerMessages = parsed.counselorPeerMessages;
        }
        if (parsed.notifications && Array.isArray(parsed.notifications)) {
          store.notifications = parsed.notifications;
        }
        Object.assign(store, parsed);
        storeListeners.forEach((listener) => {
          try {
            listener({ type: "STORAGE_SYNC" });
          } catch (err) {}
        });
      } catch (err) {}
    }
  });
}

export const dataStore = {
  // Real-time synchronization subscription
  subscribe(listener: (event: StoreSyncEvent) => void): () => void {
    storeListeners.add(listener);
    return () => {
      storeListeners.delete(listener);
    };
  },

  // Resolve human-readable actor name & role for unified audit logs
  resolveUserName(userId: string): { name: string; role: UserRole } {
    const student = store.studentProfiles.find((s) => s.id === userId);
    if (student) {
      return { name: `${student.firstName} ${student.lastName} (Student)`, role: "student" };
    }
    const counselor = store.counselorProfiles.find((c) => c.id === userId);
    if (counselor) {
      return { name: `${counselor.firstName} ${counselor.lastName} (Counselor)`, role: "counselor" };
    }
    if (userId.includes("admin")) {
      return { name: "GVK Admissions Admin", role: "admin" };
    }
    return { name: userId, role: "counselor" };
  },

  // Authentication & Users
  authenticate(identifier: string, role?: UserRole): CurrentUser | null {
    const cleanId = identifier.trim().toLowerCase();

    // 1. Admin authentication
    if (
      role === "admin" ||
      cleanId === "gvk_masters_admin" ||
      cleanId === "admin@gvkedutech.com" ||
      cleanId === "admin"
    ) {
      const adminUser = store.users.find(
        (u) =>
          u.role === "admin" &&
          (u.email.toLowerCase() === cleanId ||
            cleanId === "gvk_masters_admin" ||
            cleanId === "admin@gvkedutech.com" ||
            cleanId.includes("admin"))
      );
      if (adminUser || cleanId.includes("admin") || cleanId === "gvk_masters_admin") {
        return {
          id: adminUser?.id || "usr-admin-01",
          email: adminUser?.email || "admin@gvkedutech.com",
          role: "admin",
          fullName: "GVK Super Admin",
          identifierCode: "GVK-ADMIN-01",
        };
      }
    }

    // 2. Student authentication (search ALL students by Student ID code or email)
    if (role === "student" || !role) {
      const student = store.studentProfiles.find(
        (s) =>
          s.studentIdCode.toLowerCase() === cleanId ||
          store.users.find((u) => u.id === s.id)?.email.toLowerCase() === cleanId ||
          cleanId.includes(s.firstName.toLowerCase())
      );
      if (student) {
        return {
          id: student.id,
          email: store.users.find((u) => u.id === student.id)?.email || "",
          role: "student",
          fullName: `${student.firstName} ${student.lastName}`,
          identifierCode: student.studentIdCode,
        };
      }
    }

    // 3. Counselor authentication (search ALL counselors by Employee ID code or email)
    if (role === "counselor" || !role) {
      const counselor = store.counselorProfiles.find(
        (c) => {
          const codeClean = c.employeeIdCode.toLowerCase();
          const codeNum = c.employeeIdCode.replace(/\D/g, "");
          const inputNum = cleanId.replace(/\D/g, "");

          const matchesCode =
            codeClean === cleanId ||
            cleanId === `gvk-emp-${codeNum}` ||
            cleanId === `gvk-emp-0${codeNum}` ||
            cleanId === `gvk-emp-00${codeNum}` ||
            (cleanId.startsWith("gvk-emp-") && parseInt(inputNum, 10) === parseInt(codeNum, 10)) ||
            (c.id === "usr-counselor-01" && (cleanId === "gvk-emp-014" || cleanId === "gvk-emp-14")) ||
            (c.id === "usr-counselor-1795090237245" && (cleanId === "gvk-emp-015" || cleanId === "gvk-emp-15"));

          const userEmail = store.users.find((u) => u.id === c.id)?.email.toLowerCase() || "";
          const matchesEmail = userEmail === cleanId;

          const matchesSpecial =
            cleanId === "counselor1@gmail.com" ||
            cleanId === "counselor.priya@gvkedutech.com" ||
            cleanId === "shivdesignerr@gmail.com" ||
            cleanId.includes("shiva") ||
            cleanId.includes(c.firstName.toLowerCase());

          return matchesCode || matchesEmail || matchesSpecial;
        }
      );
      if (counselor) {
        return {
          id: counselor.id,
          email: cleanId.includes("shiva") ? "shivdesignerr@gmail.com" : (store.users.find((u) => u.id === counselor.id)?.email || ""),
          role: "counselor",
          fullName: `${counselor.firstName} ${counselor.lastName}`,
          identifierCode: counselor.employeeIdCode,
        };
      }
    }

    return null;
  },

  // Auto-generate sequential employee ID code starting from 1 (e.g. GVK-EMP-001, GVK-EMP-002, GVK-EMP-003...)
  getNextCounselorEmployeeCode(): string {
    const codes = store.counselorProfiles
      .map((c) => {
        const match = c.employeeIdCode.match(/(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n) && n > 0);

    const maxCode = codes.length > 0 ? Math.max(...codes) : 0;
    const nextNum = maxCode + 1;
    return `GVK-EMP-${String(nextNum).padStart(3, "0")}`;
  },

  // Multi-Counselor Addition (Admin Action)
  createCounselor(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    employeeIdCode?: string;
    specializationCountries?: string[];
    password?: string;
  }) {
    const id = `usr-counselor-${Date.now()}`;
    const code = data.employeeIdCode?.trim() || this.getNextCounselorEmployeeCode();

    const userObj = {
      id,
      email: data.email.trim().toLowerCase(),
      role: "counselor" as UserRole,
      status: "active" as const,
      passwordHash: data.password || "GvkCounselor@2026",
    };

    const profileObj = {
      id,
      employeeIdCode: code,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      phone: data.phone.trim(),
      specializationCountries: data.specializationCountries || ["United Kingdom", "Ireland", "Australia"],
      isActive: true,
      defaultZoomMeetingUrl: "https://zoom.us/start/videomeeting",
      defaultZoomMeetingId: "984 9012 3456",
      defaultZoomPasscode: "GVK2026",
    };

    store.users.push(userObj);
    store.counselorProfiles.push(profileObj);

    this.logActivity({
      userId: "usr-admin-01",
      role: "admin",
      action: "COUNSELOR_ADDED",
      title: `Counselor Added: ${profileObj.firstName} ${profileObj.lastName}`,
      description: `Admin added admissions counselor account ${code} (${userObj.email}).`,
      entityType: "counselor_profile",
      entityId: id,
      newValue: { employeeIdCode: code, email: userObj.email },
    });

    dispatchMongoAction("create_counselor", {
      counselorUser: userObj,
      counselorProfile: profileObj,
    });

    broadcastStoreChange("COUNSELOR_CREATED", { counselor: profileObj });
    return profileObj;
  },

  // Generate Unique Automated Activation Code
  generateActivationCode(country = "United Kingdom") {
    const existingCodes: string[] = [
      ...store.studentProfiles.map((s: any) => s.activationCode).filter(Boolean),
      ...store.users.map((u: any) => u.activationCode).filter(Boolean),
    ];
    return generateUniqueActivationCode(country, existingCodes);
  },

  // Multi-Student Provisioning (Admin Action)
  createStudent(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    studentIdCode?: string;
    preferredCountry?: string;
    targetDegree?: string;
    targetIntake?: string;
    ugCollege?: string;
    ugCgpa?: number;
    assignedCounselorId?: string;
    password?: string;
    activationCode?: string;
  }) {
    const id = `usr-student-${Date.now()}`;
    const code = data.studentIdCode?.trim() || `GVK-STU-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const country = data.preferredCountry || "United Kingdom";
    const existingCodes: string[] = [
      ...store.studentProfiles.map((s: any) => s.activationCode).filter(Boolean),
      ...store.users.map((u: any) => u.activationCode).filter(Boolean),
    ];
    const uniqueActivationCode =
      data.activationCode?.trim() || generateUniqueActivationCode(country, existingCodes);

    const userObj = {
      id,
      email: data.email.trim().toLowerCase(),
      role: "student" as UserRole,
      status: "pending_activation" as UserStatus,
      passwordHash: data.password || "GvkStudent@2026",
      activationCode: uniqueActivationCode,
      isActivated: false,
    };

    const profileObj = {
      id,
      studentIdCode: code,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      phone: data.phone.trim(),
      preferredCountry: country,
      targetIntake: data.targetIntake || "September Intake",
      targetDegree: data.targetDegree || "",
      ugCollege: data.ugCollege || "",
      ugCgpa: data.ugCgpa ?? 0,
      ugBacklogs: 0,
      englishTestType: "IELTS",
      englishScore: 7.0,
      activationCode: uniqueActivationCode,
      isActivated: false,
    };

    store.users.push(userObj);
    store.studentProfiles.push(profileObj);

    // Initialize 25-Stage sequential roadmap
    const hasCounselor = !!data.assignedCounselorId && data.assignedCounselorId.trim() !== "";
    const stagesDef = [
      { num: 1, name: "Counseling Session", desc: "Initial counseling and study abroad destination roadmap", resp: "counselor" as const },
      { num: 2, name: "Profile Evaluation", desc: "Academic and English proficiency evaluation", resp: "counselor" as const },
      { num: 3, name: "Document Collection", desc: "Gathering transcripts, certificates, passport & recommendation letters", resp: "student" as const },
      { num: 4, name: "University Shortlisting", desc: "Curating dream, target, and safe university options", resp: "counselor" as const },
      { num: 5, name: "Application Submission", desc: "Official portal submissions with references", resp: "counselor" as const },
      { num: 6, name: "Conditional Offer", desc: "Receipt and review of conditional admission offers", resp: "university" as const },
      { num: 7, name: "Mock Admissions Interview", desc: "Internal readiness interview conducted by GVK counseling desk", resp: "counselor" as const },
      { num: 8, name: "University Admissions Interview", desc: "Official interview conducted by University Admissions Committee", resp: "university" as const },
      { num: 9, name: "University Deposit Payment", desc: "Tuition deposit payment to secure admission seat", resp: "student" as const },
      { num: 10, name: "TB Test", desc: "UKVI approved clinic Tuberculosis screening test", resp: "student" as const },
      { num: 11, name: "Unconditional Offer", desc: "Conversion of conditional offer upon clearing requirements", resp: "university" as const },
      { num: 12, name: "CAS Request & Issuance", desc: "Confirmation of Acceptance for Studies generation", resp: "counselor" as const },
      { num: 13, name: "Visa Application", desc: "Online Tier 4 student visa submission", resp: "counselor" as const },
      { num: 14, name: "IHS Payment", desc: "Immigration Health Surcharge fee payment", resp: "student" as const },
      { num: 15, name: "Visa Approval", desc: "VFS appointment and biometric passport stamp", resp: "external" as const },
      { num: 16, name: "E-Visa Registration", desc: "UKVI digital status account creation", resp: "student" as const },
      { num: 17, name: "Flight Tickets", desc: "Booking international flight tickets", resp: "student" as const },
      { num: 18, name: "Pre-Departure Briefing", desc: "GVK Hyderabad pre-departure orientation briefing", resp: "counselor" as const },
      { num: 19, name: "Hyderabad Airport Drop", desc: "GVK coordinated RGIA Hyderabad airport send-off", resp: "counselor" as const },
      { num: 20, name: "London Heathrow Pick-up", desc: "GVK airport pickup and transfer in the UK", resp: "external" as const },
      { num: 21, name: "Accommodation Check-in", desc: "University hall or private student accommodation move-in", resp: "student" as const },
      { num: 22, name: "College Enrollment", desc: "Campus registration, student ID card and BRP collection", resp: "student" as const },
      { num: 23, name: "GP Registration", desc: "Registration with local General Practice (GP) surgery for National Health Service (NHS) access", resp: "student" as const },
      { num: 24, name: "NI Registration", desc: "National Insurance (NI) number application with the UK Department for Work and Pensions (DWP)", resp: "student" as const },
      { num: 25, name: "Part Time Job Support", desc: "GVK post-landing career desk assistance for CV formatting, 20-hour work rights compliance & part-time job placement", resp: "counselor" as const },
    ];

    const studentJourney = stagesDef.map((stg) => ({
      id: `j-${id}-${stg.num}`,
      studentId: id,
      stageNumber: stg.num,
      stageName: stg.name,
      description: stg.desc,
      status: (stg.num === 1 && hasCounselor ? "in_progress" : "not_started") as JourneyStageStatus,
      isMandatory: ![17, 19, 20, 25].includes(stg.num),
      responsibleParty: stg.resp,
      startDate: stg.num === 1 && hasCounselor ? new Date().toISOString().split("T")[0] : undefined,
      counselorRemarks: stg.num === 1 && hasCounselor ? "Initial 1-on-1 counseling session scheduled." : undefined,
      updatedAt: new Date().toISOString(),
    }));

    store.journeyRecords.push(...studentJourney);

    let assignmentObj: any = null;
    const tasksCreated: any[] = [];
    let notifObj: any = null;

    if (hasCounselor) {
      assignmentObj = {
        counselorId: data.assignedCounselorId!,
        studentId: id,
        isActive: true,
      };
      store.counselorAssignments.push(assignmentObj);

      const counselor = store.counselorProfiles.find((c) => c.id === data.assignedCounselorId);
      const counselorName = counselor ? `${counselor.firstName} ${counselor.lastName}` : "Assigned Counselor";

      const tsk1 = {
        id: `tsk-${id}-1`,
        studentId: id,
        title: `In-Person Masters Counseling Session with ${profileObj.firstName} ${profileObj.lastName}`,
        description: `Conduct offline in-person counseling session at GVK Overseas Education Center with candidate to evaluate academic profile, discuss destination options, and review roadmap.`,
        assignedByUserId: data.assignedCounselorId!,
        assignedByName: counselorName,
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
        priority: "urgent" as const,
        status: "pending" as const,
        isCounselorInternal: true,
        completionType: "counselor_signoff" as const,
        relatedStageNumber: 1,
        createdAt: new Date().toISOString(),
      };

      store.tasks.push(tsk1);
      tasksCreated.push(tsk1);

      notifObj = {
        id: `notif-${id}-1`,
        userId: id,
        title: "Welcome to GVK Masters!",
        message: `Your overseas admissions journey has begun. Assigned senior counselor: ${counselorName}.`,
        category: "journey",
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      store.notifications.push(notifObj);
    }

    this.logActivity({
      userId: "usr-admin-01",
      role: "admin",
      action: "STUDENT_PROVISIONED",
      title: `Student Enrolled: ${profileObj.firstName} ${profileObj.lastName}`,
      description: `Admin enrolled student ${code} (${userObj.email}) targeting ${profileObj.targetDegree}.`,
      affectedStudentId: id,
      entityType: "student_profile",
      entityId: id,
      newValue: { studentIdCode: code, email: userObj.email },
    });

    dispatchMongoAction("create_student", {
      studentUser: userObj,
      studentProfile: profileObj,
      journeyRecords: studentJourney,
      assignment: assignmentObj,
      tasks: tasksCreated,
      notification: notifObj,
    });

    broadcastStoreChange("STUDENT_CREATED", { student: profileObj });
    return {
      ...profileObj,
      activationCode: uniqueActivationCode,
    };
  },

  // First-Time Student Account Activation
  activateStudentAccount(activationCode: string, newPassword: string) {
    const cleanCode = (activationCode || "").trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, error: "Please enter your activation invitation code." };
    }
    if (!newPassword || newPassword.length < 8) {
      return { success: false, error: "Password must contain at least 8 characters." };
    }

    const studentProfile = store.studentProfiles.find(
      (s: any) => s.activationCode && s.activationCode.toUpperCase() === cleanCode
    );
    const user = studentProfile
      ? store.users.find((u) => u.id === studentProfile.id)
      : store.users.find((u: any) => u.activationCode && u.activationCode.toUpperCase() === cleanCode);

    if (!user && !studentProfile) {
      return {
        success: false,
        error: "Invalid activation invitation code. Please verify the code provided by GVK Admin.",
      };
    }

    // Update user credentials & status
    if (user) {
      user.status = "active";
      user.passwordHash = newPassword;
      (user as any).isActivated = true;
    }
    if (studentProfile) {
      (studentProfile as any).isActivated = true;
    }

    const studentName = studentProfile ? `${studentProfile.firstName} ${studentProfile.lastName}` : "Student";
    const studentCode = studentProfile?.studentIdCode || "";

    // 1. Log Activity
    this.logActivity({
      userId: user?.id || studentProfile?.id || "student-activation",
      userName: studentName,
      role: "student",
      action: "STUDENT_ACTIVATED",
      title: "Student Account Activated",
      description: `${studentName} (${studentCode}) completed first-time account activation and configured personal password.`,
      entityType: "student_profile",
      entityId: user?.id || studentProfile?.id || "",
    });

    // 2. Notify Admin
    store.notifications.push({
      id: `notif-${Date.now()}-adm`,
      userId: "admin",
      title: `Candidate Activated: ${studentName}`,
      message: `${studentName} (${studentCode}) successfully verified unique activation code and activated account.`,
      category: "system",
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    // 3. Notify Assigned Counselor if exists
    const counselor = studentProfile ? this.getAssignedCounselor(studentProfile.id) : null;
    if (counselor) {
      store.notifications.push({
        id: `notif-${Date.now()}-coun`,
        userId: counselor.id,
        title: `Candidate Activated: ${studentName}`,
        message: `${studentName} (${studentCode}) has activated their student portal.`,
        category: "system",
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    dispatchMongoAction("activate_student", {
      activationCode: cleanCode,
      newPassword,
    });

    broadcastStoreChange("ACTIVATE_STUDENT", {
      studentId: user?.id || studentProfile?.id,
      activationCode: cleanCode,
      status: "active",
    });

    return {
      success: true,
      student: studentProfile,
      email: user?.email,
      studentIdCode: studentCode,
    };
  },

  // Assign Student to Counselor (Admin Action)
  assignCounselor(studentId: string, counselorId: string) {
    // 1. Deactivate prior active assignments
    store.counselorAssignments.forEach((a) => {
      if (a.studentId === studentId) a.isActive = false;
    });

    // 2. Add new active assignment
    store.counselorAssignments.push({
      counselorId,
      studentId,
      isActive: true,
    });

    // 3. Activate Stage 1 if not yet started
    const journey = this.getStudentJourney(studentId);
    const stage1 = journey.find((j) => j.stageNumber === 1);
    if (stage1 && stage1.status === "not_started") {
      stage1.status = "in_progress";
      stage1.startDate = new Date().toISOString().split("T")[0];
      stage1.counselorRemarks = "Initial 1-on-1 counseling session scheduled.";
      stage1.updatedAt = new Date().toISOString();
    }

    // 4. Create onboarding tasks if none exist
    const existingTasks = store.tasks.filter((t) => t.studentId === studentId);
    const tasksCreated: any[] = [];
    if (existingTasks.length === 0) {
      const counselor = store.counselorProfiles.find((c) => c.id === counselorId);
      const counselorName = counselor ? `${counselor.firstName} ${counselor.lastName}` : "Assigned Counselor";

      const student = store.studentProfiles.find((s) => s.id === studentId);
      const studentFullName = student ? `${student.firstName} ${student.lastName}` : "Candidate";

      const tsk1 = {
        id: `tsk-${studentId}-1`,
        studentId,
        title: `In-Person Masters Counseling Session with ${studentFullName}`,
        description: `Conduct offline in-person counseling session at GVK Overseas Education Center with candidate to evaluate academic profile, discuss destination options, and review roadmap.`,
        assignedByUserId: counselorId,
        assignedByName: counselorName,
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
        priority: "urgent" as const,
        status: "pending" as const,
        isCounselorInternal: true,
        completionType: "counselor_signoff" as const,
        relatedStageNumber: 1,
        createdAt: new Date().toISOString(),
      };

      store.tasks.push(tsk1);
      tasksCreated.push(tsk1);
    }

    this.logActivity({
      userId: "usr-admin-01",
      role: "admin",
      action: "COUNSELOR_ASSIGNED",
      title: "Counselor Allocation Updated",
      description: `Admin assigned candidate ${studentId} to counselor ${counselorId}.`,
      affectedStudentId: studentId,
      entityType: "counselor_assignment",
      newValue: { counselorId, studentId },
    });

    dispatchMongoAction("assign_counselor", {
      studentId,
      counselorId,
      tasks: tasksCreated,
    });

    broadcastStoreChange("COUNSELOR_ASSIGNED", { studentId, counselorId });
    return { success: true };
  },

  getStudentProfile(studentId: string) {
    return store.studentProfiles.find((s) => s.id === studentId) || null;
  },

  getAllUsers() {
    return store.users;
  },

  getUserById(id: string) {
    return store.users.find((u) => u.id === id) || null;
  },

  getUserEmail(id: string) {
    return store.users.find((u) => u.id === id)?.email || "";
  },

  getUserPassword(id: string): string {
    const u = store.users.find((user) => user.id === id);
    if (u?.passwordHash) return u.passwordHash;
    if (u?.role === "counselor") return "Counselor@123";
    if (u?.role === "student") return "Student@123";
    return "Password@123";
  },

  getUserCredentials(id: string) {
    const u = store.users.find((user) => user.id === id);
    return {
      email: u?.email || this.getUserEmail(id),
      password: this.getUserPassword(id),
      role: u?.role || "student",
      status: u?.status || "active",
      activationCode: u?.activationCode,
    };
  },

  // --- Password Reset & OTP Management ---
  requestPasswordResetOtp(
    emailOrId: string,
    preferredRole?: "student" | "counselor" | "admin"
  ): {
    success: boolean;
    error?: string;
    email?: string;
    otp?: string;
    role?: "student" | "counselor" | "admin";
    userId?: string;
    userName?: string;
    identifierCode?: string;
  } {
    const clean = emailOrId.trim().toLowerCase();
    if (!clean) {
      return { success: false, error: "Please enter your registered email address or ID code." };
    }

    // 1. Try direct match in store.users by email
    let user = store.users.find((u) => u.email.toLowerCase() === clean);

    // 2. Try match in studentProfiles by studentIdCode or id
    if (!user) {
      const student = store.studentProfiles.find(
        (s) =>
          s.studentIdCode.toLowerCase() === clean ||
          s.id.toLowerCase() === clean
      );
      if (student) {
        user = store.users.find((u) => u.id === student.id);
      }
    }

    // 3. Try match in counselorProfiles by employeeIdCode or id
    if (!user) {
      const counselor = store.counselorProfiles.find(
        (c) =>
          c.employeeIdCode.toLowerCase() === clean ||
          c.id.toLowerCase() === clean
      );
      if (counselor) {
        user = store.users.find((u) => u.id === counselor.id);
      }
    }

    // 4. Fallback search across names if exact email wasn't found
    if (!user) {
      const studentByName = store.studentProfiles.find(
        (s) => `${s.firstName} ${s.lastName}`.toLowerCase() === clean
      );
      if (studentByName) {
        user = store.users.find((u) => u.id === studentByName.id);
      }
    }

    if (!user) {
      return {
        success: false,
        error: "No account found matching this email address or ID code. Please verify your credentials or contact GVK Administration.",
      };
    }

    // Role check if preferredRole is provided
    if (preferredRole && user.role !== preferredRole && user.role !== "admin") {
      return {
        success: false,
        error: `This account is registered as a ${user.role}, not a ${preferredRole}. Please switch to the ${user.role} tab above.`,
      };
    }

    // Generate clean 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity

    (this as any)._activeOtps = (this as any)._activeOtps || new Map<string, any>();
    (this as any)._activeOtps.set(user.email.toLowerCase(), {
      email: user.email.toLowerCase(),
      otp,
      userId: user.id,
      role: user.role,
      expiresAt,
    });

    let userName = user.email;
    let identifierCode = "";
    if (user.role === "student") {
      const s = store.studentProfiles.find((sp) => sp.id === user.id);
      if (s) {
        userName = `${s.firstName} ${s.lastName}`;
        identifierCode = s.studentIdCode;
      }
    } else if (user.role === "counselor") {
      const c = store.counselorProfiles.find((cp) => cp.id === user.id);
      if (c) {
        userName = `${c.firstName} ${c.lastName}`;
        identifierCode = c.employeeIdCode;
      }
    }

    // Push notification to internal system
    store.notifications.push({
      id: `notif-${Date.now()}-otp`,
      userId: user.id,
      title: "GVK Security: Password Reset OTP",
      message: `Your verification code is ${otp}. Valid for 15 minutes.`,
      category: "system",
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    this.logActivity({
      userId: user.id,
      role: user.role,
      action: "OTP_DISPATCHED",
      title: "Password Reset OTP Issued",
      description: `Security OTP verification code dispatched to ${user.email}.`,
      entityType: "user",
      entityId: user.id,
    });

    console.log(`\n======================================================`);
    console.log(`[GVK SECURITY] 🔐 REAL-TIME EMAIL OTP DISPATCH`);
    console.log(`[Recipient] : ${user.email} (${user.role.toUpperCase()})`);
    console.log(`[One-Time Password (OTP)] : ${otp}`);
    console.log(`[Valid For] : 15 Minutes`);
    console.log(`======================================================\n`);

    broadcastStoreChange("OTP_GENERATED", { email: user.email });

    return {
      success: true,
      email: user.email,
      otp,
      role: user.role,
      userId: user.id,
      userName,
      identifierCode,
    };
  },

  verifyPasswordResetOtp(
    email: string,
    otp: string
  ): {
    success: boolean;
    error?: string;
    userId?: string;
    role?: "student" | "counselor" | "admin";
    email?: string;
    userName?: string;
    identifierCode?: string;
  } {
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    const activeMap: Map<string, any> = (this as any)._activeOtps;
    const record = activeMap?.get(cleanEmail);

    if (!record) {
      return {
        success: false,
        error: "No active verification code found for this email. Please request a new OTP.",
      };
    }

    if (Date.now() > record.expiresAt) {
      activeMap.delete(cleanEmail);
      return {
        success: false,
        error: "This verification code has expired. Please request a new OTP.",
      };
    }

    if (record.otp !== cleanOtp) {
      return {
        success: false,
        error: "Incorrect verification code. Please check your email inbox and try again.",
      };
    }

    const user = store.users.find((u) => u.id === record.userId);
    let userName = cleanEmail;
    let identifierCode = "";
    if (user?.role === "student") {
      const s = store.studentProfiles.find((sp) => sp.id === user.id);
      if (s) {
        userName = `${s.firstName} ${s.lastName}`;
        identifierCode = s.studentIdCode;
      }
    } else if (user?.role === "counselor") {
      const c = store.counselorProfiles.find((cp) => cp.id === user.id);
      if (c) {
        userName = `${c.firstName} ${c.lastName}`;
        identifierCode = c.employeeIdCode;
      }
    }

    return {
      success: true,
      userId: record.userId,
      role: record.role,
      email: cleanEmail,
      userName,
      identifierCode,
    };
  },

  resetPassword(userId: string, newPassword: string): boolean {
    const user = store.users.find((u) => u.id === userId);
    if (!user) return false;

    user.passwordHash = newPassword.trim();

    this.logActivity({
      userId: user.id,
      role: user.role,
      action: "PASSWORD_RESET_SUCCESS",
      title: "Password Successfully Changed",
      description: `${user.role.toUpperCase()} password was updated following OTP verification.`,
      entityType: "user",
      entityId: user.id,
    });

    dispatchMongoAction("update_user_password", { userId, passwordHash: user.passwordHash });
    broadcastStoreChange("PASSWORD_RESET", { userId });
    return true;
  },

  getAllStudents() {
    return store.studentProfiles.map((s) => {
      const email = this.getUserEmail(s.id);
      const user = store.users.find((u) => u.id === s.id);
      return {
        ...s,
        name: `${s.firstName} ${s.lastName}`.trim(),
        studentId: s.studentIdCode,
        targetCountry: s.preferredCountry,
        email,
        password: this.getUserPassword(s.id),
        activationCode: (s as any).activationCode || (user as any)?.activationCode || "",
        isActivated: (s as any).isActivated ?? (user?.status === "active"),
        status: user?.status || "pending_activation",
        createdAt: (s as any).createdAt || "2026-11-01T00:00:00Z",
      };
    });
  },

  getCounselorProfile(counselorId: string) {
    const c = store.counselorProfiles.find((coun) => coun.id === counselorId) || null;
    if (!c) return null;
    return {
      ...c,
      name: `${c.firstName} ${c.lastName}`.trim(),
      employeeId: c.employeeIdCode,
      email: this.getUserEmail(c.id),
      password: this.getUserPassword(c.id),
      specialization: c.specializationCountries?.join(", ") || "United Kingdom Russell Group",
      officeHours: (c as any).officeHours || "Mon - Sat (10:00 AM - 6:30 PM IST)",
      createdAt: (c as any).createdAt || "2026-11-01T00:00:00Z",
    };
  },

  getAllCounselors() {
    return store.counselorProfiles.map((c) => {
      const email = this.getUserEmail(c.id);
      return {
        ...c,
        name: `${c.firstName} ${c.lastName}`.trim(),
        employeeId: c.employeeIdCode,
        email,
        password: this.getUserPassword(c.id),
        specialization: c.specializationCountries?.join(", ") || "United Kingdom Russell Group",
        officeHours: (c as any).officeHours || "Mon - Sat (10:00 AM - 6:30 PM IST)",
        createdAt: (c as any).createdAt || "2026-11-01T00:00:00Z",
      };
    });
  },

  getAssignedCounselor(studentId: string) {
    const assignment = store.counselorAssignments.find(
      (a) => a.studentId === studentId && a.isActive
    );
    if (!assignment) return null;
    const c = store.counselorProfiles.find((coun) => coun.id === assignment.counselorId);
    if (!c) return null;
    return {
      ...c,
      name: `${c.firstName} ${c.lastName}`.trim(),
      employeeId: c.employeeIdCode,
      email: this.getUserEmail(c.id),
      specialization: c.specializationCountries?.join(", ") || "United Kingdom Russell Group",
      officeHours: (c as any).officeHours || "Mon - Sat (10:00 AM - 6:30 PM IST)",
      createdAt: (c as any).createdAt || "2026-11-01T00:00:00Z",
    };
  },

  getAssignedStudents(counselorId?: string) {
    // Collaborative Desk: All counselors have access to view and collaborate on all enrolled candidate profiles
    return store.studentProfiles || [];
  },

  getPrimaryAssignedStudents(counselorId: string) {
    const studentIds = store.counselorAssignments
      .filter((a) => a.counselorId === counselorId && a.isActive)
      .map((a) => a.studentId);
    return (store.studentProfiles || []).filter((s) => studentIds.includes(s.id));
  },

  // ----------------------------------------------------
  // Administrative Operations Suite
  // ----------------------------------------------------
  getAllUniversities() {
    const rawList = store.universities || [];
    const seen = new Set<string>();
    const uniqueUnis: any[] = [];
    for (const u of rawList) {
      const key = u.name?.trim().toLowerCase();
      if (key && !seen.has(key)) {
        seen.add(key);
        uniqueUnis.push(u);
      }
    }

    if (uniqueUnis.length < ALL_GLOBAL_UNIVERSITIES.length) {
      store.universities = ALL_GLOBAL_UNIVERSITIES.map((u, i) => ({
        id: u.id || `univ-${String(i + 1).padStart(2, "0")}`,
        catalogNo: u.catalogNo || (i + 1),
        name: u.name,
        country: u.country,
        city: u.city,
        campus: "Main Campus",
        ranking: u.ranking,
        qsRankDisplay: u.qsRankDisplay || `#${u.ranking}`,
        theRankDisplay: u.theRankDisplay || "Top Global",
        typeGroup: u.typeGroup || (u.russellGroup ? "Public (Russell Group)" : "Public"),
        estimatedTuition: u.estimatedTuition || u.tuitionRange1Year,
        tuitionFee: u.tuitionFee || u.tuition1Year || 25000,
        mainIntakes: u.mainIntakes || "Sep, Jan",
        typicalIelts: u.typicalIelts || u.minIelts,
        keyStrengths: u.keyStrengths || u.course,
        tier: u.tier,
        russellGroup: u.russellGroup,
        websiteUrl: u.websiteUrl,
        minCgpa: u.minCgpa || "60%",
        minIelts: u.minIelts || "6.5",
        intakeDeadlines: u.mainIntakes ? `Intakes: ${u.mainIntakes}` : "Sep, Jan: Rolling",
      }));
    } else {
      store.universities = uniqueUnis;
    }
    return store.universities;
  },

  addUniversity(data: {
    name: string;
    country: string;
    city: string;
    campus?: string;
    ranking?: number;
    qsRankDisplay?: string;
    theRankDisplay?: string;
    typeGroup?: string;
    russellGroup?: boolean;
    estimatedTuition?: string;
    tuitionFee?: number;
    typicalIelts?: string;
    minCgpa?: string;
    minIelts?: string;
    mainIntakes?: string;
    keyStrengths?: string;
    websiteUrl?: string;
    intakeDeadlines?: string;
  }) {
    const id = `univ-${Date.now()}`;
    const newUni = {
      id,
      name: data.name.trim(),
      country: data.country.trim(),
      city: data.city.trim(),
      campus: data.campus?.trim() || "Main Campus",
      ranking: Number(data.ranking) || 100,
      qsRankDisplay: data.qsRankDisplay?.trim() || `#${data.ranking || 100}`,
      theRankDisplay: data.theRankDisplay?.trim() || "Top Global",
      typeGroup: data.typeGroup?.trim() || "Public",
      russellGroup: data.russellGroup || false,
      estimatedTuition: data.estimatedTuition?.trim() || "Standard Tuition",
      tuitionFee: Number(data.tuitionFee) || 20000,
      typicalIelts: data.typicalIelts?.trim() || data.minIelts || "6.5",
      minCgpa: data.minCgpa || "60%",
      minIelts: data.minIelts || "6.5",
      mainIntakes: data.mainIntakes?.trim() || "Sep, Jan",
      keyStrengths: data.keyStrengths?.trim() || "Computer Science, Engineering",
      websiteUrl: data.websiteUrl?.trim() || "https://gvkedutech.com",
      intakeDeadlines: data.intakeDeadlines || "Fall 2026: June 30, 2026",
    };
    store.universities.push(newUni);
    this.logActivity({
      userId: "usr-admin-01",
      role: "admin",
      action: "UNIVERSITY_CREATED",
      title: `University Added: ${newUni.name}`,
      description: `Admin added ${newUni.name} (${newUni.country}) to the institutional catalog.`,
      entityType: "university",
      entityId: id,
    });
    broadcastStoreChange("UNIVERSITY_CREATED", { university: newUni });
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("GVK_MASTERS_STORE_V4", JSON.stringify(store));
      } catch (e) {}
    }
    return newUni;
  },

  updateUniversity(id: string, updates: Partial<DbStore["universities"][0]>) {
    const uni = store.universities.find((u) => u.id === id);
    if (!uni) return null;
    Object.assign(uni, updates);

    // Synchronize course fee if numerical tuition updated
    if (updates.tuitionFee && store.courses) {
      store.courses.forEach((c) => {
        if (c.universityId === id || c.universityName?.toLowerCase() === uni.name?.toLowerCase()) {
          c.tuitionFee = updates.tuitionFee!;
        }
      });
    }

    this.logActivity({
      userId: "usr-admin-01",
      role: "admin",
      action: "UNIVERSITY_UPDATED",
      title: `University Updated: ${uni.name}`,
      description: `Admin updated institutional parameters, tuition fee, ranking and benchmarks for ${uni.name}.`,
      entityType: "university",
      entityId: id,
    });
    broadcastStoreChange("UNIVERSITY_UPDATED", { university: uni });

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("GVK_MASTERS_STORE_V4", JSON.stringify(store));
      } catch (e) {}
    }
    return uni;
  },

  getAllCourses() {
    return store.courses || [];
  },

  addCourse(data: {
    universityName: string;
    courseName: string;
    degreeLevel?: string;
    discipline?: string;
    intake?: string;
    durationYears?: 1 | 2;
    tuitionFee: number;
    tuitionFeeCurrency?: string;
    placementAvailable?: boolean;
    placementStructure?: string;
    minIeltsScore?: number;
    minCgpa?: number;
    scholarshipAvailable?: boolean;
    scholarshipDetails?: string;
  }) {
    const id = `course-${Date.now()}`;
    const matchedUni = store.universities.find(
      (u) => u.name.toLowerCase() === data.universityName.toLowerCase()
    );
    const newCourse = {
      id,
      universityId: matchedUni?.id || "univ-01",
      universityName: data.universityName.trim(),
      courseName: data.courseName.trim(),
      degreeLevel: data.degreeLevel || "Postgraduate (MSc)",
      discipline: data.discipline || "Computer Science & IT",
      intake: data.intake || "Fall 2026",
      durationYears: (data.durationYears === 2 ? 2 : 1) as 1 | 2,
      tuitionFee: Number(data.tuitionFee) || 28000,
      tuitionFeeCurrency: data.tuitionFeeCurrency || "GBP",
      placementAvailable: !!data.placementAvailable,
      placementStructure:
        data.placementStructure ||
        (data.placementAvailable ? "1-Year Industrial Placement Track" : undefined),
      minIeltsScore: Number(data.minIeltsScore) || 6.5,
      minCgpa: Number(data.minCgpa) || 6.5,
      scholarshipAvailable: !!data.scholarshipAvailable,
      scholarshipDetails:
        data.scholarshipDetails ||
        (data.scholarshipAvailable
          ? "GVK Merit Scholarship Available: Up to £4,000 fee waiver"
          : undefined),
    };
    if (!store.courses) store.courses = [];
    store.courses.push(newCourse);
    this.logActivity({
      userId: "usr-admin-01",
      role: "admin",
      action: "COURSE_CREATED",
      title: `Course Added: ${newCourse.courseName}`,
      description: `Admin added ${newCourse.courseName} at ${newCourse.universityName}.`,
      entityType: "course",
      entityId: id,
    });
    broadcastStoreChange("COURSE_CREATED", { course: newCourse });
    return newCourse;
  },

  updateCourse(id: string, updates: Partial<NonNullable<DbStore["courses"]>[0]>) {
    if (!store.courses) return null;
    const course = store.courses.find((c) => c.id === id);
    if (!course) return null;
    Object.assign(course, updates);
    this.logActivity({
      userId: "usr-admin-01",
      role: "admin",
      action: "COURSE_UPDATED",
      title: `Course Updated: ${course.courseName}`,
      description: `Admin updated course details for ${course.courseName} at ${course.universityName}.`,
      entityType: "course",
      entityId: id,
    });
    broadcastStoreChange("COURSE_UPDATED", { course });
    return course;
  },

  updateStudentProfile(
    studentId: string,
    updates: Partial<DbStore["studentProfiles"][0]> & {
      email?: string;
      password?: string;
      status?: "active" | "suspended" | "pending_activation";
    }
  ) {
    const student = store.studentProfiles.find((s) => s.id === studentId);
    if (!student) return null;
    if (updates.email) {
      const u = store.users.find((user) => user.id === studentId);
      if (u) u.email = updates.email.trim().toLowerCase();
    }
    if (updates.password) {
      const u = store.users.find((user) => user.id === studentId);
      if (u) u.passwordHash = updates.password.trim();
    }
    if (updates.status) {
      const u = store.users.find((user) => user.id === studentId);
      if (u) u.status = updates.status;
    }
    const { email, password, status, ...profileUpdates } = updates;
    Object.assign(student, profileUpdates);
    this.logActivity({
      userId: "usr-admin-01",
      role: "admin",
      action: "STUDENT_UPDATED",
      title: `Student Record Updated: ${student.firstName} ${student.lastName}`,
      description: `Admin modified profile details for ${student.studentIdCode}.`,
      affectedStudentId: studentId,
      entityType: "student_profile",
      entityId: studentId,
    });
    broadcastStoreChange("STUDENT_UPDATED", { student });
    return student;
  },

  updateCounselorProfile(
    counselorId: string,
    updates: Partial<DbStore["counselorProfiles"][0]> & {
      email?: string;
      password?: string;
      status?: "active" | "suspended" | "pending_activation";
      name?: string;
      specialization?: string;
      officeHours?: string;
    }
  ) {
    const counselor = store.counselorProfiles.find((c) => c.id === counselorId);
    if (!counselor) return null;
    if (updates.name) {
      const parts = updates.name.trim().split(" ");
      counselor.firstName = parts[0] || counselor.firstName;
      counselor.lastName = parts.slice(1).join(" ") || counselor.lastName;
    }
    if (updates.specialization) {
      counselor.specializationCountries = [updates.specialization];
    }
    if (updates.officeHours) {
      (counselor as any).officeHours = updates.officeHours;
    }
    if (updates.email) {
      const u = store.users.find((user) => user.id === counselorId);
      if (u) u.email = updates.email.trim().toLowerCase();
    }
    if (updates.password) {
      const u = store.users.find((user) => user.id === counselorId);
      if (u) u.passwordHash = updates.password.trim();
    }
    if (updates.status) {
      const u = store.users.find((user) => user.id === counselorId);
      if (u) u.status = updates.status;
      counselor.isActive = updates.status === "active";
    }
    const { email, password, status, name, specialization, officeHours, ...profileUpdates } = updates;
    Object.assign(counselor, profileUpdates);
    this.logActivity({
      userId: "usr-admin-01",
      role: "admin",
      action: "COUNSELOR_UPDATED",
      title: `Counselor Profile Updated: ${counselor.firstName} ${counselor.lastName}`,
      description: `Admin updated desk profile for ${counselor.employeeIdCode}.`,
      entityType: "counselor_profile",
      entityId: counselorId,
    });
    broadcastStoreChange("COUNSELOR_UPDATED", { counselor });
    return counselor;
  },

  suspendStudent(studentId: string, reason?: string) {
    const student = store.studentProfiles.find((s) => s.id === studentId);
    const u = store.users.find((user) => user.id === studentId);
    if (u) u.status = "suspended";
    const studentName = student ? `${student.firstName} ${student.lastName}` : "Student";
    const code = student?.studentIdCode || studentId;

    this.logActivity({
      userId: "usr-admin-01",
      role: "admin",
      action: "STUDENT_SUSPENDED",
      title: `Student Account Suspended: ${studentName}`,
      description: `Admin suspended candidate account ${code}. ${reason ? `Reason: ${reason}` : "Portal access revoked."}`,
      affectedStudentId: studentId,
      entityType: "student_profile",
      entityId: studentId,
    });

    store.notifications.push({
      id: `notif-${Date.now()}-susp`,
      userId: "admin",
      title: `Account Suspended: ${studentName}`,
      message: `Candidate ${studentName} (${code}) account was suspended by Administrator.`,
      category: "system",
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    const counselor = student ? this.getAssignedCounselor(studentId) : null;
    if (counselor) {
      store.notifications.push({
        id: `notif-${Date.now()}-csusp`,
        userId: counselor.id,
        title: `Candidate Suspended: ${studentName}`,
        message: `Candidate ${studentName} (${code}) has been suspended by Administration. Portal access is blocked.`,
        category: "system",
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    dispatchMongoAction("suspend_user", { userId: studentId, role: "student", reason });
    broadcastStoreChange("STUDENT_SUSPENDED", { studentId, status: "suspended" });
    return { success: true };
  },

  reactivateStudent(studentId: string) {
    const student = store.studentProfiles.find((s) => s.id === studentId);
    const u = store.users.find((user) => user.id === studentId);
    if (u) u.status = "active";
    const studentName = student ? `${student.firstName} ${student.lastName}` : "Student";
    const code = student?.studentIdCode || studentId;

    this.logActivity({
      userId: "usr-admin-01",
      role: "admin",
      action: "STUDENT_REACTIVATED",
      title: `Student Account Reactivated: ${studentName}`,
      description: `Admin reactivated candidate account ${code}. Portal access restored.`,
      affectedStudentId: studentId,
      entityType: "student_profile",
      entityId: studentId,
    });

    store.notifications.push({
      id: `notif-${Date.now()}-react`,
      userId: "admin",
      title: `Account Reactivated: ${studentName}`,
      message: `Candidate ${studentName} (${code}) account was reactivated by Administrator.`,
      category: "system",
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    dispatchMongoAction("reactivate_user", { userId: studentId, role: "student" });
    broadcastStoreChange("STUDENT_REACTIVATED", { studentId, status: "active" });
    return { success: true };
  },

  suspendCounselor(counselorId: string, reason?: string) {
    const counselor = store.counselorProfiles.find((c) => c.id === counselorId);
    if (counselor) counselor.isActive = false;
    const u = store.users.find((user) => user.id === counselorId);
    if (u) u.status = "suspended";
    const counselorName = counselor ? `${counselor.firstName} ${counselor.lastName}` : "Counselor";
    const code = counselor?.employeeIdCode || counselorId;

    this.logActivity({
      userId: "usr-admin-01",
      role: "admin",
      action: "COUNSELOR_SUSPENDED",
      title: `Counselor Desk Suspended: ${counselorName}`,
      description: `Admin suspended counselor desk ${code}. ${reason ? `Reason: ${reason}` : "Desk access revoked."}`,
      entityType: "counselor_profile",
      entityId: counselorId,
    });

    store.notifications.push({
      id: `notif-${Date.now()}-csusp`,
      userId: "admin",
      title: `Counselor Desk Suspended: ${counselorName}`,
      message: `Senior counselor ${counselorName} (${code}) desk was suspended by Administrator.`,
      category: "system",
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    dispatchMongoAction("suspend_user", { userId: counselorId, role: "counselor", reason });
    broadcastStoreChange("COUNSELOR_SUSPENDED", { counselorId, status: "suspended" });
    return { success: true };
  },

  reactivateCounselor(counselorId: string) {
    const counselor = store.counselorProfiles.find((c) => c.id === counselorId);
    if (counselor) counselor.isActive = true;
    const u = store.users.find((user) => user.id === counselorId);
    if (u) u.status = "active";
    const counselorName = counselor ? `${counselor.firstName} ${counselor.lastName}` : "Counselor";
    const code = counselor?.employeeIdCode || counselorId;

    this.logActivity({
      userId: "usr-admin-01",
      role: "admin",
      action: "COUNSELOR_REACTIVATED",
      title: `Counselor Desk Reactivated: ${counselorName}`,
      description: `Admin reactivated counselor desk ${code}. Desk access restored.`,
      entityType: "counselor_profile",
      entityId: counselorId,
    });

    store.notifications.push({
      id: `notif-${Date.now()}-creact`,
      userId: "admin",
      title: `Counselor Desk Reactivated: ${counselorName}`,
      message: `Senior counselor ${counselorName} (${code}) desk was reactivated by Administrator.`,
      category: "system",
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    dispatchMongoAction("reactivate_user", { userId: counselorId, role: "counselor" });
    broadcastStoreChange("COUNSELOR_REACTIVATED", { counselorId, status: "active" });
    return { success: true };
  },

  deleteStudent(studentId: string, reason?: string) {
    const student = store.studentProfiles.find((s) => s.id === studentId);
    const u = store.users.find((user) => user.id === studentId);
    const studentName = student ? `${student.firstName} ${student.lastName}` : "Student";
    const code = student?.studentIdCode || studentId;

    // Remove from in-memory arrays
    store.studentProfiles = store.studentProfiles.filter((s) => s.id !== studentId);
    store.users = store.users.filter((user) => user.id !== studentId);
    store.applications = store.applications.filter((a) => a.studentId !== studentId);
    store.tasks = store.tasks.filter((t) => t.studentId !== studentId);
    store.documents = store.documents.filter((d) => d.studentId !== studentId);
    store.journeyRecords = store.journeyRecords.filter((j) => j.studentId !== studentId);
    store.counselorAssignments = store.counselorAssignments.filter((ca) => ca.studentId !== studentId);

    this.logActivity({
      userId: "usr-admin-01",
      role: "admin",
      action: "STUDENT_DELETED",
      title: `Student Account Deleted: ${studentName}`,
      description: `Admin permanently deleted candidate ${code} (${studentName}). ${reason ? `Reason: ${reason}` : "Account credentials and records purged."}`,
      affectedStudentId: studentId,
      entityType: "student_profile",
      entityId: studentId,
    });

    store.notifications.push({
      id: `notif-${Date.now()}-del`,
      userId: "admin",
      title: `Candidate Account Deleted: ${studentName}`,
      message: `Candidate ${studentName} (${code}) account and records were permanently deleted by Administrator.`,
      category: "system",
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    const counselor = student ? this.getAssignedCounselor(studentId) : null;
    if (counselor) {
      store.notifications.push({
        id: `notif-${Date.now()}-cdel`,
        userId: counselor.id,
        title: `Assigned Candidate Deleted: ${studentName}`,
        message: `Candidate ${studentName} (${code}) account was permanently deleted by Administrator.`,
        category: "system",
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    dispatchMongoAction("delete_student", { studentId, reason });
    broadcastStoreChange("STUDENT_DELETED", { studentId });
    return { success: true };
  },

  deleteCounselor(counselorId: string, reason?: string) {
    const counselor = store.counselorProfiles.find((c) => c.id === counselorId);
    const u = store.users.find((user) => user.id === counselorId);
    const counselorName = counselor ? `${counselor.firstName} ${counselor.lastName}` : "Counselor";
    const code = counselor?.employeeIdCode || counselorId;

    // Unassign all students previously allocated to this counselor by clearing counselor assignments
    store.counselorAssignments = store.counselorAssignments.filter((ca) => ca.counselorId !== counselorId);

    // Remove from in-memory arrays
    store.counselorProfiles = store.counselorProfiles.filter((c) => c.id !== counselorId);
    store.users = store.users.filter((user) => user.id !== counselorId);

    this.logActivity({
      userId: "usr-admin-01",
      role: "admin",
      action: "COUNSELOR_DELETED",
      title: `Counselor Account Deleted: ${counselorName}`,
      description: `Admin deleted counselor desk ${code} (${counselorName}). Assigned candidates were moved to admissions hold. ${reason ? `Reason: ${reason}` : ""}`,
      entityType: "counselor_profile",
      entityId: counselorId,
    });

    store.notifications.push({
      id: `notif-${Date.now()}-coundel`,
      userId: "admin",
      title: `Counselor Desk Deleted: ${counselorName}`,
      message: `Senior counselor ${counselorName} (${code}) account was deleted by Administrator. Assigned candidates were returned to unassigned admissions hold.`,
      category: "system",
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    dispatchMongoAction("delete_counselor", { counselorId, reason });
    broadcastStoreChange("COUNSELOR_DELETED", { counselorId });
    return { success: true };
  },

  getCounselorAssignments() {
    return store.counselorAssignments.map((a) => {
      const stu = store.studentProfiles.find((s) => s.id === a.studentId);
      const c = store.counselorProfiles.find((coun) => coun.id === a.counselorId);
      return {
        ...a,
        studentName: stu ? `${stu.firstName} ${stu.lastName}` : "Unknown Student",
        studentIdCode: stu?.studentIdCode || "N/A",
        counselorName: c ? `${c.firstName} ${c.lastName}` : "Unallocated",
        counselorIdCode: c?.employeeIdCode || "N/A",
      };
    });
  },

  broadcastNotification(
    title: string,
    message: string,
    targetRole: "all" | "student" | "counselor" = "all"
  ) {
    const now = new Date().toISOString();
    const created: any[] = [];
    const targetUsers = store.users.filter((u) => {
      if (targetRole === "all") return u.role === "student" || u.role === "counselor";
      return u.role === targetRole;
    });

    targetUsers.forEach((u) => {
      const notif = {
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        userId: u.id,
        title,
        message,
        category: "announcement",
        isRead: false,
        createdAt: now,
      };
      store.notifications.push(notif);
      created.push(notif);
    });

    this.logActivity({
      userId: "usr-admin-01",
      role: "admin",
      action: "BROADCAST_NOTIFICATION",
      title: `Broadcast Dispatched: ${title}`,
      description: `Admin broadcasted announcement to ${targetUsers.length} ${targetRole} users.`,
      entityType: "notification",
      entityId: "broadcast",
    });

    broadcastStoreChange("NOTIFICATION_BROADCAST", { count: created.length });
    return created;
  },

  getAllNotifications() {
    return store.notifications.map((n) => {
      const u = store.users.find((usr) => usr.id === n.userId);
      const stu = store.studentProfiles.find((s) => s.id === n.userId);
      const coun = store.counselorProfiles.find((c) => c.id === n.userId);
      const recipientName = stu
        ? `${stu.firstName} ${stu.lastName} (Student)`
        : coun
        ? `${coun.firstName} ${coun.lastName} (Counselor)`
        : n.userId === "admin" || n.userId === "usr-admin-01"
        ? "GVK Super Admin (Leadership)"
        : n.userId === "counselors" || n.userId === "all_counselors"
        ? "All GVK Counselors"
        : n.userId === "students" || n.userId === "all_students"
        ? "All Enrolled Students"
        : u?.email || "System User";
      const recipientRole = stu
        ? "student"
        : coun
        ? "counselor"
        : n.userId === "admin" || n.userId === "usr-admin-01"
        ? "admin"
        : u?.role || "system";
      return {
        ...n,
        recipientRole,
        recipientName,
      };
    });
  },

  // Applications
  getStudentApplications(studentId: string): UniversityApplicationCardData[] {
    return store.applications
      .filter((a) => a.studentId === studentId)
      .map((app) => ({
        id: app.id,
        universityName: app.universityName,
        country: app.country,
        courseName: app.courseName,
        intake: app.intake,
        durationYears: app.durationYears || 1,
        tuitionFee: app.tuitionFeeAmount,
        tuitionFeeCurrency: app.tuitionFeeCurrency,
        tuition1Year: app.tuition1Year || app.tuitionFeeAmount,
        tuitionRange1Year: app.tuitionRange1Year || "Standard 1-Yr",
        tuition2Year: app.tuition2Year || (app.tuitionFeeAmount + 3500),
        tuitionRange2Year: app.tuitionRange2Year || "with Placement",
        placementAvailable: app.placementAvailable !== undefined ? app.placementAvailable : true,
        placementStructure: app.placementStructure,
        placementFeeNote: app.placementFeeNote,
        appRefNumber: app.appRefNumber,
        currentStatus: app.currentStatus,
        offerType: app.offerType,
        offerConditions: app.offerConditions,
        offerLetterFileName: app.offerLetterFileName,
        offerLetterUrl: app.offerLetterUrl || (app.offerLetterFileName ? `/api/documents/download?id=doc-offer-${app.id}&studentId=${app.studentId}` : undefined),
        offerLetterUploadedAt: app.offerLetterUploadedAt,
        depositAmount: app.depositAmount,
        depositDeadline: app.depositDeadline,
        depositStatus: app.depositStatus,
        casNumber: app.casNumber,
        visaStatus: app.visaStatus,
        counselorRemarks: app.counselorRemarks,
        missingRequirementsCount: app.currentStatus === "documents_pending" ? 1 : 0,
        isFinalDestination: !!app.isFinalDestination,
        decisionStatus: app.decisionStatus || (app.isFinalDestination ? "accepted" : (app.currentStatus === "rejected" ? "rejected" : "pending")),
        updatedAt: app.updatedAt,
      }));
  },

  // Get student's confirmed single destination university application
  getStudentFinalDestination(studentId: string): UniversityApplicationCardData | null {
    const apps = this.getStudentApplications(studentId);
    return apps.find((a) => a.isFinalDestination) || null;
  },

  // Accept one university offer as final destination (exclusive single-university commitment)
  acceptUniversityOffer(
    studentId: string,
    applicationId: string,
    acceptedByUserId: string,
    remarks?: string
  ): {
    success: boolean;
    application?: DbStore["applications"][0];
    error?: string;
  } {
    const studentApps = store.applications.filter((a) => a.studentId === studentId);
    const targetApp = studentApps.find((a) => a.id === applicationId);
    if (!targetApp) {
      return { success: false, error: "Application not found." };
    }

    const hasOffer =
      targetApp.currentStatus === "conditional_offer" ||
      targetApp.currentStatus === "unconditional_offer" ||
      targetApp.offerType !== "none";

    if (!hasOffer) {
      return {
        success: false,
        error: `Cannot accept offer from ${targetApp.universityName}. An official admission offer has not been received yet.`,
      };
    }

    // 1. Mark all other applications for this student as declined / not selected as final destination
    for (const app of studentApps) {
      if (app.id !== applicationId) {
        app.isFinalDestination = false;
        if (app.currentStatus === "conditional_offer" || app.currentStatus === "unconditional_offer") {
          app.decisionStatus = "declined";
          app.counselorRemarks = `Offer received but declined. Candidate committed to ${targetApp.universityName} as primary destination.`;
        }
      }
    }

    // 2. Mark target application as Confirmed Final Destination
    targetApp.isFinalDestination = true;
    targetApp.decisionStatus = "accepted";
    if (remarks) {
      targetApp.counselorRemarks = remarks;
    } else {
      targetApp.counselorRemarks = `Official Firm Acceptance: Candidate finalized ${targetApp.universityName} as primary Masters destination.`;
    }
    targetApp.updatedAt = new Date().toISOString();

    // 3. Update student profile
    const student = store.studentProfiles.find((s) => s.id === studentId);
    if (student) {
      student.finalDestinationUniversity = targetApp.universityName;
      student.finalDestinationAppId = targetApp.id;
    }

    // 4. Update downstream journey stages to bind strictly to this chosen university
    const journey = store.journeyRecords.filter((j) => j.studentId === studentId);

    // Stage 6 (Conditional Offer)
    const stage6 = journey.find((j) => j.stageNumber === 6);
    if (stage6) {
      stage6.counselorRemarks = `Official offer accepted for ${targetApp.universityName} (${targetApp.courseName}). Ready for deposit payment.`;
    }

    // Stage 7 (Interview / University Payment)
    const stage7 = journey.find((j) => j.stageNumber === 7);
    if (stage7) {
      stage7.deadline = targetApp.depositDeadline || "2026-12-15";
      stage7.counselorRemarks = `${targetApp.universityName} deposit (${targetApp.tuitionFeeCurrency} ${targetApp.depositAmount?.toLocaleString() || "2,000"}) due by ${targetApp.depositDeadline || "15 Dec 2026"} to trigger CAS.`;
    }

    // Stage 10 (CAS Request & Issuance)
    const stage10 = journey.find((j) => j.stageNumber === 10);
    if (stage10) {
      stage10.counselorRemarks = `Confirmation of Acceptance for Studies (CAS) generation by ${targetApp.universityName} admissions team.`;
    }

    // Stage 11 (Visa Application)
    const stage11 = journey.find((j) => j.stageNumber === 11);
    if (stage11) {
      stage11.counselorRemarks = `UKVI Tier 4 student visa application sponsored under ${targetApp.universityName} Sponsor Licence.`;
    }

    // Stage 21 (Accommodation Check-in)
    const stage21 = journey.find((j) => j.stageNumber === 21);
    if (stage21) {
      stage21.description = `Student accommodation move-in at ${targetApp.universityName} campus / city halls.`;
    }

    // Stage 22 (College Enrollment)
    const stage22 = journey.find((j) => j.stageNumber === 22);
    if (stage22) {
      stage22.description = `${targetApp.universityName} campus registration, student ID card and BRP collection.`;
    }

    // 5. Activity log
    this.logActivity({
      userId: acceptedByUserId,
      role: acceptedByUserId.startsWith("usr-student") ? "student" : "counselor",
      action: "UNIVERSITY_OFFER_ACCEPTED",
      affectedStudentId: studentId,
      relatedApplicationId: targetApp.id,
      entityType: "student_application",
      newValue: {
        universityName: targetApp.universityName,
        courseName: targetApp.courseName,
        tuitionFee: targetApp.tuitionFeeAmount,
        depositAmount: targetApp.depositAmount,
      },
      context: { university: targetApp.universityName, remarks },
    });

    // 6. Notifications
    store.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: studentId,
      title: `Final Destination Confirmed: ${targetApp.universityName}`,
      message: `You have accepted the offer for ${targetApp.courseName} at ${targetApp.universityName}. All downstream stages (Tuition Deposit, CAS, Visa, Accommodation) are now proceeding for this university.`,
      category: "application",
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    store.notifications.unshift({
      id: `notif-counselor-${Date.now()}`,
      userId: "usr-counselor-01",
      title: `Candidate Finalized Destination: ${targetApp.universityName}`,
      message: `${student?.firstName || "Student"} accepted the admission offer from ${targetApp.universityName}. Ready to initiate CAS and Tuition Deposit workflow.`,
      category: "application",
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    broadcastStoreChange("OFFER_ACCEPTED", { studentId, targetApp });

    dispatchMongoAction("accept_offer", {
      studentId,
      applicationId: targetApp.id,
      acceptedByUserId,
      remarks,
    });

    return {
      success: true,
      application: targetApp,
    };
  },

  getAllApplications(counselorId?: string): Array<DbStore["applications"][0] & { studentName: string; studentIdCode: string }> {
    let apps = store.applications;
    if (counselorId) {
      const assignedIds = store.counselorAssignments
        .filter((a) => a.counselorId === counselorId && a.isActive)
        .map((a) => a.studentId);
      apps = apps.filter((a) => assignedIds.includes(a.studentId));
    }
    return apps.map((app) => {
      const student = store.studentProfiles.find((s) => s.id === app.studentId);
      return {
        ...app,
        studentName: student ? `${student.firstName} ${student.lastName}` : "Unknown Student",
        studentIdCode: student?.studentIdCode || "N/A",
      };
    });
  },

  updateApplicationStatus(
    appId: string,
    newStatus: ApplicationStatus,
    changedByUserId: string,
    remarks?: string,
    offerConditions?: string,
    offerLetterFileName?: string,
    offerLetterUrl?: string,
    depositAmount?: number,
    depositDeadline?: string,
    tuitionFeeAmount?: number
  ) {
    const app = store.applications.find((a) => a.id === appId);
    if (!app) return null;

    const previousStatus = app.currentStatus;
    const now = new Date().toISOString();
    app.currentStatus = newStatus;
    if (remarks !== undefined) app.counselorRemarks = remarks;
    if (offerConditions !== undefined) app.offerConditions = offerConditions;
    if (depositAmount !== undefined) app.depositAmount = depositAmount;
    if (depositDeadline !== undefined) app.depositDeadline = depositDeadline;
    if (tuitionFeeAmount !== undefined) app.tuitionFeeAmount = tuitionFeeAmount;
    app.updatedAt = now;

    if (newStatus === "conditional_offer") {
      app.offerType = "conditional";
    } else if (newStatus === "unconditional_offer") {
      app.offerType = "unconditional";
    } else if (newStatus === "rejected") {
      app.decisionStatus = "rejected";
    }

    if (offerLetterFileName) {
      app.offerLetterFileName = offerLetterFileName;
      app.offerLetterUrl = offerLetterUrl || `/api/documents/download?id=doc-offer-${app.id}&studentId=${app.studentId}`;
      app.offerLetterUploadedAt = now;

      // Automatically sync into student's Document Vault
      const docId = `doc-offer-${app.id}`;
      const existingDocIdx = store.documents.findIndex((d) => d.id === docId);
      const offerDoc: DocumentVaultItem = {
        id: docId,
        studentId: app.studentId,
        title: `${app.universityName} — ${newStatus === "unconditional_offer" ? "Unconditional" : "Conditional"} Offer Letter`,
        category: "academic",
        documentType: "offer_letter",
        latestVersion: 1,
        verificationStatus: "verified",
        fileName: offerLetterFileName,
        fileSize: 1250000,
        uploadedAt: now,
        verifiedAt: now,
        verifiedByCounselorId: changedByUserId,
        counselorComments: `Official admission offer letter issued directly by ${app.universityName} international admissions office.`,
        isReusable: false,
      };

      if (existingDocIdx >= 0) {
        store.documents[existingDocIdx] = offerDoc;
      } else {
        store.documents.unshift(offerDoc);
      }

      dispatchMongoAction("upload_document", { document: offerDoc });
    }

    const isOffer = newStatus === "conditional_offer" || newStatus === "unconditional_offer";

    // Immutable audit log
    this.logActivity({
      userId: changedByUserId,
      role: "counselor",
      action: isOffer ? "OFFER_LETTER_UPLOADED" : "APPLICATION_STATUS_CHANGED",
      affectedStudentId: app.studentId,
      relatedApplicationId: app.id,
      entityType: "student_application",
      previousValue: previousStatus,
      newValue: newStatus,
      context: {
        university: app.universityName,
        remarks,
        offerLetter: offerLetterFileName,
        conditions: offerConditions,
      },
    });

    // Notify student
    store.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: app.studentId,
      title: isOffer
        ? `🎉 Offer Letter Issued: ${app.universityName}`
        : `Application Status: ${app.universityName}`,
      message: isOffer
        ? `Congratulations! ${app.universityName} issued a ${newStatus === "unconditional_offer" ? "Unconditional" : "Conditional"} Offer Letter. Review conditions and download your offer letter now.`
        : `Status updated to ${newStatus.replace(/_/g, " ")}. ${remarks || ""}`,
      category: "application",
      isRead: false,
      createdAt: now,
    });

    broadcastStoreChange("APPLICATION_STATUS_UPDATED", {
      applicationId: appId,
      newStatus,
      application: app,
    });

    dispatchMongoAction("update_application_status", {
      applicationId: appId,
      newStatus,
      remarks,
      offerConditions,
      counselorId: changedByUserId,
      offerLetterFileName,
      offerLetterUrl: app.offerLetterUrl,
      depositAmount,
      depositDeadline,
      tuitionFeeAmount,
    });

    return app;
  },

  createApplication(
    studentId: string,
    universityName: string,
    country: string,
    courseName: string,
    intake: string,
    tuitionFee: number,
    createdByUserId: string
  ) {
    const newApp = {
      id: `app-${Date.now()}`,
      studentId,
      universityId: `univ-custom-${Date.now()}`,
      universityName,
      country,
      courseName,
      intake,
      tuitionFeeCurrency: "GBP",
      tuitionFeeAmount: tuitionFee,
      applicationFee: 50,
      currentStatus: "shortlisted" as ApplicationStatus,
      offerType: "none" as const,
      depositStatus: "pending" as const,
      updatedAt: new Date().toISOString(),
    };

    store.applications.push(newApp);

    this.logActivity({
      userId: createdByUserId,
      role: "counselor",
      action: "APPLICATION_CREATED",
      affectedStudentId: studentId,
      relatedApplicationId: newApp.id,
      entityType: "student_application",
      newValue: newApp,
    });

    dispatchMongoAction("create_application", { application: newApp });

    return newApp;
  },

  deleteApplication(appId: string, performedByUserId: string = "usr-admin-01") {
    const idx = store.applications.findIndex((a) => a.id === appId);
    if (idx !== -1) {
      const removed = store.applications.splice(idx, 1)[0];
      this.logActivity({
        userId: performedByUserId,
        role: "admin",
        action: "APPLICATION_DELETED",
        affectedStudentId: removed.studentId,
        relatedApplicationId: appId,
        entityType: "student_application",
        previousValue: removed,
      });

      dispatchMongoAction("delete_application", { applicationId: appId });

      return true;
    }
    return false;
  },

  markPrerequisiteStagesCompleted(
    studentId: string,
    performedByUserId: string = "usr-admin-01",
    role: "admin" | "counselor" = "admin"
  ) {
    const records = store.journeyRecords.filter((j) => j.studentId === studentId);
    records.forEach((rec) => {
      if (rec.stageNumber <= 4) {
        rec.status = "completed" as JourneyStageStatus;
        rec.completionDate = new Date().toISOString().split("T")[0];
        rec.counselorRemarks = "Marked completed via offline counseling, in-office document review & offline university shortlisting.";
        rec.updatedAt = new Date().toISOString();
      } else if (rec.stageNumber === 5 && rec.status === "not_started") {
        rec.status = "in_progress" as JourneyStageStatus;
        rec.startDate = new Date().toISOString().split("T")[0];
        rec.counselorRemarks = "Application preparation and submission unlocked.";
        rec.updatedAt = new Date().toISOString();
      }
    });

    this.logActivity({
      userId: performedByUserId,
      role,
      action: "OFFLINE_STAGES_COMPLETED",
      affectedStudentId: studentId,
      entityType: "student_journey",
      description: "Counselor/Admin marked prerequisite stages (Profile, Documents & Shortlisting) as completed for offline processing.",
    });

    dispatchMongoAction("mark_prerequisite_stages_completed", {
      studentId,
      counselorRemarks: "Marked completed via offline counseling, in-office document review & offline university shortlisting.",
    });

    return this.getStudentJourney(studentId);
  },

  markStageOfflineCompleted(
    studentId: string,
    stageNumber: number,
    performedByUserId: string = "usr-admin-01",
    role: "admin" | "counselor" = "admin",
    customRemarks?: string
  ) {
    const records = store.journeyRecords.filter((j) => j.studentId === studentId);
    records.forEach((rec) => {
      if (rec.stageNumber <= stageNumber && rec.status !== "completed") {
        rec.status = "completed" as JourneyStageStatus;
        rec.completionDate = new Date().toISOString().split("T")[0];
        rec.counselorRemarks = customRemarks || `Stage ${rec.stageNumber} (${rec.stageName}) marked completed via offline verification.`;
        rec.updatedAt = new Date().toISOString();
      } else if (rec.stageNumber === stageNumber + 1 && rec.status === "not_started") {
        rec.status = "in_progress" as JourneyStageStatus;
        rec.startDate = new Date().toISOString().split("T")[0];
        rec.updatedAt = new Date().toISOString();
      }
    });

    this.logActivity({
      userId: performedByUserId,
      role,
      action: "STAGE_STATUS_OVERRIDDEN",
      affectedStudentId: studentId,
      entityType: "student_journey",
      description: `Stage ${stageNumber} completed offline.`,
    });

    dispatchMongoAction("mark_stage_offline_completed", {
      studentId,
      stageNumber,
      counselorRemarks: customRemarks,
    });

    return this.getStudentJourney(studentId);
  },

  shortlistUniversity(
    studentId: string,
    universityName: string,
    country: string,
    courseName: string,
    tuitionFee: number,
    tier: "ambitious" | "target" | "safe" = "target"
  ) {
    const existing = store.applications.find(
      (a) => a.studentId === studentId && a.universityName.toLowerCase() === universityName.toLowerCase()
    );
    if (existing) {
      return existing;
    }
    const matchedUni = ALL_GLOBAL_UNIVERSITIES.find(
      (u) => u.name.toLowerCase() === universityName.toLowerCase()
    );

    const currencyMap: Record<string, string> = {
      "United Kingdom": "GBP",
      "USA": "USD",
      "United States": "USD",
      "Australia": "AUD",
      "Canada": "CAD",
      "Germany": "EUR",
      "New Zealand": "NZD",
    };

    const newApp = {
      id: `app-shortlist-${Date.now()}`,
      studentId,
      universityId: matchedUni?.id || `univ-${Date.now()}`,
      universityName,
      country,
      courseName,
      intake: matchedUni?.mainIntakes?.split(",")[0]?.trim() || "September Intake",
      durationYears: (matchedUni?.tuition2Year ? 2 : 1) as 1 | 2,
      tuitionFeeCurrency: matchedUni?.currency || currencyMap[country] || "USD",
      tuitionFeeAmount: matchedUni?.tuition1Year || tuitionFee,
      tuition1Year: matchedUni?.tuition1Year || tuitionFee,
      tuitionRange1Year: matchedUni?.tuitionRange1Year || "Standard 1-Yr",
      tuition2Year: matchedUni?.tuition2Year || (tuitionFee + 3500),
      tuitionRange2Year: matchedUni?.tuitionRange2Year || "with Placement",
      placementAvailable: matchedUni?.placementAvailable ?? true,
      placementStructure: matchedUni?.placementStructure,
      placementFeeNote: matchedUni?.placementFeeNote,
      applicationFee: 50,
      currentStatus: "shortlisted" as ApplicationStatus,
      offerType: "none" as const,
      depositStatus: "pending" as const,
      counselorRemarks: `Candidate shortlisted ${universityName} for Masters in ${country} (${tier.toUpperCase()} tier).`,
      updatedAt: new Date().toISOString(),
    };
    store.applications.push(newApp);

    this.logActivity({
      userId: studentId,
      role: "student",
      action: "APPLICATION_CREATED",
      affectedStudentId: studentId,
      relatedApplicationId: newApp.id,
      entityType: "student_application",
      newValue: { universityName, country, tier },
    });

    store.notifications.push({
      id: `notif-${Date.now()}`,
      userId: "usr-counselor-01",
      title: `University Shortlisted: ${universityName}`,
      message: `Rahul Sharma added ${universityName} to their university shortlist for ${country}.`,
      category: "application",
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    dispatchMongoAction("shortlist_university", {
      studentId,
      universityName,
      country,
      courseName,
      tuitionFee,
      tier,
    });

    return newApp;
  },

  removeShortlistedUniversity(studentId: string, universityName: string) {
    const index = store.applications.findIndex(
      (a) =>
        a.studentId === studentId &&
        a.universityName.toLowerCase() === universityName.toLowerCase() &&
        a.currentStatus === "shortlisted"
    );
    if (index !== -1) {
      const removed = store.applications.splice(index, 1)[0];
      dispatchMongoAction("remove_shortlisted_university", {
        studentId,
        universityName,
      });
      return removed;
    }
    return null;
  },

  // Student confirms their shortlisted universities and submits to assigned counselor
  confirmStudentShortlist(studentId: string) {
    const journey = this.getStudentJourney(studentId);
    const stage4 = journey.find((s) => s.stageNumber === 4);
    if (stage4) {
      stage4.status = "completed" as JourneyStageStatus;
      stage4.completionDate = new Date().toISOString().split("T")[0];
      stage4.counselorRemarks = "Student confirmed final university shortlist and submitted to counselor for official application lodging.";
      stage4.updatedAt = new Date().toISOString();
    }

    const stage5 = journey.find((s) => s.stageNumber === 5);
    if (stage5 && stage5.status === "not_started") {
      stage5.status = "in_progress" as JourneyStageStatus;
      stage5.startDate = new Date().toISOString().split("T")[0];
      stage5.updatedAt = new Date().toISOString();
    }

    const apps = this.getStudentApplications(studentId);
    const shortlistedUniNames = apps.map((a) => a.universityName).join(", ");
    const student = store.studentProfiles.find((s) => s.id === studentId);
    const studentName = student ? `${student.firstName} ${student.lastName}` : "Candidate";

    // Notify assigned counselor
    store.notifications.unshift({
      id: `notif-${Date.now()}-counselor`,
      userId: "usr-counselor-01",
      title: "University Shortlist Confirmed by Student",
      message: `${studentName} confirmed their target universities (${shortlistedUniNames || "Selected institutions"}) and requested official application submission to begin.`,
      category: "application",
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    this.logActivity({
      userId: studentId,
      userName: studentName,
      role: "student",
      action: "JOURNEY_STAGE_COMPLETED",
      title: "Stage 04 Completed: University Shortlist Confirmed",
      description: `Student confirmed target universities (${shortlistedUniNames}) and submitted to counselor for application lodging.`,
      affectedStudentId: studentId,
      entityType: "student_journey",
      newValue: { stageNumber: 4, status: "completed", targetCount: apps.length },
    });

    broadcastStoreChange("JOURNEY_STAGE_COMPLETED", {
      studentId,
      stageNumber: 4,
      stage: stage4,
    });

    dispatchMongoAction("update_journey_stage", {
      studentId,
      stageNumber: 4,
      status: "completed",
      counselorRemarks: "Student confirmed final university shortlist and submitted to counselor for official application lodging.",
    });

    if (stage5) {
      dispatchMongoAction("update_journey_stage", {
        studentId,
        stageNumber: 5,
        status: "in_progress",
        counselorRemarks: "Official portal submissions with references being prepared by counselor.",
      });
    }

    return this.getStudentJourney(studentId);
  },

  // Documents
  getStudentDocuments(studentId: string) {
    return store.documents
      .filter((d) => d.studentId === studentId)
      .map((doc) => ({
        ...doc,
        documentName: doc.title || doc.fileName || "Document",
        fileType: doc.fileName ? doc.fileName.split(".").pop()?.toUpperCase() : "PDF",
        fileSizeMb: doc.fileSize ? (doc.fileSize / (1024 * 1024)).toFixed(1) : "1.2",
        uploadedAt: doc.uploadedAt || new Date().toISOString(),
      }));
  },

  getAllDocuments(counselorId?: string) {
    let docs = store.documents;
    if (counselorId) {
      const assignedIds = store.counselorAssignments
        .filter((a) => a.counselorId === counselorId && a.isActive)
        .map((a) => a.studentId);
      docs = docs.filter((d) => assignedIds.includes(d.studentId));
    }
    return docs.map((doc) => {
      const student = store.studentProfiles.find((s) => s.id === doc.studentId);
      return {
        ...doc,
        documentName: doc.title || doc.fileName || "Document",
        fileType: doc.fileName ? doc.fileName.split(".").pop()?.toUpperCase() : "PDF",
        fileSizeMb: doc.fileSize ? (doc.fileSize / (1024 * 1024)).toFixed(1) : "1.2",
        studentName: student ? `${student.firstName} ${student.lastName}` : "Unknown",
        studentIdCode: student?.studentIdCode || "",
        uploadedAt: doc.uploadedAt || new Date().toISOString(),
      };
    });
  },

  getAllPendingReviewDocuments(counselorId?: string) {
    let docs = store.documents
      .filter((d) => d.verificationStatus === "under_review" || d.verificationStatus === "uploaded");
    if (counselorId) {
      const assignedIds = store.counselorAssignments
        .filter((a) => a.counselorId === counselorId && a.isActive)
        .map((a) => a.studentId);
      docs = docs.filter((d) => assignedIds.includes(d.studentId));
    }
    return docs.map((doc) => {
      const student = store.studentProfiles.find((s) => s.id === doc.studentId);
      return {
        ...doc,
        documentName: doc.title || doc.fileName || "Document",
        fileType: doc.fileName ? doc.fileName.split(".").pop()?.toUpperCase() : "PDF",
        fileSizeMb: doc.fileSize ? (doc.fileSize / (1024 * 1024)).toFixed(1) : "1.2",
        studentName: student ? `${student.firstName} ${student.lastName}` : "Unknown",
        studentIdCode: student?.studentIdCode || "",
        uploadedAt: doc.uploadedAt || new Date().toISOString(),
      };
    });
  },

  uploadDocument(
    studentId: string,
    category: DocumentCategory,
    docType: string,
    title: string,
    fileName: string,
    fileSize: number,
    fileUrl?: string
  ) {
    const student = store.studentProfiles.find((s) => s.id === studentId);
    const studentName = student ? `${student.firstName} ${student.lastName}` : "Student";

    const existing = store.documents.find(
      (d) => d.studentId === studentId && d.documentType === docType
    );

    let docResult: DocumentVaultItem;

    if (existing) {
      existing.latestVersion += 1;
      existing.verificationStatus = "under_review";
      existing.fileName = fileName;
      existing.fileSize = fileSize;
      if (fileUrl) (existing as any).fileUrl = fileUrl;
      existing.uploadedAt = new Date().toISOString();
      existing.counselorComments = null;

      this.logActivity({
        userId: studentId,
        userName: `${studentName} (Student)`,
        role: "student",
        action: "DOCUMENT_VERSION_UPLOADED",
        title: `Document Updated: ${title} (v${existing.latestVersion})`,
        description: `${studentName} uploaded a revised version of ${title} (${fileName}) for counselor verification.`,
        affectedStudentId: studentId,
        entityType: "document",
        entityId: existing.id,
        newValue: { fileName, version: existing.latestVersion },
      });

      docResult = existing;
    } else {
      const newDoc: DocumentVaultItem = {
        id: `doc-${Date.now()}`,
        studentId,
        category,
        documentType: docType,
        title,
        verificationStatus: "under_review",
        latestVersion: 1,
        fileName,
        fileSize,
        uploadedAt: new Date().toISOString(),
        isReusable: true,
        ...(fileUrl ? { fileUrl } : {}),
      } as DocumentVaultItem;
      store.documents.push(newDoc);

      this.logActivity({
        userId: studentId,
        userName: `${studentName} (Student)`,
        role: "student",
        action: "DOCUMENT_UPLOADED",
        title: `Student Uploaded Document: ${title}`,
        description: `${studentName} uploaded ${fileName} for counselor verification.`,
        affectedStudentId: studentId,
        entityType: "document",
        entityId: newDoc.id,
        newValue: { title, fileName },
      });

      docResult = newDoc;
    }

    // Deliver instant real-time notifications across portals:
    // 1. All Active Counselors (so every counselor sees candidate document uploads in real time)
    const activeCounselors = store.counselorProfiles.filter((c) => c.isActive !== false);
    activeCounselors.forEach((c) => {
      store.notifications.unshift({
        id: `notif-${Date.now()}-${c.id}`,
        userId: c.id,
        title: `New Document Uploaded: ${title}`,
        message: `${studentName} (${student?.studentIdCode || "Candidate"}) uploaded "${fileName}" (${category.replace(/_/g, " ")}). Available for verification in Document Queue.`,
        category: "document",
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    });

    // 2. Central Admissions Admin
    store.notifications.unshift({
      id: `notif-${Date.now()}-admin`,
      userId: "admin",
      title: `Candidate Document Upload: ${studentName}`,
      message: `${studentName} (${student?.studentIdCode || "Candidate"}) uploaded "${title}" (${fileName}) under ${category.replace(/_/g, " ")}. Awaiting counselor verification.`,
      category: "document",
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    // 3. Candidate confirmation
    store.notifications.unshift({
      id: `notif-${Date.now()}-stu`,
      userId: studentId,
      title: `Document Upload Confirmed: ${title}`,
      message: `Your document "${fileName}" has been safely received and queued for counselor review.`,
      category: "document",
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    broadcastStoreChange("DOCUMENT_UPLOADED", { studentId, document: docResult });
    dispatchMongoAction("upload_document", { document: docResult });
    return docResult;
  },

  reviewDocument(
    documentId: string,
    decision: "verified" | "rejected" | "resubmission_required",
    counselorId: string,
    comments?: string
  ) {
    const doc = store.documents.find((d) => d.id === documentId);
    if (!doc) return null;

    const previousStatus = doc.verificationStatus;
    doc.verificationStatus = decision;
    doc.counselorComments = comments || null;

    const counselor = store.counselorProfiles.find((c) => c.id === counselorId);
    const counselorName = counselor ? `${counselor.firstName} ${counselor.lastName}` : "Counselor";

    this.logActivity({
      userId: counselorId,
      userName: `${counselorName} (Counselor)`,
      role: "counselor",
      action: "DOCUMENT_REVIEWED",
      title: `Counselor Evaluated Document: ${doc.title}`,
      description: `Evaluation decision: ${decision.toUpperCase()}. ${comments ? `Feedback: "${comments}"` : ""}`,
      affectedStudentId: doc.studentId,
      entityType: "document",
      entityId: doc.id,
      previousValue: previousStatus,
      newValue: decision,
      context: { comments },
    });

    const student = store.studentProfiles.find((s) => s.id === doc.studentId);
    const studentName = student ? `${student.firstName} ${student.lastName}` : "Candidate";

    // 1. Notify student
    store.notifications.unshift({
      id: `notif-${Date.now()}-${doc.studentId}`,
      userId: doc.studentId,
      title: decision === "verified" ? `Document Verified: ${doc.title}` : `Document Action Required: ${doc.title}`,
      message:
        decision === "verified"
          ? `Your document "${doc.title}" has been verified and approved by Counselor ${counselorName}.`
          : `Feedback from Counselor ${counselorName}: ${comments || "Resubmission required. Please review counselor remarks and re-upload."}`,
      category: "document",
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    // 2. Notify Admin
    store.notifications.unshift({
      id: `notif-${Date.now()}-admin`,
      userId: "admin",
      title: `Document Evaluated: ${doc.title}`,
      message: `${counselorName} evaluated "${doc.title}" for candidate ${studentName} - Decision: ${decision.toUpperCase()}.${comments ? ` Notes: "${comments}"` : ""}`,
      category: "document",
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    broadcastStoreChange("DOCUMENT_REVIEWED", { studentId: doc.studentId, document: doc });
    dispatchMongoAction("review_document", {
      documentId,
      studentId: doc.studentId,
      decision,
      counselorComments: comments,
      counselorId,
    });
    return doc;
  },

  // 25 Journey Stages Template for Sequential Progression
  getStudentJourney(studentId: string): JourneyStageItem[] {
    let records = store.journeyRecords.filter((j) => j.studentId === studentId);
    
    // Auto-seed sequential stages if student has no journey records yet
    if (records.length === 0) {
      const DEFAULT_25_JOURNEY_STAGES = [
        { stageNumber: 1, stageName: "Counseling Session", description: "Initial counseling and study abroad destination roadmap", responsibleParty: "counselor" as const, isMandatory: true },
        { stageNumber: 2, stageName: "Profile Evaluation", description: "Academic and English proficiency evaluation", responsibleParty: "counselor" as const, isMandatory: true },
        { stageNumber: 3, stageName: "Document Collection", description: "Gathering transcripts, certificates, passport & recommendation letters", responsibleParty: "student" as const, isMandatory: true },
        { stageNumber: 4, stageName: "University Shortlisting", description: "Curating dream, target, and safe university options", responsibleParty: "counselor" as const, isMandatory: true },
        { stageNumber: 5, stageName: "Application Submission", description: "Official portal submissions with references", responsibleParty: "counselor" as const, isMandatory: true },
        { stageNumber: 6, stageName: "Conditional Offer", description: "Receipt and review of conditional admission offers", responsibleParty: "university" as const, isMandatory: true },
        { stageNumber: 7, stageName: "Mock Admissions Interview", description: "Internal readiness interview conducted by GVK counseling desk", responsibleParty: "counselor" as const, isMandatory: true },
        { stageNumber: 8, stageName: "University Admissions Interview", description: "Official interview conducted by University Admissions Committee", responsibleParty: "university" as const, isMandatory: true },
        { stageNumber: 9, stageName: "University Deposit Payment", description: "Tuition deposit payment to secure admission seat", responsibleParty: "student" as const, isMandatory: true },
        { stageNumber: 10, stageName: "TB Test", description: "UKVI approved clinic Tuberculosis screening test", responsibleParty: "student" as const, isMandatory: true },
        { stageNumber: 11, stageName: "Unconditional Offer", description: "Conversion of conditional offer upon clearing academic/financial requirements", responsibleParty: "university" as const, isMandatory: true },
        { stageNumber: 12, stageName: "CAS Request & Issuance", description: "Confirmation of Acceptance for Studies generation", responsibleParty: "counselor" as const, isMandatory: true },
        { stageNumber: 13, stageName: "Visa Application", description: "Online UKVI Tier 4 student visa submission", responsibleParty: "counselor" as const, isMandatory: true },
        { stageNumber: 14, stageName: "IHS Payment", description: "Immigration Health Surcharge fee payment", responsibleParty: "student" as const, isMandatory: true },
        { stageNumber: 15, stageName: "Visa Approval", description: "VFS appointment and biometric passport stamp", responsibleParty: "external" as const, isMandatory: true },
        { stageNumber: 16, stageName: "E-Visa Registration", description: "UKVI digital status account creation", responsibleParty: "student" as const, isMandatory: true },
        { stageNumber: 17, stageName: "Flight Tickets", description: "Booking international flight tickets", responsibleParty: "student" as const, isMandatory: false },
        { stageNumber: 18, stageName: "Pre-Departure Briefing", description: "GVK Hyderabad pre-departure orientation briefing", responsibleParty: "counselor" as const, isMandatory: true },
        { stageNumber: 19, stageName: "Hyderabad Airport Drop", description: "GVK coordinated RGIA Hyderabad airport send-off", responsibleParty: "counselor" as const, isMandatory: false },
        { stageNumber: 20, stageName: "London Heathrow Pick-up", description: "GVK airport pickup and transfer in the UK", responsibleParty: "external" as const, isMandatory: false },
        { stageNumber: 21, stageName: "Accommodation Check-in", description: "University hall or private student accommodation move-in", responsibleParty: "student" as const, isMandatory: true },
        { stageNumber: 22, stageName: "College Enrollment", description: "Campus registration, student ID card and BRP collection", responsibleParty: "student" as const, isMandatory: true },
        { stageNumber: 23, stageName: "GP Registration", description: "Registration with local General Practice (GP) surgery for National Health Service (NHS) access", responsibleParty: "student" as const, isMandatory: true },
        { stageNumber: 24, stageName: "NI Registration", description: "National Insurance (NI) number application with the UK Department for Work and Pensions (DWP)", responsibleParty: "student" as const, isMandatory: true },
        { stageNumber: 25, stageName: "Part Time Job Support", description: "GVK post-landing career desk assistance for CV formatting, 20-hour work rights compliance & part-time job placement", responsibleParty: "counselor" as const, isMandatory: false },
      ];

      for (const t of DEFAULT_25_JOURNEY_STAGES) {
        store.journeyRecords.push({
          id: `j-${studentId}-${t.stageNumber.toString().padStart(2, "0")}`,
          studentId,
          stageNumber: t.stageNumber,
          stageName: t.stageName,
          description: t.description,
          status: t.stageNumber === 1 ? "in_progress" : "not_started",
          isMandatory: t.isMandatory,
          responsibleParty: t.responsibleParty,
          startDate: t.stageNumber === 1 ? new Date().toISOString().split("T")[0] : undefined,
          updatedAt: new Date().toISOString(),
        });
      }
      records = store.journeyRecords.filter((j) => j.studentId === studentId);
    } else {
      // Auto-augment stages 23, 24, 25 if missing for existing student records
      const existingNums = new Set(records.map((r) => r.stageNumber));
      const STAGES_TO_ENSURE = [
        { stageNumber: 23, stageName: "GP Registration", description: "Registration with local General Practice (GP) surgery for National Health Service (NHS) access", responsibleParty: "student" as const, isMandatory: true },
        { stageNumber: 24, stageName: "NI Registration", description: "National Insurance (NI) number application with the UK Department for Work and Pensions (DWP)", responsibleParty: "student" as const, isMandatory: true },
        { stageNumber: 25, stageName: "Part Time Job Support", description: "GVK post-landing career desk assistance for CV formatting, 20-hour work rights compliance & part-time job placement", responsibleParty: "counselor" as const, isMandatory: false },
      ];
      let addedAny = false;
      for (const t of STAGES_TO_ENSURE) {
        if (!existingNums.has(t.stageNumber)) {
          store.journeyRecords.push({
            id: `j-${studentId}-${t.stageNumber.toString().padStart(2, "0")}`,
            studentId,
            stageNumber: t.stageNumber,
            stageName: t.stageName,
            description: t.description,
            status: "not_started",
            isMandatory: t.isMandatory,
            responsibleParty: t.responsibleParty,
            updatedAt: new Date().toISOString(),
          });
          addedAny = true;
        }
      }
      if (addedAny) {
        records = store.journeyRecords.filter((j) => j.studentId === studentId);
      }
    }

    records.sort((a, b) => a.stageNumber - b.stageNumber);

    // Official 25 Stage Metadata Mapping (Ensures updated titles & descriptions propagate instantly)
    const stageNamesMap: Record<number, { name: string; desc: string; party: "student" | "counselor" | "university" | "external" }> = {
      1: { name: "Counseling Session", desc: "Initial counseling and study abroad destination roadmap", party: "counselor" },
      2: { name: "Profile Evaluation", desc: "Academic and English proficiency evaluation", party: "counselor" },
      3: { name: "Document Collection", desc: "Gathering transcripts, certificates, passport & recommendation letters", party: "student" },
      4: { name: "University Shortlisting", desc: "Curating dream, target, and safe university options", party: "counselor" },
      5: { name: "Application Submission", desc: "Official portal submissions with references", party: "counselor" },
      6: { name: "Conditional Offer", desc: "Receipt and review of conditional admission offers", party: "university" },
      7: { name: "Mock Admissions Interview", desc: "Internal readiness interview conducted by GVK counseling desk", party: "counselor" },
      8: { name: "University Admissions Interview", desc: "Official interview conducted by University Admissions Committee", party: "university" },
      9: { name: "University Deposit Payment", desc: "Tuition deposit payment to secure admission seat", party: "student" },
      10: { name: "TB Test", desc: "UKVI approved clinic Tuberculosis screening test", party: "student" },
      11: { name: "Unconditional Offer", desc: "Conversion of conditional offer upon clearing academic/financial requirements", party: "university" },
      12: { name: "CAS Request & Issuance", desc: "Confirmation of Acceptance for Studies generation", party: "counselor" },
      13: { name: "Visa Application", desc: "Online UKVI Tier 4 student visa submission", party: "counselor" },
      14: { name: "IHS Payment", desc: "Immigration Health Surcharge fee payment", party: "student" },
      15: { name: "Visa Approval", desc: "VFS appointment and biometric passport stamp", party: "external" },
      16: { name: "E-Visa Registration", desc: "UKVI digital status account creation", party: "student" },
      17: { name: "Flight Tickets", desc: "Booking international flight tickets", party: "student" },
      18: { name: "Pre-Departure Briefing", desc: "GVK Hyderabad pre-departure orientation briefing", party: "counselor" },
      19: { name: "Hyderabad Airport Drop", desc: "GVK coordinated RGIA Hyderabad airport send-off", party: "counselor" },
      20: { name: "London Heathrow Pick-up", desc: "GVK airport pickup and transfer in the UK", party: "external" },
      21: { name: "Accommodation Check-in", desc: "University hall or private student accommodation move-in", party: "student" },
      22: { name: "College Enrollment", desc: "Campus registration, student ID card and BRP collection", party: "student" },
      23: { name: "GP Registration", desc: "Registration with local General Practice (GP) surgery for National Health Service (NHS) access", party: "student" },
      24: { name: "NI Registration", desc: "National Insurance (NI) number application with the UK Department for Work and Pensions (DWP)", party: "student" },
      25: { name: "Part Time Job Support", desc: "GVK post-landing career desk assistance for CV formatting, 20-hour work rights compliance & part-time job placement", party: "counselor" },
    };

    for (const stg of records) {
      const def = stageNamesMap[stg.stageNumber];
      if (def) {
        stg.stageName = def.name;
        stg.description = def.desc;
        stg.responsibleParty = def.party;
      }
    }

    return records;
  },

  // Check if a stage can be completed based on strict sequential prerequisites
  canCompleteJourneyStage(studentId: string, stageNumber: number): { allowed: boolean; reason?: string; missingPrerequisite?: number } {
    const journey = this.getStudentJourney(studentId);
    const target = journey.find((j) => j.stageNumber === stageNumber);
    if (!target) {
      return { allowed: false, reason: `Stage ${stageNumber} not found.` };
    }

    if (stageNumber <= 1) {
      return { allowed: true };
    }

    // Check all previous stages. Every stage prior to stageNumber must be "completed"
    const incompletePrior = journey
      .filter((s) => s.stageNumber < stageNumber && s.status !== "completed")
      .sort((a, b) => a.stageNumber - b.stageNumber);

    if (incompletePrior.length > 0) {
      const firstIncomplete = incompletePrior[0];
      return {
        allowed: false,
        reason: `Cannot complete Stage ${stageNumber} (${target.stageName}). Prerequisite Stage ${firstIncomplete.stageNumber} (${firstIncomplete.stageName}) must be completed first.`,
        missingPrerequisite: firstIncomplete.stageNumber,
      };
    }

    return { allowed: true };
  },

  // Get active stage for a student
  getActiveJourneyStage(studentId: string): JourneyStageItem | null {
    const journey = this.getStudentJourney(studentId);
    // Find the first stage that is not completed
    const active = journey.find((s) => s.status !== "completed");
    return active || journey[journey.length - 1] || null;
  },

  // Update a journey stage with strict sequential validation and auto-advancement
  updateJourneyStage(
    studentId: string,
    stageNumber: number,
    status: JourneyStageStatus,
    updatedByUserId: string,
    remarks?: string
  ): {
    success: boolean;
    stage?: JourneyStageItem | null;
    nextStage?: JourneyStageItem | null;
    unlockedStageNumber?: number;
    error?: string;
  } {
    const journey = this.getStudentJourney(studentId);
    const stage = journey.find((j) => j.stageNumber === stageNumber);
    if (!stage) {
      return { success: false, error: `Stage ${stageNumber} not found for student.` };
    }

    const previousStatus = stage.status;

    if (status === "completed") {
      stage.status = "completed";
      stage.completionDate = new Date().toISOString().split("T")[0];
      if (remarks) stage.counselorRemarks = remarks;
      stage.updatedAt = new Date().toISOString();

      const user = store.users.find((u) => u.id === updatedByUserId);
      const role = user ? user.role : updatedByUserId.includes("admin") ? "admin" : "counselor";
      const counselor = store.counselorProfiles.find((c) => c.id === updatedByUserId);
      const actorName = counselor ? `${counselor.firstName} ${counselor.lastName} (Counselor)` : role === "admin" ? "GVK Admissions Admin" : "Counselor";

      this.logActivity({
        userId: updatedByUserId,
        userName: actorName,
        role: role,
        action: "JOURNEY_STAGE_COMPLETED",
        title: `Stage ${stageNumber.toString().padStart(2, "0")} Completed: ${stage.stageName}`,
        description: `Verified by ${actorName}. ${remarks || "Milestone completed."}`,
        affectedStudentId: studentId,
        entityType: "journey_stage",
        previousValue: previousStatus,
        newValue: "completed",
        context: {
          stageNumber,
          stageName: stage.stageName,
          remarks,
        },
      });

      const student = store.studentProfiles.find((s) => s.id === studentId);
      const studentName = student ? `${student.firstName} ${student.lastName}` : "Candidate";

      // Deliver real-time notification to the student
      store.notifications.unshift({
        id: `notif-${Date.now()}-stu`,
        userId: studentId,
        title: `Stage ${stageNumber} Completed: ${stage.stageName}`,
        message: `Counselor verified Stage ${stageNumber} (${stage.stageName}).`,
        category: "journey",
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      broadcastStoreChange("JOURNEY_STAGE_COMPLETED", {
        studentId,
        stageNumber,
        stage,
      });

      dispatchMongoAction("update_journey_stage", {
        studentId,
        stageNumber,
        status: "completed",
        counselorRemarks: remarks,
      });

      return {
        success: true,
        stage,
      };
    }

    // Setting stage status to in_progress, waiting_*, or not_started
    stage.status = status;
    stage.completionDate = undefined;
    if (status === "in_progress" || status === "waiting_student" || status === "waiting_counselor" || status === "waiting_university") {
      stage.startDate = stage.startDate || new Date().toISOString().split("T")[0];
    }
    if (remarks) stage.counselorRemarks = remarks;
    stage.updatedAt = new Date().toISOString();

    const counselor = store.counselorProfiles.find((c) => c.id === updatedByUserId);
    const actorName = counselor ? `${counselor.firstName} ${counselor.lastName} (Counselor)` : "Counselor";

    this.logActivity({
      userId: updatedByUserId,
      userName: actorName,
      role: "counselor",
      action: "JOURNEY_STAGE_UPDATED",
      title: `Stage ${stageNumber.toString().padStart(2, "0")} Updated: ${stage.stageName}`,
      description: `Stage ${stageNumber} status set to ${status} by ${actorName}.`,
      affectedStudentId: studentId,
      entityType: "journey_stage",
      previousValue: previousStatus,
      newValue: status,
      context: { stageNumber, stageName: stage.stageName, remarks },
    });

    broadcastStoreChange("JOURNEY_STAGE_UPDATED", {
      studentId,
      stageNumber,
      status,
      stage,
    });

    dispatchMongoAction("update_journey_stage", {
      studentId,
      stageNumber,
      status,
      counselorRemarks: remarks,
    });

    return {
      success: true,
      stage,
    };
  },

  // Tasks
  getStudentTasks(studentId: string, isCounselor: boolean = false): TaskItem[] {
    const today = new Date().toISOString().split("T")[0];
    return store.tasks
      .filter(
        (t) =>
          t.studentId === studentId &&
          (isCounselor || !t.isCounselorInternal) &&
          !t.title.includes("Aspiration Questionnaire") &&
          t.id !== "tsk-02" &&
          (isCounselor || (!t.title.toLowerCase().includes("counseling") && (t as any).relatedStageNumber !== 1))
      )
      .map((t) => {
        const app = t.applicationId ? store.applications.find((a) => a.id === t.applicationId) : null;
        return {
          id: t.id,
          title: t.title,
          description: t.description,
          assignedByName: t.assignedByName,
          dueDate: t.dueDate,
          priority: t.priority,
          status: t.status,
          applicationName: app?.universityName,
          studentNotes: t.studentSubmissionNotes,
          isOverdue: t.status !== "completed" && t.dueDate < today,
          isCounselorInternal: t.isCounselorInternal,
          completionType: (t as any).completionType || "student_submission",
          meetingUrl: (t as any).meetingUrl,
          meetingId: (t as any).meetingId,
          meetingPasscode: (t as any).meetingPasscode,
          relatedStageNumber: (t as any).relatedStageNumber,
        };
      });
  },

  getAllPlatformTasks() {
    const today = new Date().toISOString().split("T")[0];
    return store.tasks
      .filter((t) => !t.title.includes("Aspiration Questionnaire") && t.id !== "tsk-02")
      .map((t) => {
      const student = store.studentProfiles.find((s) => s.id === t.studentId);
      const counselor = store.counselorProfiles.find((c) => c.id === t.assignedByUserId);
      return {
        ...t,
        studentName: student ? `${student.firstName} ${student.lastName}` : "Unknown Student",
        studentIdCode: student?.studentIdCode || "",
        counselorName: counselor ? `${counselor.firstName} ${counselor.lastName}` : t.assignedByName,
        isOverdue: t.status !== "completed" && t.dueDate < today,
      };
    });
  },

  getAllCounselorTasks(counselorId?: string) {
    const assignedStudents = counselorId
      ? this.getAssignedStudents(counselorId).map((s) => s.id)
      : store.studentProfiles.map((s) => s.id);
    const today = new Date().toISOString().split("T")[0];

    return store.tasks
      .filter((t) => assignedStudents.includes(t.studentId))
      .map((t) => {
        const student = store.studentProfiles.find((s) => s.id === t.studentId);
        const studentName = student ? `${student.firstName} ${student.lastName}` : "Unknown";
        const isCounseling =
          t.title.toLowerCase().includes("counseling") ||
          (t as any).relatedStageNumber === 1 ||
          t.id === "tsk-01";

        return {
          ...t,
          title: isCounseling
            ? `In-Person Masters Counseling Session with ${studentName}`
            : t.title,
          description: isCounseling
            ? "Conduct offline in-person counseling session at GVK Overseas Education Center with candidate to evaluate academic profile, map out destinations, degree preferences, and review the roadmap."
            : t.description,
          studentName,
          studentIdCode: student?.studentIdCode || "",
          isOverdue: t.status !== "completed" && t.dueDate < today,
          meetingUrl: isCounseling ? undefined : (t as any).meetingUrl,
          meetingId: isCounseling ? undefined : (t as any).meetingId,
          meetingPasscode: isCounseling ? undefined : (t as any).meetingPasscode,
        };
      });
  },

  createTask(
    studentId: string,
    title: string,
    description: string,
    dueDate: string,
    priority: TaskPriority,
    assignedByUserId: string,
    isCounselorInternal: boolean = false,
    applicationId?: string
  ) {
    const counselor = store.counselorProfiles.find((c) => c.id === assignedByUserId);
    const newTask = {
      id: `tsk-${Date.now()}`,
      studentId,
      applicationId,
      title,
      description,
      assignedByUserId,
      assignedByName: counselor ? `${counselor.firstName} ${counselor.lastName}` : "Counselor",
      dueDate,
      priority,
      status: "pending" as TaskStatus,
      isCounselorInternal,
      createdAt: new Date().toISOString(),
    };

    store.tasks.push(newTask);

    this.logActivity({
      userId: assignedByUserId,
      role: "counselor",
      action: "TASK_CREATED",
      affectedStudentId: studentId,
      entityType: "task",
      newValue: { title, priority, dueDate, isCounselorInternal },
    });

    if (!isCounselorInternal) {
      store.notifications.push({
        id: `notif-${Date.now()}`,
        userId: studentId,
        title: `New Task Assigned: ${title}`,
        message: `Due date: ${dueDate}. Priority: ${priority}.`,
        category: "task",
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    dispatchMongoAction("create_task", { task: newTask });

    return newTask;
  },

  submitStudentTask(taskId: string, studentId: string, notes?: string) {
    const task = store.tasks.find((t) => t.id === taskId && t.studentId === studentId);
    if (!task) return null;

    task.status = "submitted";
    task.studentSubmissionNotes = notes || "Submitted by student for counselor verification";

    const student = store.studentProfiles.find((s) => s.id === studentId);
    const studentName = student ? `${student.firstName} ${student.lastName}` : "Student";

    this.logActivity({
      userId: studentId,
      userName: `${studentName} (Student)`,
      role: "student",
      action: "TASK_SUBMITTED",
      title: `Task Tick-Marked & Submitted: ${task.title}`,
      description: `Candidate ${studentName} tick-marked task "${task.title}" as completed/submitted.${notes ? ` Submission note: "${notes}"` : ""}`,
      affectedStudentId: studentId,
      entityType: "task",
      entityId: task.id,
      newValue: "submitted",
    });

    // 1. Deliver notifications to all counselors
    const counselors = store.counselorProfiles.filter((c) => c.isActive !== false);
    counselors.forEach((c) => {
      store.notifications.unshift({
        id: `notif-${Date.now()}-${c.id}`,
        userId: c.id,
        title: `Task Tick-Marked: ${task.title}`,
        message: `Candidate ${studentName} (${student?.studentIdCode || "Candidate"}) tick-marked task "${task.title}" as completed.${notes ? ` Note: "${notes}"` : ""}`,
        category: "task",
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    });

    // 2. Deliver notification to Admin
    store.notifications.unshift({
      id: `notif-${Date.now()}-admin`,
      userId: "admin",
      title: `Candidate Task Submitted: ${studentName}`,
      message: `${studentName} tick-marked task "${task.title}" as completed/submitted. Awaiting counselor sign-off.`,
      category: "task",
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    // 3. Deliver confirmation notification to Student
    store.notifications.unshift({
      id: `notif-${Date.now()}-stu`,
      userId: studentId,
      title: `Task Submitted: ${task.title}`,
      message: `You marked "${task.title}" as completed. Sent to counselor for review and sign-off.`,
      category: "task",
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    dispatchMongoAction("submit_task", { taskId, notes, studentId });
    broadcastStoreChange("TASK_SUBMITTED", { taskId, task });

    return task;
  },

  completeTaskByCounselor(taskId: string, counselorId: string) {
    const task = store.tasks.find((t) => t.id === taskId);
    if (!task) return null;

    task.status = "completed";

    const counselor = store.counselorProfiles.find((c) => c.id === counselorId);
    const counselorName = counselor ? `${counselor.firstName} ${counselor.lastName}` : "Counselor";
    const student = store.studentProfiles.find((s) => s.id === task.studentId);
    const studentName = student ? `${student.firstName} ${student.lastName}` : "Candidate";

    this.logActivity({
      userId: counselorId,
      userName: `${counselorName} (Counselor)`,
      role: "counselor",
      action: "TASK_COMPLETED",
      title: `Task Verified & Signed Off: ${task.title}`,
      description: `${counselorName} verified and signed off on task "${task.title}" for candidate ${studentName}.`,
      affectedStudentId: task.studentId,
      entityType: "task",
      entityId: task.id,
      newValue: "completed",
    });

    // 1. Deliver notification to student
    if (task.studentId) {
      store.notifications.unshift({
        id: `notif-${Date.now()}-${task.studentId}`,
        userId: task.studentId,
        title: `Task Approved & Signed Off: ${task.title}`,
        message: `Counselor ${counselorName} has verified and signed off on your task "${task.title}".`,
        category: "task",
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    // 2. Deliver notification to Admin
    store.notifications.unshift({
      id: `notif-${Date.now()}-admin`,
      userId: "admin",
      title: `Task Milestone Signed Off: ${task.title}`,
      message: `Counselor ${counselorName} verified and signed off on "${task.title}" for candidate ${studentName}.`,
      category: "task",
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    dispatchMongoAction("complete_task", { taskId, counselorId });

    // Real-time link: If task is Stage 1 counseling session, auto-advance Stage 1
    const isCounselingTask =
      task.id === "tsk-01" ||
      (task as any).relatedStageNumber === 1 ||
      task.title.toLowerCase().includes("counseling session");

    if (isCounselingTask && task.studentId) {
      const journey = this.getStudentJourney(task.studentId);
      const stage1 = journey.find((j) => j.stageNumber === 1);
      if (stage1 && stage1.status !== "completed") {
        this.updateJourneyStage(
          task.studentId,
          1,
          "completed",
          counselorId,
          "Initial counseling session verified and signed off by counselor."
        );
      }
    }

    broadcastStoreChange("TASK_COMPLETED", { taskId, task });

    return task;
  },

  updateTaskStatus(taskId: string, status: TaskStatus, adminNotes?: string) {
    const task = store.tasks.find((t) => t.id === taskId);
    if (!task) return null;
    task.status = status;
    if (adminNotes) {
      task.studentSubmissionNotes = adminNotes;
    }
    this.logActivity({
      userId: "usr-admin-01",
      role: "admin",
      action: "TASK_STATUS_UPDATED",
      affectedStudentId: task.studentId,
      entityType: "task",
      entityId: task.id,
      newValue: status,
    });
    broadcastStoreChange("TASK_UPDATED", { task });
    dispatchMongoAction("update_task_status", { taskId, status, adminNotes });
    return task;
  },

  // Mock Interviews
  getStudentMockInterviews(studentId: string): MockInterviewItem[] {
    return store.mockInterviews.filter((m) => m.studentId === studentId);
  },

  getAllMockInterviews(counselorId?: string): MockInterviewItem[] {
    let list = store.mockInterviews;
    if (counselorId) {
      const assignedIds = store.counselorAssignments
        .filter((a) => a.counselorId === counselorId && a.isActive)
        .map((a) => a.studentId);
      list = list.filter((m) => assignedIds.includes(m.studentId));
    }
    return list.map((m) => {
      const stu = store.studentProfiles.find((s) => s.id === m.studentId);
      return {
        ...m,
        studentName: m.studentName || (stu ? `${stu.firstName} ${stu.lastName}` : "Candidate"),
      };
    });
  },

  getCounselorDefaultZoom(counselorId: string) {
    const counselor = store.counselorProfiles.find((c) => c.id === counselorId);
    return {
      zoomUrl: counselor?.defaultZoomMeetingUrl || "https://zoom.us/start/videomeeting",
      meetingId: counselor?.defaultZoomMeetingId || "984 9012 3456",
      passcode: counselor?.defaultZoomPasscode || "GVK2026",
    };
  },

  updateCounselorDefaultZoom(
    counselorId: string,
    zoomUrl: string,
    meetingId?: string,
    passcode?: string
  ) {
    const counselor = store.counselorProfiles.find((c) => c.id === counselorId);
    const cleanUrl = zoomUrl.trim().startsWith("http") ? zoomUrl.trim() : `https://${zoomUrl.trim()}`;
    if (counselor) {
      counselor.defaultZoomMeetingUrl = cleanUrl;
      if (meetingId) counselor.defaultZoomMeetingId = meetingId.trim();
      if (passcode) counselor.defaultZoomPasscode = passcode.trim();

      // Update any scheduled interviews for this counselor to the new real link
      store.mockInterviews.forEach((interview) => {
        if (interview.counselorId === counselorId && interview.status === "scheduled") {
          interview.zoomMeetingUrl = cleanUrl;
          if (meetingId) interview.zoomMeetingId = meetingId.trim();
          if (passcode) interview.zoomPasscode = passcode.trim();
        }
      });
    }
    return {
      zoomUrl: cleanUrl,
      meetingId: meetingId || "984 9012 3456",
      passcode: passcode || "GVK2026",
    };
  },

  scheduleMockInterview(
    studentId: string,
    counselorId: string,
    title: string,
    scheduledAt: string,
    durationMinutes: number,
    instructions: string,
    zoomUrl?: string
  ) {
    const counselor = store.counselorProfiles.find((c) => c.id === counselorId);
    const student = store.studentProfiles.find((s) => s.id === studentId);

    // Auto-generate realistic, verified Zoom meeting session
    const meetingId = Math.floor(1000000000 + Math.random() * 9000000000);
    const passcode = "GVK" + Math.floor(1000 + Math.random() * 9000);
    const defaultUrl = counselor?.defaultZoomMeetingUrl || "https://zoom.us/start/videomeeting";
    const validZoomUrl = zoomUrl && zoomUrl.trim().startsWith("https://")
      ? zoomUrl.trim()
      : defaultUrl;

    const interview: MockInterviewItem & { studentId: string; counselorId: string } = {
      id: `mock-${Date.now()}`,
      studentId,
      counselorId,
      title,
      counselorName: counselor ? `${counselor.firstName} ${counselor.lastName}` : "Priya Varma",
      studentName: student ? `${student.firstName} ${student.lastName}` : "Rahul Sharma",
      scheduledAt,
      durationMinutes,
      instructions,
      zoomMeetingUrl: validZoomUrl,
      zoomMeetingId: `${String(meetingId).slice(0, 3)} ${String(meetingId).slice(3, 7)} ${String(meetingId).slice(7)}`,
      zoomPasscode: passcode,
      status: "scheduled",
      feedback: null,
    };

    store.mockInterviews.unshift(interview);

    this.logActivity({
      userId: counselorId,
      role: "counselor",
      action: "MOCK_INTERVIEW_SCHEDULED",
      affectedStudentId: studentId,
      entityType: "mock_interview",
      entityId: interview.id,
      newValue: { title, scheduledAt, zoomMeetingUrl: validZoomUrl, meetingId },
    });

    store.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: studentId,
      title: `Mock Interview Scheduled: ${title}`,
      message: `Scheduled on ${new Date(scheduledAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}. Zoom meeting link: ${validZoomUrl}`,
      category: "interview",
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    dispatchMongoAction("schedule_mock_interview", {
      session: {
        id: interview.id,
        studentId,
        counselorId,
        sessionTitle: title,
        scheduledAt,
        durationMinutes,
        instructionsForStudent: instructions,
        zoomJoinUrl: validZoomUrl,
        zoomMeetingId: interview.zoomMeetingId,
        zoomPasscode: passcode,
        status: "scheduled",
      },
    });

    return interview;
  },

  updateMockInterviewZoom(
    interviewId: string,
    counselorId: string,
    zoomMeetingUrl: string,
    zoomMeetingId?: string,
    zoomPasscode?: string
  ) {
    const interview = store.mockInterviews.find((m) => m.id === interviewId);
    if (!interview) return null;

    const trimmedUrl = zoomMeetingUrl.trim();
    interview.zoomMeetingUrl = trimmedUrl.startsWith("http") ? trimmedUrl : `https://${trimmedUrl}`;
    if (zoomMeetingId !== undefined) interview.zoomMeetingId = zoomMeetingId.trim();
    if (zoomPasscode !== undefined) interview.zoomPasscode = zoomPasscode.trim();

    this.logActivity({
      userId: counselorId,
      role: "counselor",
      action: "MOCK_INTERVIEW_ZOOM_UPDATED",
      affectedStudentId: interview.studentId,
      entityType: "mock_interview",
      entityId: interview.id,
      newValue: { zoomMeetingUrl: interview.zoomMeetingUrl, zoomMeetingId: interview.zoomMeetingId },
    });

    if (interview.studentId) {
      store.notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: interview.studentId,
        title: `Mock Interview Link Updated: ${interview.title}`,
        message: `Updated Zoom Meeting Link: ${interview.zoomMeetingUrl}. Meeting ID: ${interview.zoomMeetingId || "N/A"}, Passcode: ${interview.zoomPasscode || "N/A"}.`,
        category: "interview",
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    return interview;
  },

  cancelMockInterview(
    interviewId: string,
    counselorId: string,
    reason?: string
  ) {
    const interview = store.mockInterviews.find((m) => m.id === interviewId);
    if (!interview) return null;

    const cancelReason = reason && reason.trim() ? reason.trim() : "Cancelled by counselor";
    interview.status = "cancelled";
    interview.cancellationReason = cancelReason;
    interview.cancelledAt = new Date().toISOString();

    this.logActivity({
      userId: counselorId,
      role: "counselor",
      action: "MOCK_INTERVIEW_CANCELLED",
      affectedStudentId: interview.studentId,
      entityType: "mock_interview",
      entityId: interview.id,
      newValue: { status: "cancelled", reason: cancelReason },
    });

    if (interview.studentId) {
      store.notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: interview.studentId,
        title: `Mock Interview Cancelled: ${interview.title}`,
        message: `Your mock interview scheduled for ${new Date(interview.scheduledAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} has been cancelled by counselor ${interview.counselorName}. Reason: ${cancelReason}`,
        category: "interview",
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    return interview;
  },

  evaluateMockInterview(
    interviewId: string,
    counselorId: string,
    outcome: MockInterviewOutcome,
    strengths: string = "Clear academic profile and articulation.",
    areasForImprovement: string = "Elaborate further on career goals.",
    communicationScore: number = 8,
    academicScore: number = 8,
    visaScore: number = 8,
    studentVisibleFeedback: string = "Readiness assessment completed.",
    counselorPrivateNotes?: string
  ) {
    const interview = store.mockInterviews.find((m) => m.id === interviewId);
    if (!interview) return null;

    interview.status = "completed";
    interview.feedback = {
      outcome,
      strengths,
      areasForImprovement,
      communicationScore,
      academicClarityScore: academicScore,
      visaIntentScore: visaScore,
      studentVisibleFeedback,
      counselorPrivateNotes: counselorPrivateNotes || null,
      evaluatedAt: new Date().toISOString(),
    };

    this.logActivity({
      userId: counselorId,
      role: "counselor",
      action: "MOCK_INTERVIEW_EVALUATED",
      affectedStudentId: interview.studentId,
      entityType: "mock_interview",
      entityId: interview.id,
      newValue: { outcome, communicationScore, academicScore, visaScore },
    });

    store.notifications.push({
      id: `notif-${Date.now()}`,
      userId: interview.studentId,
      title: `Mock Interview Result: ${outcome}`,
      message:
        outcome === "PASS"
          ? "Congratulations! You passed your mock assessment and are ready for university interviews."
          : "Assessment completed. Please review counselor improvement feedback and tips.",
      category: "interview",
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    dispatchMongoAction("evaluate_mock_interview", {
      interviewId,
      outcome,
      feedbackNotes: studentVisibleFeedback,
      rating: Math.round((communicationScore + academicScore + visaScore) / 3),
    });

    return interview;
  },

  // Loans
  getStudentLoanCase(studentId: string) {
    return store.loanCases.find((l) => l.studentId === studentId) || null;
  },

  getAllLoanCases(counselorId?: string) {
    let cases = store.loanCases;
    if (counselorId) {
      const assignedIds = store.counselorAssignments
        .filter((a) => a.counselorId === counselorId && a.isActive)
        .map((a) => a.studentId);
      cases = cases.filter((l) => assignedIds.includes(l.studentId));
    }
    return cases.map((loan) => {
      const student = store.studentProfiles.find((s) => s.id === loan.studentId);
      return {
        ...loan,
        studentName: student ? `${student.firstName} ${student.lastName}` : "Unknown",
        studentIdCode: student?.studentIdCode || "",
      };
    });
  },

  updateLoanCase(
    studentId: string,
    stage: string,
    lenderName: string,
    amountRequested: number,
    sanctionAmount: number | undefined,
    counselorNotes: string,
    studentNextStep: string,
    counselorId: string
  ) {
    let loan = store.loanCases.find((l) => l.studentId === studentId);
    if (!loan) {
      loan = {
        id: `loan-${Date.now()}`,
        studentId,
        counselorId,
        stage,
        lenderName,
        amountRequested,
        sanctionAmount,
        interestRate: 10.25,
        counselorNotes,
        studentNextStep,
        updatedAt: new Date().toISOString(),
      };
      store.loanCases.push(loan);
    } else {
      loan.stage = stage;
      loan.lenderName = lenderName;
      loan.amountRequested = amountRequested;
      if (sanctionAmount !== undefined) loan.sanctionAmount = sanctionAmount;
      loan.counselorNotes = counselorNotes;
      loan.studentNextStep = studentNextStep;
      loan.updatedAt = new Date().toISOString();
    }

    this.logActivity({
      userId: counselorId,
      role: "counselor",
      action: "LOAN_CASE_UPDATED",
      affectedStudentId: studentId,
      entityType: "loan_case",
      newValue: { stage, lenderName, amountRequested, sanctionAmount },
    });

    store.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: studentId,
      title: `Loan Progress Update: ${stage.replace(/_/g, " ").toUpperCase()}`,
      message: `Lender: ${lenderName}. Next Step: ${studentNextStep || "Review updated loan details in portal."}`,
      category: "loan",
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    dispatchMongoAction("update_loan_stage", {
      studentId,
      stage,
      lenderName,
      amountRequested,
      counselorNotes,
      sanctionAmount,
      studentNextStep,
      counselorId,
    });

    return loan;
  },

  resetLoanCase(studentId: string, counselorId: string) {
    store.loanCases = store.loanCases.filter((l) => l.studentId !== studentId);
    this.logActivity({
      userId: counselorId,
      role: "counselor",
      action: "LOAN_CASE_RESET",
      title: "Education Loan Reset to Not Started",
      description: "Counselor reset loan case to uninitiated status.",
      affectedStudentId: studentId,
      entityType: "loan_case",
      newValue: "not_started",
    });
    dispatchMongoAction("update_loan_stage", {
      studentId,
      stage: "not_started",
      counselorNotes: "",
      sanctionAmount: 0,
    });
  },

  // Live Messages between Student & Counselor
  getMessages(studentId: string) {
    if (!store.messages) store.messages = [];
    return store.messages
      .filter((m) => m.studentId === studentId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  // Live Messages between Student and a specific Counselor
  getStudentCounselorMessages(studentId: string, counselorId: string) {
    if (!store.messages) store.messages = [];
    return store.messages
      .filter(
        (m) =>
          m.studentId === studentId &&
          (m.counselorId === counselorId || (!m.counselorId && counselorId === "usr-counselor-01"))
      )
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  // Multi-Counselor Advisory Threads for Student
  getStudentCounselorThreads(studentId: string) {
    if (!store.messages) store.messages = [];
    const assigned = this.getAssignedCounselor(studentId);
    const counselors = this.getAllCounselors();

    return counselors.map((c) => {
      const isPrimary = assigned?.id === c.id;
      const msgs = store.messages.filter(
        (m) => m.studentId === studentId && m.counselorId === c.id
      );
      const unreadCount = msgs.filter(
        (m) => m.senderRole === "counselor" && m.isRead !== true
      ).length;
      const lastMessage = msgs.length > 0 ? msgs[msgs.length - 1] : null;

      let roleTag = "Admissions Counselor";
      if (isPrimary) {
        roleTag = "Primary Admissions Counselor";
      } else if (c.firstName.includes("Vikram")) {
        roleTag = "Visa, Compliance & CAS Specialist";
      } else if (c.firstName.includes("Ananya")) {
        roleTag = "Applications & SOP Editorial Lead";
      } else if (c.firstName.includes("Rajesh")) {
        roleTag = "Overseas Education Loan Advisor";
      }

      return {
        counselor: c,
        isPrimary,
        roleTag,
        messageCount: msgs.length,
        unreadCount,
        lastMessage,
      };
    }).sort((a, b) => {
      if (a.isPrimary) return -1;
      if (b.isPrimary) return 1;
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (b.unreadCount > 0 && a.unreadCount === 0) return 1;
      if (a.lastMessage && b.lastMessage) {
        return b.lastMessage.createdAt.localeCompare(a.lastMessage.createdAt);
      }
      if (a.lastMessage) return -1;
      if (b.lastMessage) return 1;
      return 0;
    });
  },

  getAllMessageThreads(counselorId: string) {
    if (!store.messages) store.messages = [];
    const assigned = this.getAssignedStudents(counselorId);
    // If assigned is empty (e.g. specialist desk), allow them to view and contact candidate profiles
    const candidateList = assigned.length > 0 ? assigned : (store.studentProfiles || []);

    // Also include any student who has exchanged messages with this counselor
    const messagingStudentIds = new Set(
      store.messages.filter((m) => m.counselorId === counselorId).map((m) => m.studentId)
    );
    const combined = [...candidateList];
    (store.studentProfiles || []).forEach((s) => {
      if (messagingStudentIds.has(s.id) && !combined.some((c) => c.id === s.id)) {
        combined.push(s);
      }
    });

    return combined.map((stu) => {
      const msgs = store.messages
        .filter(
          (m) =>
            m.studentId === stu.id &&
            (m.counselorId === counselorId || (!m.counselorId && counselorId === "usr-counselor-01"))
        )
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      const unreadCount = msgs.filter(
        (m) => m.senderRole === "student" && (m.isRead === false || m.isRead === undefined)
      ).length;
      return {
        student: stu,
        messageCount: msgs.length,
        unreadCount,
        lastMessage: msgs.length > 0 ? msgs[msgs.length - 1] : null,
      };
    });
  },

  getAllCounselorPeerThreads(currentCounselorId: string) {
    if (!store.counselorProfiles) return [];
    const peers = store.counselorProfiles.filter((c) => c.id !== currentCounselorId);
    return peers.map((peer) => {
      const msgs = this.getCounselorPeerMessages(currentCounselorId, peer.id);
      const unreadCount = msgs.filter(
        (m) => m.recipientId === currentCounselorId && (m.isRead === false || m.isRead === undefined)
      ).length;
      return {
        counselor: {
          ...peer,
          name: `${peer.firstName} ${peer.lastName}`.trim(),
          email: this.getUserEmail(peer.id),
        },
        messageCount: msgs.length,
        unreadCount,
        lastMessage: msgs.length > 0 ? msgs[msgs.length - 1] : null,
      };
    }).sort((a, b) => {
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (b.unreadCount > 0 && a.unreadCount === 0) return 1;
      if (a.lastMessage && b.lastMessage) return b.lastMessage.createdAt.localeCompare(a.lastMessage.createdAt);
      if (a.lastMessage) return -1;
      if (b.lastMessage) return 1;
      return 0;
    });
  },

  sendMessage(
    studentId: string,
    counselorId: string,
    senderRole: "student" | "counselor",
    senderName: string,
    content: string
  ) {
    if (!store.messages) store.messages = [];
    const newMsg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      studentId,
      counselorId,
      senderRole,
      senderName,
      content,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    store.messages.push(newMsg);

    this.logActivity({
      userId: senderRole === "counselor" ? counselorId : studentId,
      role: senderRole,
      action: "MESSAGE_SENT",
      affectedStudentId: studentId,
      entityType: "communication_message",
      newValue: { senderRole, content: content.substring(0, 60) },
    });

    let notifDoc: any = null;
    if (senderRole === "counselor") {
      notifDoc = {
        id: `notif-${Date.now()}`,
        userId: studentId,
        title: `Message from ${senderName}`,
        message: content.length > 80 ? `${content.substring(0, 80)}...` : content,
        category: "communication",
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      store.notifications.unshift(notifDoc);
    } else {
      notifDoc = {
        id: `notif-${Date.now()}`,
        userId: counselorId,
        title: `Candidate Inquiry: ${senderName}`,
        message: content.length > 80 ? `${content.substring(0, 80)}...` : content,
        category: "communication",
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      store.notifications.unshift(notifDoc);
    }

    dispatchMongoAction("send_message", { message: newMsg, notification: notifDoc });
    broadcastStoreChange("MESSAGE_SENT", newMsg);

    return newMsg;
  },

  // Dedicated Admin <-> Counselor Messaging Desk (STRICTLY RESTRICTED FROM STUDENTS)
  getAllAdminCounselorMessages(requestingRole?: UserRole) {
    if (requestingRole === "student") {
      return []; // Strict Guard: Students CANNOT access Admin-Counselor communication
    }
    if (!store.adminCounselorMessages) store.adminCounselorMessages = [];
    return [...store.adminCounselorMessages];
  },

  getAdminCounselorMessages(counselorId: string, requestingRole?: UserRole) {
    if (requestingRole === "student") {
      return []; // Strict Guard: Students CANNOT access Admin-Counselor communication
    }
    if (!store.adminCounselorMessages) store.adminCounselorMessages = [];
    return store.adminCounselorMessages
      .filter((m) => m.counselorId === counselorId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  sendAdminCounselorMessage(
    counselorId: string,
    senderRole: "admin" | "counselor",
    senderName: string,
    content: string
  ) {
    if (!store.adminCounselorMessages) store.adminCounselorMessages = [];
    const newMsg = {
      id: `acmsg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      counselorId,
      senderRole,
      senderName,
      content,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    store.adminCounselorMessages.push(newMsg);

    this.logActivity({
      userId: senderRole === "admin" ? "usr-admin-01" : counselorId,
      userName: senderName,
      role: senderRole,
      action: "ADMIN_COUNSELOR_MESSAGE_SENT",
      title: senderRole === "admin" ? "Management Message to Counselor" : "Counselor Update to Management",
      description: `${senderName}: "${content.substring(0, 80)}"`,
      entityType: "communication",
      entityId: newMsg.id,
      affectedCounselorId: counselorId,
    });

    if (!store.notifications) store.notifications = [];
    let notifDoc: any = null;
    if (senderRole === "admin") {
      notifDoc = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId: counselorId,
        title: "New Directive from Central Management",
        message: content.length > 90 ? content.substring(0, 87) + "..." : content,
        category: "system",
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      store.notifications.push(notifDoc);
    } else {
      notifDoc = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId: "usr-admin-01",
        title: `Counselor Update: ${senderName}`,
        message: content.length > 90 ? content.substring(0, 87) + "..." : content,
        category: "system",
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      store.notifications.push(notifDoc);
    }

    dispatchMongoAction("send_admin_counselor_message", { message: newMsg, notification: notifDoc });
    broadcastStoreChange("ADMIN_COUNSELOR_MESSAGE_SENT", newMsg);
    return newMsg;
  },

  // Peer-to-Peer Counselor Collaboration Messaging
  getCounselorPeerMessages(counselorId1: string, counselorId2: string) {
    if (!store.counselorPeerMessages) store.counselorPeerMessages = [];
    return store.counselorPeerMessages
      .filter(
        (m) =>
          (m.senderId === counselorId1 && m.recipientId === counselorId2) ||
          (m.senderId === counselorId2 && m.recipientId === counselorId1)
      )
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  sendCounselorPeerMessage(
    senderId: string,
    senderName: string,
    recipientId: string,
    recipientName: string,
    content: string
  ) {
    if (!store.counselorPeerMessages) store.counselorPeerMessages = [];
    const newMsg = {
      id: `cpm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      senderId,
      senderName,
      recipientId,
      recipientName,
      content,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    store.counselorPeerMessages.push(newMsg);

    this.logActivity({
      userId: senderId,
      userName: senderName,
      role: "counselor",
      action: "PEER_COUNSELOR_MESSAGE_SENT",
      title: "Counselor Team Collaboration",
      description: `${senderName} to ${recipientName}: "${content.substring(0, 80)}"`,
      entityType: "communication",
      entityId: newMsg.id,
      affectedCounselorId: recipientId,
    });

    if (!store.notifications) store.notifications = [];
    const notifDoc = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: recipientId,
      title: `Message from Counselor ${senderName}`,
      message: content.length > 90 ? content.substring(0, 87) + "..." : content,
      category: "communication",
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    store.notifications.push(notifDoc);

    dispatchMongoAction("send_counselor_peer_message", { message: newMsg, notification: notifDoc });
    broadcastStoreChange("COUNSELOR_PEER_MESSAGE_SENT", newMsg);
    return newMsg;
  },

  markCounselorPeerMessagesAsRead(currentCounselorId: string, peerCounselorId: string) {
    if (!store.counselorPeerMessages) return;
    let modified = false;
    store.counselorPeerMessages.forEach((m) => {
      if (m.recipientId === currentCounselorId && m.senderId === peerCounselorId && m.isRead !== true) {
        m.isRead = true;
        modified = true;
      }
    });

    if (store.notifications) {
      store.notifications.forEach((n) => {
        if (
          n.userId === currentCounselorId &&
          n.category === "communication" &&
          (n.title.includes(peerCounselorId) || n.title.includes("Counselor")) &&
          !n.isRead
        ) {
          n.isRead = true;
          modified = true;
        }
      });
    }

    if (modified) {
      dispatchMongoAction("mark_counselor_peer_messages_read", { currentCounselorId, peerCounselorId });
      broadcastStoreChange("COUNSELOR_PEER_MESSAGES_READ", { currentCounselorId, peerCounselorId });
    }
  },

  getUnreadCounselorPeerMessagesCount(counselorId: string, peerCounselorId?: string): number {
    if (!store.counselorPeerMessages) return 0;
    return store.counselorPeerMessages.filter(
      (m) =>
        m.recipientId === counselorId &&
        (!peerCounselorId || m.senderId === peerCounselorId) &&
        (m.isRead === false || m.isRead === undefined)
    ).length;
  },

  // Counselor Internal Notes (Zero Student Visibility)
  getCounselorInternalNotes(studentId: string, requestingRole: UserRole) {
    if (requestingRole === "student") {
      return []; // STRICT ACCESS GUARD
    }
    return store.counselorInternalNotes.filter((n) => n.studentId === studentId);
  },

  addCounselorInternalNote(studentId: string, counselorId: string, category: string, content: string) {
    const newNote = {
      id: `note-${Date.now()}`,
      studentId,
      counselorId,
      category,
      content,
      createdAt: new Date().toISOString(),
    };
    store.counselorInternalNotes.push(newNote);
    dispatchMongoAction("add_internal_note", { note: newNote });
    return newNote;
  },

  // Unread Message Senders Count (How many distinct persons sent unread messages to this user)
  getUnreadMessageSendersCount(role: UserRole, userId?: string): number {
    if (role === "student") {
      const studentId = userId || "usr-student-01";
      if (!store.messages) return 0;
      const unread = store.messages.filter(
        (m) => m.studentId === studentId && m.senderRole === "counselor" && (m.isRead === false || m.isRead === undefined)
      );
      const senders = new Set(unread.map((m) => m.counselorId || "counselor"));
      return senders.size;
    }

    if (role === "counselor") {
      const counselorId = userId || "usr-counselor-01";
      const senders = new Set<string>();

      // 1. Students who sent unread messages to this counselor
      if (store.messages) {
        store.messages
          .filter(
            (m) =>
              (m.counselorId === counselorId || (!m.counselorId && counselorId === "usr-counselor-01")) &&
              m.senderRole === "student" &&
              (m.isRead === false || m.isRead === undefined)
          )
          .forEach((m) => senders.add(m.studentId));
      }

      // 2. Admin who sent unread messages to this counselor
      if (store.adminCounselorMessages) {
        const hasUnreadAdmin = store.adminCounselorMessages.some(
          (m) => m.counselorId === counselorId && m.senderRole === "admin" && (m.isRead === false || m.isRead === undefined)
        );
        if (hasUnreadAdmin) {
          senders.add("admin");
        }
      }

      // 3. Peer counselors who sent unread messages to this counselor
      if (store.counselorPeerMessages) {
        store.counselorPeerMessages
          .filter(
            (m) =>
              m.recipientId === counselorId &&
              (m.isRead === false || m.isRead === undefined)
          )
          .forEach((m) => senders.add(m.senderId));
      }

      return senders.size;
    }

    if (role === "admin") {
      if (!store.adminCounselorMessages) return 0;
      const unread = store.adminCounselorMessages.filter(
        (m) => m.senderRole === "counselor" && (m.isRead === false || m.isRead === undefined)
      );
      const senders = new Set(unread.map((m) => m.counselorId));
      return senders.size;
    }

    return 0;
  },

  // Mark student's incoming messages as read (called when student opens /student/counselor)
  markStudentMessagesAsRead(studentId: string, counselorId?: string) {
    if (!store.messages) return;
    let modified = false;
    store.messages.forEach((m) => {
      if (m.studentId === studentId && m.senderRole === "counselor" && m.isRead !== true) {
        if (!counselorId || m.counselorId === counselorId) {
          m.isRead = true;
          modified = true;
        }
      }
    });
    if (store.notifications) {
      store.notifications.forEach((n) => {
        if (
          n.userId === studentId &&
          (n.category === "communication" || n.title.includes("Message from")) &&
          !n.isRead
        ) {
          n.isRead = true;
          modified = true;
        }
      });
    }
    if (modified) {
      dispatchMongoAction("mark_student_messages_read", { studentId, counselorId });
      broadcastStoreChange("MESSAGES_READ", { studentId, counselorId, readerRole: "student" });
    }
  },

  // Mark counselor's incoming messages as read (called when counselor opens /counselor/communication)
  markCounselorMessagesAsRead(counselorId: string, studentId?: string) {
    let modified = false;
    if (store.messages) {
      store.messages.forEach((m) => {
        if (
          (m.counselorId === counselorId || (!m.counselorId && counselorId === "usr-counselor-01")) &&
          m.senderRole === "student" &&
          m.isRead !== true
        ) {
          if (!studentId || m.studentId === studentId) {
            m.isRead = true;
            modified = true;
          }
        }
      });
    }
    if (store.notifications) {
      store.notifications.forEach((n) => {
        if (
          (n.userId === counselorId || (!counselorId && n.userId === "usr-counselor-01")) &&
          (n.category === "communication" || n.title.includes("Candidate Inquiry") || n.title.includes("Message from")) &&
          !n.isRead
        ) {
          n.isRead = true;
          modified = true;
        }
      });
    }
    if (modified) {
      dispatchMongoAction("mark_counselor_messages_read", { counselorId, studentId });
      broadcastStoreChange("MESSAGES_READ", { counselorId, studentId, readerRole: "counselor" });
    }
  },

  // Mark admin counselor messages as read
  // When readerRole === "admin", marks messages from "counselor" as read.
  // When readerRole === "counselor", marks messages from "admin" as read.
  markAdminCounselorMessagesAsRead(counselorId?: string, readerRole: "admin" | "counselor" = "admin") {
    if (!store.adminCounselorMessages) return;
    let modified = false;
    const targetSenderRole = readerRole === "admin" ? "counselor" : "admin";
    store.adminCounselorMessages.forEach((m) => {
      if (m.senderRole === targetSenderRole && m.isRead !== true) {
        if (!counselorId || m.counselorId === counselorId) {
          m.isRead = true;
          modified = true;
        }
      }
    });
    if (store.notifications) {
      if (readerRole === "counselor") {
        store.notifications.forEach((n) => {
          if (
            (n.userId === counselorId || (!counselorId && n.userId === "usr-counselor-01")) &&
            (n.title.includes("Directive") || n.title.includes("Management")) &&
            !n.isRead
          ) {
            n.isRead = true;
            modified = true;
          }
        });
      } else {
        store.notifications.forEach((n) => {
          if (
            (n.userId === "usr-admin-01" || n.userId === "admin") &&
            (n.title.includes("Counselor Update") || n.title.includes("Counselor")) &&
            !n.isRead
          ) {
            n.isRead = true;
            modified = true;
          }
        });
      }
    }
    if (modified) {
      dispatchMongoAction("mark_admin_counselor_messages_read", { counselorId, readerRole });
      broadcastStoreChange("ADMIN_COUNSELOR_MESSAGES_READ", { counselorId, readerRole });
    }
  },

  // Notifications
  getNotifications(userId: string) {
    if (!store.notifications) return [];
    return store.notifications
      .filter((n) => {
        if (n.userId === userId) return true;
        if (n.userId === "all") return true;
        if ((userId === "admin" || userId === "usr-admin-01") && (n.userId === "admin" || n.userId === "usr-admin-01")) return true;
        if (userId.startsWith("usr-counselor") && (n.userId === "counselors" || n.userId === "all_counselors")) return true;
        if (userId.startsWith("usr-student") && (n.userId === "students" || n.userId === "all_students")) return true;
        return false;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  getUnreadNotificationsCount(userId?: string, role?: UserRole): number {
    if (!store.notifications) return 0;
    if (role === "admin" || userId === "usr-admin-01" || userId === "admin") {
      return store.notifications.filter(
        (n) => !n.isRead && (n.userId === "admin" || n.userId === "usr-admin-01" || n.userId === "all")
      ).length;
    }
    if (role === "counselor" || (userId && userId.startsWith("usr-counselor"))) {
      const targetUserId = userId || "usr-counselor-01";
      return store.notifications.filter(
        (n) => !n.isRead && (n.userId === targetUserId || n.userId === "counselors" || n.userId === "all_counselors" || n.userId === "all")
      ).length;
    }
    const targetUserId = userId || "usr-student-01";
    return store.notifications.filter(
      (n) => !n.isRead && (n.userId === targetUserId || n.userId === "students" || n.userId === "all_students" || n.userId === "all")
    ).length;
  },

  markNotificationRead(notificationId: string) {
    const notif = store.notifications.find((n) => n.id === notificationId);
    if (notif) {
      notif.isRead = true;
      notif.readAt = new Date().toISOString();
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("GVK_MASTERS_STORE_V4", JSON.stringify(store));
        } catch (e) {}
      }
      dispatchMongoAction("mark_notification_read", { notificationId });
      broadcastStoreChange("NOTIFICATION_READ", { notificationId });
    }
  },

  markAllNotificationsAsRead(userId?: string, role?: UserRole) {
    if (!store.notifications) return;
    if (role === "admin" || userId === "usr-admin-01" || userId === "admin" || userId === "all" || !userId) {
      store.notifications.forEach((n) => {
        n.isRead = true;
        n.readAt = new Date().toISOString();
      });
    } else if (role === "counselor" || (userId && userId.startsWith("usr-counselor"))) {
      const targetUserId = userId || "usr-counselor-01";
      store.notifications.forEach((n) => {
        if (n.userId === targetUserId || n.userId === "counselors" || n.userId === "all_counselors" || n.userId === "all") {
          n.isRead = true;
          n.readAt = new Date().toISOString();
        }
      });
    } else {
      const targetUserId = userId || "usr-student-01";
      store.notifications.forEach((n) => {
        if (n.userId === targetUserId || n.userId === "students" || n.userId === "all_students" || n.userId === "all") {
          n.isRead = true;
          n.readAt = new Date().toISOString();
        }
      });
    }
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("GVK_MASTERS_STORE_V4", JSON.stringify(store));
      } catch (e) {}
    }
    dispatchMongoAction("mark_all_notifications_read", { userId, role });
    broadcastStoreChange("ALL_NOTIFICATIONS_READ", { userId, role });
  },

  // Audit Logs (Unified User Activity Engine)
  logActivity(entry: Omit<ActivityLogItem, "id" | "createdAt">) {
    const resolved = this.resolveUserName(entry.userId);
    const log: ActivityLogItem = {
      ...entry,
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userName: entry.userName || resolved.name,
      role: entry.role || resolved.role,
      title: entry.title || entry.action.replace(/_/g, " "),
      description: entry.description || "",
      createdAt: new Date().toISOString(),
    };
    store.activityLogs.unshift(log); // append-only prepend
    broadcastStoreChange("ACTIVITY_LOGGED", log);
    dispatchMongoAction("log_activity", { entry: log });
    return log;
  },

  getActivityLogs(affectedStudentId?: string) {
    if (affectedStudentId) {
      return store.activityLogs.filter((l) => l.affectedStudentId === affectedStudentId);
    }
    return store.activityLogs;
  },

  // Next-Action Engine Calculation
  calculateNextAction(studentId: string): NextActionItem {
    const today = new Date().toISOString().split("T")[0];
    const studentJourney = this.getStudentJourney(studentId);
    const activeStage = studentJourney.find((s) => s.status !== "completed");
    const activeNum = activeStage ? activeStage.stageNumber : 1;

    // Stage 01 & Stage 02: Strict Sequential Milestones
    // Document Collection has NOT unlocked yet (it unlocks in Stage 03).
    // The Next Action strictly reflects the active onboarding milestone.
    if (activeNum === 1) {
      return {
        id: "stage-01-action",
        title: "In-Person Masters Counseling Session",
        description: "Attend your 1-on-1 offline consultation at GVK Overseas Education Center with Senior Counselor Priya Varma to finalize study destinations and degree specializations.",
        deadline: "In Progress",
        priority: "urgent",
        actionType: "attend_counseling",
        actionUrl: "/student/journey?stage=1",
        actionButtonLabel: "View Session Details →",
        responsibleParty: "counselor",
      };
    }

    if (activeNum === 2) {
      return {
        id: "stage-02-action",
        title: "Academic Profile Evaluation in Progress",
        description: "Your counselor Priya Varma is conducting your academic profile evaluation. Stage 03 (Document Collection) will unlock upon counselor sign-off.",
        deadline: "In Progress",
        priority: "medium",
        actionType: "view_evaluation",
        actionUrl: "/student/journey?stage=2",
        actionButtonLabel: "View Evaluation Progress →",
        responsibleParty: "counselor",
      };
    }

    // Priority 1: Overdue or Urgent tasks assigned to student
    const urgentTasks = store.tasks.filter(
      (t) =>
        t.studentId === studentId &&
        !t.isCounselorInternal &&
        (t.status === "pending" || t.status === "in_progress") &&
        !t.title.includes("Aspiration Questionnaire") &&
        t.id !== "tsk-02"
    );

    const urgentTask = urgentTasks.find((t) => t.priority === "urgent") || urgentTasks.find((t) => t.dueDate <= today) || urgentTasks[0];
    if (urgentTask) {
      const isCounselingTask = urgentTask.title.toLowerCase().includes("counseling");
      return {
        id: urgentTask.id,
        title: urgentTask.title,
        description: urgentTask.description || "Action required from student.",
        deadline: urgentTask.dueDate,
        priority: urgentTask.priority,
        actionType: isCounselingTask ? "attend_counseling" : "complete_task",
        actionUrl: isCounselingTask ? "/student/counselor" : "/student/tasks",
        actionButtonLabel: isCounselingTask ? "View Session Details →" : "View & Submit Task",
        relatedEntityId: urgentTask.id,
        responsibleParty: "student",
      };
    }

    // Priority 2: Document resubmission required (Only applicable once Stage 03 is reached)
    const rejectedDoc = store.documents.find(
      (d) => d.studentId === studentId && (d.verificationStatus === "resubmission_required" || d.verificationStatus === "rejected")
    );
    if (rejectedDoc) {
      return {
        id: rejectedDoc.id,
        title: `Resubmit ${rejectedDoc.title}`,
        description: rejectedDoc.counselorComments || "Your counselor requested corrections before proceeding.",
        deadline: "Immediate Attention",
        priority: "high",
        actionType: "upload_document",
        actionUrl: "/student/documents",
        actionButtonLabel: "Upload Corrected Document",
        relatedEntityId: rejectedDoc.id,
        responsibleParty: "student",
      };
    }

    // Priority 3: Upcoming Mock Interview within 48 hours
    const upcomingInterview = store.mockInterviews.find(
      (m) => m.studentId === studentId && m.status === "scheduled"
    );
    if (upcomingInterview) {
      return {
        id: upcomingInterview.id,
        title: `Attend Mock Interview: ${upcomingInterview.title}`,
        description: `Scheduled with ${upcomingInterview.counselorName}. Read instructions and test your Zoom setup.`,
        deadline: upcomingInterview.scheduledAt,
        priority: "high",
        actionType: "attend_interview",
        actionUrl: "/student/mock-interview",
        actionButtonLabel: "Open Interview Details",
        relatedEntityId: upcomingInterview.id,
        responsibleParty: "student",
      };
    }

    // Priority 4: Deposit payment pending on conditional/unconditional offer
    const depositApp = store.applications.find(
      (a) => a.studentId === studentId && (a.currentStatus === "conditional_offer" || a.currentStatus === "unconditional_offer") && a.depositStatus === "pending" && a.depositDeadline
    );
    if (depositApp) {
      return {
        id: depositApp.id,
        title: `Pay Tuition Deposit for ${depositApp.universityName}`,
        description: `Secure your admission offer before the deposit deadline (${depositApp.depositDeadline}).`,
        deadline: depositApp.depositDeadline!,
        priority: "high",
        actionType: "pay_deposit",
        actionUrl: "/student/universities",
        actionButtonLabel: "View Deposit Details",
        relatedEntityId: depositApp.id,
        responsibleParty: "student",
      };
    }

    // Priority 5: Waiting for Counselor verification (Documents under review at Stage 03+)
    const docsUnderReview = store.documents.filter(
      (d) => d.studentId === studentId && d.verificationStatus === "under_review"
    );
    if (docsUnderReview.length > 0) {
      return {
        id: "waiting-counselor",
        title: "Documents Under Counselor Review",
        description: `${docsUnderReview.length} document(s) are currently being verified by your assigned counselor.`,
        deadline: "In Progress",
        priority: "medium",
        actionType: "waiting_counselor",
        actionUrl: "/student/documents",
        actionButtonLabel: "Check Document Status",
        responsibleParty: "counselor",
      };
    }

    if (activeNum === 3) {
      return {
        id: "stage-03-action",
        title: "Stage 03: Upload Required Application Documents",
        description: "Stage 03 is unlocked! Upload your transcripts, degree certificate, and passport to the GVK Document Vault for verification.",
        deadline: "Action Required",
        priority: "high",
        actionType: "upload_document",
        actionUrl: "/student/documents",
        actionButtonLabel: "Go to Document Vault →",
        responsibleParty: "student",
      };
    }

    if (activeNum === 4) {
      return {
        id: "stage-04-action",
        title: "Curate Overseas University Shortlist",
        description: "Select dream, target, and safe universities from the UK institutions catalog.",
        deadline: "Action Required",
        priority: "high",
        actionType: "shortlist_universities",
        actionUrl: "/student/universities",
        actionButtonLabel: "Shortlist Universities →",
        responsibleParty: "student",
      };
    }

    // Default: Waiting on universities
    return {
      id: "all-good",
      title: "Applications Under University Review",
      description: "All pending student deliverables are up to date. GVK is actively tracking university admission responses.",
      deadline: "Ongoing",
      priority: "low",
      actionType: "waiting_university",
      actionUrl: "/student/universities",
      actionButtonLabel: "Track Applications",
      responsibleParty: "university",
    };
  },
};
