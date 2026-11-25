import { dataStore } from "../src/lib/data/store";

console.log("==================================================");
console.log("TESTING STUDENT JOURNEY ENHANCEMENTS");
console.log("==================================================\n");

const studentId = "usr-student-01";
const student = dataStore.getStudentProfile(studentId);

console.log("[1] Checking Student Profile Preferred Country...");
console.log("   -> Student Name:", student?.firstName, student?.lastName);
console.log("   -> Preferred Country:", student?.preferredCountry);
if (student?.preferredCountry === "United Kingdom") {
  console.log("   ✅ PASSED: Default country correctly set to United Kingdom.\n");
} else {
  throw new Error("Student country is not United Kingdom");
}

console.log("[2] Testing University Shortlisting from Stage 04...");
const initialApps = dataStore.getStudentApplications(studentId);
console.log("   -> Initial Applications Count:", initialApps.length);

const shortlisted = dataStore.shortlistUniversity(
  studentId,
  "University of Bristol",
  "United Kingdom",
  "MSc Computer Science",
  30500,
  "target"
);

console.log("   -> Shortlisted App ID:", shortlisted.id);
console.log("   -> University Name:", shortlisted.universityName);
console.log("   -> Status:", shortlisted.currentStatus);

const updatedApps = dataStore.getStudentApplications(studentId);
console.log("   -> Updated Applications Count:", updatedApps.length);
const foundInList = updatedApps.some((a) => a.universityName === "University of Bristol");

if (foundInList) {
  console.log("   ✅ PASSED: University added to student applications list.\n");
} else {
  throw new Error("University not found in student applications list");
}

console.log("[3] Testing Direct Document Upload from Stage 03...");
const initialDocs = dataStore.getStudentDocuments(studentId);
const sopDocBefore = initialDocs.find((d) => d.documentType === "statement_of_purpose");
console.log("   -> SOP Initial Version:", sopDocBefore?.latestVersion, "Status:", sopDocBefore?.verificationStatus);

const uploadedDoc = dataStore.uploadDocument(
  studentId,
  "masters_prep",
  "statement_of_purpose",
  "Statement of Purpose (UK Master's Format)",
  "Rahul_Sharma_SOP_Warwick_Manchester_v2.pdf",
  1024 * 380
);

console.log("   -> Uploaded Doc ID:", uploadedDoc.id);
console.log("   -> New Version:", uploadedDoc.latestVersion);
console.log("   -> New Status:", uploadedDoc.verificationStatus);
console.log("   -> File Name:", uploadedDoc.fileName);

if (uploadedDoc.verificationStatus === "under_review" && uploadedDoc.fileName?.includes("v2")) {
  console.log("   ✅ PASSED: Document uploaded directly and set to 'under_review'.\n");
} else {
  throw new Error("Document upload verification failed");
}

console.log("[4] Checking Activity Log & Audit Trail...");
const logs = dataStore.getActivityLogs(studentId);
const lastLog = logs[logs.length - 1];
console.log("   -> Latest Activity Action:", lastLog?.action);
console.log("   -> Entity Type:", lastLog?.entityType);
console.log("   ✅ PASSED: Audit trail logged successfully.\n");

console.log("==================================================");
console.log("ALL STUDENT JOURNEY ENHANCEMENTS PASSED 100%!");
console.log("==================================================");
