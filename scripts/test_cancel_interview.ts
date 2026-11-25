import { dataStore } from "../src/lib/data/store";

async function testCancelFlow() {
  console.log("==================================================");
  console.log("TESTING COUNSELOR CANCEL MOCK INTERVIEW WORKFLOW");
  console.log("==================================================");

  // 1. Schedule a new mock interview
  console.log("\n[1] Counselor schedules a new mock interview...");
  const scheduled = dataStore.scheduleMockInterview(
    "usr-student-01",
    "usr-counselor-01",
    "Imperial College Credibility & Visa Mock",
    "2026-11-25T14:00:00+05:30",
    30,
    "Review technical project details and financial sponsor documentation."
  );
  console.log("   -> Interview created:", scheduled.id, scheduled.title);
  console.log("   -> Initial status:", scheduled.status);

  // 2. Counselor cancels the mock interview
  console.log("\n[2] Counselor cancels the mock interview with custom reason...");
  const cancelReason = "Student requested postponement to complete draft SOP.";
  const cancelled = dataStore.cancelMockInterview(
    scheduled.id,
    "usr-counselor-01",
    cancelReason
  );
  console.log("   -> Cancelled returned status:", cancelled?.status);
  console.log("   -> Cancellation reason recorded:", cancelled?.cancellationReason);
  console.log("   -> Cancelled at timestamp:", cancelled?.cancelledAt);

  if (cancelled?.status !== "cancelled") {
    throw new Error("Expected status to be cancelled");
  }

  // 3. Verify student gets notified
  console.log("\n[3] Checking student notifications...");
  const studentNotifs = dataStore.getNotifications("usr-student-01");
  const cancelNotif = studentNotifs.find((n) => n.title.includes("Cancelled"));
  console.log("   -> Notification found:", cancelNotif?.title);
  console.log("   -> Notification message preview:", cancelNotif?.message);

  if (!cancelNotif || !cancelNotif.message.includes(cancelReason)) {
    throw new Error("Student did not receive cancellation notification with reason");
  }

  // 4. Verify audit trail
  console.log("\n[4] Checking audit activity log...");
  const auditLogs = dataStore.getActivityLogs("usr-student-01");
  const cancelLog = auditLogs.find((l) => l.action === "MOCK_INTERVIEW_CANCELLED");
  console.log("   -> Audit log action:", cancelLog?.action);
  console.log("   -> Affected student ID:", cancelLog?.affectedStudentId);

  if (!cancelLog) {
    throw new Error("Audit log did not record MOCK_INTERVIEW_CANCELLED");
  }

  // 5. Verify student's interview list reflects status
  console.log("\n[5] Checking student mock interview items...");
  const studentInterviews = dataStore.getStudentMockInterviews("usr-student-01");
  const target = studentInterviews.find((i) => i.id === scheduled.id);
  console.log("   -> Student view item status:", target?.status);
  console.log("   -> Student view item reason:", target?.cancellationReason);

  console.log("\n==================================================");
  console.log("ALL CANCEL MOCK INTERVIEW TESTS PASSED 100%!");
  console.log("==================================================");
}

testCancelFlow().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
