import { getDb } from "../lib/mongodb";

async function run() {
  const db = await getDb();
  console.log("Connected to MongoDB Atlas...");

  // 1. Purge Ananya Reddy (usr-student-02) completely across ALL collections
  console.log("Purging all traces of Ananya Reddy (usr-student-02)...");
  await db.collection("users").deleteMany({ id: "usr-student-02" });
  await db.collection("student_profiles").deleteMany({ id: "usr-student-02" });
  await db.collection("academic_profiles").deleteMany({ studentId: "usr-student-02" });
  await db.collection("counselor_assignments").deleteMany({ studentId: "usr-student-02" });
  await db.collection("journey_records").deleteMany({ studentId: "usr-student-02" });
  await db.collection("tasks").deleteMany({ studentId: "usr-student-02" });
  await db.collection("notifications").deleteMany({ userId: "usr-student-02" });
  await db.collection("activity_logs").deleteMany({
    $or: [{ affectedStudentId: "usr-student-02" }, { userId: "usr-student-02" }],
  });
  await db.collection("counselor_internal_notes").deleteMany({ studentId: "usr-student-02" });

  // 2. Clear all applications (Rahul is Stage 01, applications unlock at Stage 05)
  await db.collection("applications").deleteMany({});
  console.log("Cleared applications (0 lodged on Day 1)");

  // 3. Clear all documents (Rahul is Stage 01, document collection is Stage 03)
  await db.collection("documents").deleteMany({});
  console.log("Cleared documents (0 uploaded on Day 1)");

  // 4. Clear all mock interviews (Rahul is Stage 01, mock interviews are Stage 07)
  await db.collection("mock_interviews").deleteMany({});
  console.log("Cleared mock interviews (0 scheduled on Day 1)");

  // 5. Clear all loan cases (loan process uninitiated on Day 1)
  await db.collection("loan_cases").deleteMany({});
  console.log("Cleared loan cases (loan not started on Day 1)");

  // 6. Reset Journey for usr-student-01: Stage 01 in_progress, Stages 02-22 not_started
  const stage1Update = await db.collection("journey_records").updateOne(
    { studentId: "usr-student-01", stageNumber: 1 },
    {
      $set: {
        status: "in_progress",
        startDate: "2026-11-19",
        counselorRemarks:
          "Initial 1-on-1 counseling session scheduled to establish overseas destinations, intake planning, and degree specialization.",
        updatedAt: new Date().toISOString(),
      },
      $unset: {
        completionDate: "",
      },
    }
  );
  console.log("Updated Stage 1 for student-01:", stage1Update.modifiedCount);

  const stagesRestUpdate = await db.collection("journey_records").updateMany(
    { studentId: "usr-student-01", stageNumber: { $gt: 1 } },
    {
      $set: {
        status: "not_started",
        updatedAt: new Date().toISOString(),
      },
      $unset: {
        startDate: "",
        completionDate: "",
        counselorRemarks: "",
      },
    }
  );
  console.log("Reset Stages 2-22 for student-01:", stagesRestUpdate.modifiedCount);

  // 7. Reset Tasks for usr-student-01 (Only the 2 onboarding tasks)
  await db.collection("tasks").deleteMany({ studentId: "usr-student-01" });
  await db.collection("tasks").insertMany([
    {
      id: "tsk-01",
      studentId: "usr-student-01",
      title: "Attend Initial 1-on-1 Masters Counseling Session with Priya Varma",
      description:
        "Connect via live Zoom video session with your assigned counselor Priya Varma to map out your overseas destinations, degree preferences, and review the 22-stage roadmap.",
      assignedByUserId: "usr-counselor-01",
      assignedByName: "Priya Varma",
      dueDate: "2026-11-20",
      priority: "urgent",
      status: "pending",
      isCounselorInternal: false,
      completionType: "counselor_signoff",
      relatedStageNumber: 1,
      meetingUrl: "https://zoom.us/start/videomeeting",
      meetingId: "984 9012 3456",
      meetingPasscode: "GVK2026",
      createdAt: "2026-11-19T09:00:00Z",
    },
  ]);
  console.log("Inserted fresh Stage 01 onboarding tasks for student-01");

  // 8. Reset student_profile for usr-student-01
  await db.collection("student_profiles").updateOne(
    { id: "usr-student-01" },
    {
      $unset: {
        finalDestinationUniversity: "",
        finalDestinationAppId: "",
      },
    }
  );
  console.log("Cleaned student profile destination for student-01");

  // 9. Reset Messages for usr-student-01 (Pristine Day 1: 0 messages)
  await db.collection("messages").deleteMany({});
  console.log("Cleared messages (0 messages across entire platform)");

  // 10. Reset Notifications for usr-student-01
  await db.collection("notifications").deleteMany({});
  await db.collection("notifications").insertMany([
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
      title: "Stage 01 Counseling Session Scheduled",
      message: "Connect with Priya Varma via live Zoom consultation to establish your target destinations.",
      category: "journey",
      isRead: false,
      createdAt: "2026-11-19T09:05:00Z",
    },
    {
      id: "notif-03",
      userId: "usr-student-01",
      title: "Action Item Assigned: Attend Counseling Session",
      message: "Your counselor assigned your onboarding counseling deliverable due 2026-11-20.",
      category: "task",
      isRead: false,
      createdAt: "2026-11-19T09:10:00Z",
    },
  ]);
  console.log("Reset notifications for student-01 with Day 1 milestones");

  // 11. Reset Activity Logs for usr-student-01
  await db.collection("activity_logs").deleteMany({});
  await db.collection("activity_logs").insertMany([
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
  ]);
  console.log("Reset activity logs for student-01");

  // 12. Reset Counselor Internal Notes for usr-student-01
  await db.collection("counselor_internal_notes").deleteMany({});
  await db.collection("counselor_internal_notes").insertOne({
    id: "note-01",
    studentId: "usr-student-01",
    counselorId: "usr-counselor-01",
    category: "academic_risk",
    content:
      "Initial onboarding profile verified. Rahul Sharma has strong undergraduate background (8.45 CGPA) targeting UK Russell Group Fall 2026. Scheduled Stage 01 counseling session to establish university tiers and intake window.",
    createdAt: "2026-11-19T09:00:00Z",
  });
  console.log("Reset counselor internal notes for student-01");

  console.log("MongoDB synchronization complete! Sole student is Rahul Sharma (Day 1 Stage 01).");
  process.exit(0);
}

run().catch((err) => {
  console.error("Error during Mongo sync:", err);
  process.exit(1);
});
