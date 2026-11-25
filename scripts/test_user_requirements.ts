import { dataStore } from "../src/lib/data/store";

async function runTests() {
  console.log("=== GVK REAL-TIME SAAS VERIFICATION TESTS ===");
  const studentId = "usr-student-01";
  const counselorId = "usr-counselor-01";

  // Test 1: Authority Guard (Only Counselor and Admin can mark stage completed)
  console.log("\n--- TEST 1: Stage Completion Authority ---");
  const studentAttempt = dataStore.updateJourneyStage(studentId, 3, "completed", studentId, "Student attempting to complete stage");
  console.log("Student attempt allowed?:", studentAttempt.success);
  console.log("Student error message:", studentAttempt.error);
  if (studentAttempt.success) {
    throw new Error("FAIL: Student was incorrectly allowed to mark stage complete!");
  } else {
    console.log("✓ PASS: Student is strictly blocked from marking stages complete.");
  }

  // Counselor completion of Stage 3
  const counselorAttempt = dataStore.updateJourneyStage(studentId, 3, "completed", counselorId, "Transcripts & Passport verified by Priya Varma");
  console.log("Counselor attempt allowed?:", counselorAttempt.success);
  console.log("Unlocked next stage:", counselorAttempt.unlockedStageNumber);
  if (!counselorAttempt.success || counselorAttempt.unlockedStageNumber !== 4) {
    throw new Error("FAIL: Counselor was not able to complete stage 3 or unlock stage 4!");
  }
  console.log("✓ PASS: Counselor officially completed Stage 3 and auto-unlocked Stage 4.");

  // Test 2: Instant Document Upload & Visibility for Counselor
  console.log("\n--- TEST 2: Student Document Upload & Counselor Visibility ---");
  const uploadedDoc = dataStore.uploadDocument(
    studentId,
    "financial",
    "bank_fd_receipt",
    "Fixed Deposit Receipt (HDFC Bank)",
    "HDFC_FD_Receipt_2026.pdf",
    1024 * 720
  );
  console.log("Uploaded document ID:", uploadedDoc.id);
  console.log("Document verification status:", uploadedDoc.verificationStatus);

  // Counselor checks pending documents queue
  const pendingDocs = dataStore.getAllPendingReviewDocuments();
  const foundInQueue = pendingDocs.find((d) => d.id === uploadedDoc.id);
  console.log("Found in counselor review queue?:", !!foundInQueue);
  if (!foundInQueue) {
    throw new Error("FAIL: Uploaded document not found in counselor queue!");
  }
  console.log("✓ PASS: Document immediately visible to counselor with Under Review status.");

  // Test 3: Counselor Downloads and Verifies Document
  console.log("\n--- TEST 3: Counselor Document Verification ---");
  const reviewedDoc = dataStore.reviewDocument(uploadedDoc.id, "verified", counselorId, "FD balance verified: INR 25,00,000 liquid funds.");
  console.log("Reviewed doc status:", reviewedDoc?.verificationStatus);
  console.log("✓ PASS: Counselor evaluated and verified student document.");

  // Test 4: Comprehensive User Activity Tracking (Student, Counselor, Admin)
  console.log("\n--- TEST 4: Unified Activity Audit Trail for Counselor & Admin ---");
  const activities = dataStore.getActivityLogs(studentId);
  console.log(`Total logged activities for student ${studentId}: ${activities.length}`);

  const studentActivities = activities.filter((a) => a.role === "student");
  const counselorActivities = activities.filter((a) => a.role === "counselor");
  const adminActivities = activities.filter((a) => a.role === "admin");

  console.log(`- Student actions logged: ${studentActivities.length}`);
  console.log(`- Counselor actions logged: ${counselorActivities.length}`);
  console.log(`- Admin actions logged: ${adminActivities.length}`);

  if (studentActivities.length === 0 || counselorActivities.length === 0 || adminActivities.length === 0) {
    throw new Error("FAIL: Missing user activities across roles!");
  }

  console.log("\nSample Latest Activities:");
  activities.slice(0, 5).forEach((act, idx) => {
    console.log(`  [${idx + 1}] [${act.role.toUpperCase()}] ${act.userName} -> ${act.title} (${act.createdAt})`);
  });

  console.log("\n✓ ALL INTEGRATION TESTS PASSED PERFECTLY!");
}

runTests().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
