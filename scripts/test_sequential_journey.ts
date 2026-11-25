import { dataStore } from "../src/lib/data/store";

console.log("=== Testing Sequential Stage Progression ===");
const journey = dataStore.getStudentJourney("usr-student-01");
console.log(`Loaded ${journey.length} stages for Rahul Sharma.`);
console.log(`Stage 1: ${journey[0].stageName} -> ${journey[0].status}`);
console.log(`Stage 2: ${journey[1].stageName} -> ${journey[1].status}`);
console.log(`Stage 3: ${journey[2].stageName} -> ${journey[2].status}`);
console.log(`Stage 4: ${journey[3].stageName} -> ${journey[3].status}`);

// 1. Attempt invalid completion (Stage 5 when Stage 3 is not complete)
const resFail = dataStore.updateJourneyStage("usr-student-01", 5, "completed", "usr-counselor-01");
console.log("\n[TEST 1] Illegal jump to Stage 5:");
console.log("Success:", resFail.success);
console.log("Error message:", resFail.error);

// 2. Complete Stage 3 sequentially
const resPass3 = dataStore.updateJourneyStage("usr-student-01", 3, "completed", "usr-counselor-01", "Transcripts and SOP verified.");
console.log("\n[TEST 2] Complete Stage 3:");
console.log("Success:", resPass3.success);
console.log("Unlocked Stage:", resPass3.unlockedStageNumber);
const jAfter3 = dataStore.getStudentJourney("usr-student-01");
console.log("Stage 3 Status:", jAfter3[2].status, "Stage 4 Status:", jAfter3[3].status);

// 3. Complete Stage 4 sequentially
const resPass4 = dataStore.updateJourneyStage("usr-student-01", 4, "completed", "usr-counselor-01", "Manchester, Birmingham, Warwick shortlisted.");
console.log("\n[TEST 3] Complete Stage 4:");
console.log("Success:", resPass4.success);
console.log("Unlocked Stage:", resPass4.unlockedStageNumber);
const jAfter4 = dataStore.getStudentJourney("usr-student-01");
console.log("Stage 4 Status:", jAfter4[3].status, "Stage 5 Status:", jAfter4[4].status);

// 4. Attempt to reopen Stage 3 while Stage 4 is completed
const resReopenFail = dataStore.updateJourneyStage("usr-student-01", 3, "in_progress", "usr-counselor-01");
console.log("\n[TEST 4] Reopening Stage 3 while Stage 4 is complete:");
console.log("Success:", resReopenFail.success);
console.log("Error message:", resReopenFail.error);

// 5. Reopen Stage 4
const resReopen4 = dataStore.updateJourneyStage("usr-student-01", 4, "in_progress", "usr-counselor-01");
console.log("\n[TEST 5] Reopening Stage 4:");
console.log("Success:", resReopen4.success);
const jAfterReopen4 = dataStore.getStudentJourney("usr-student-01");
console.log("Stage 4 Status:", jAfterReopen4[3].status, "Stage 5 Status:", jAfterReopen4[4].status);

// 6. Now reopen Stage 3
const resReopen3 = dataStore.updateJourneyStage("usr-student-01", 3, "in_progress", "usr-counselor-01");
console.log("\n[TEST 6] Reopening Stage 3 after Stage 4 reopened:");
console.log("Success:", resReopen3.success);
const jAfterReopen3 = dataStore.getStudentJourney("usr-student-01");
console.log("Stage 3 Status:", jAfterReopen3[2].status, "Stage 4 Status:", jAfterReopen3[3].status);
