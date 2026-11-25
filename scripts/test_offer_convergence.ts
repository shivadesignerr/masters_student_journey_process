import { dataStore } from "../src/lib/data/store";

console.log("=== Testing Single University Offer Acceptance Convergence ===");
const apps = dataStore.getStudentApplications("usr-student-01");
console.log(`Loaded ${apps.length} applications for Rahul Sharma.`);
apps.forEach((a) => {
  console.log(`- ${a.universityName} | Status: ${a.currentStatus} | Decision: ${a.decisionStatus} | Final: ${a.isFinalDestination}`);
});

console.log("\n[TEST 1] Accept Manchester as primary destination:");
const res1 = dataStore.acceptUniversityOffer("usr-student-01", "app-01", "usr-student-01");
console.log("Success:", res1.success);
const final1 = dataStore.getStudentFinalDestination("usr-student-01");
console.log("Confirmed Destination:", final1?.universityName);

const appsAfter1 = dataStore.getStudentApplications("usr-student-01");
appsAfter1.forEach((a) => {
  console.log(`- ${a.universityName} | Status: ${a.currentStatus} | Decision: ${a.decisionStatus} | Final: ${a.isFinalDestination}`);
});

console.log("\n[TEST 2] Switch destination to Leeds:");
const res2 = dataStore.acceptUniversityOffer("usr-student-01", "app-04", "usr-student-01");
console.log("Success:", res2.success);
const final2 = dataStore.getStudentFinalDestination("usr-student-01");
console.log("New Confirmed Destination:", final2?.universityName);

const appsAfter2 = dataStore.getStudentApplications("usr-student-01");
appsAfter2.forEach((a) => {
  console.log(`- ${a.universityName} | Status: ${a.currentStatus} | Decision: ${a.decisionStatus} | Final: ${a.isFinalDestination}`);
});
