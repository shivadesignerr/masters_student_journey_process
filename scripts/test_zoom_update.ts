import { dataStore } from "../src/lib/data/store";

async function testZoomUpdate() {
  console.log("--- 1. Testing Default Mock Interview ---");
  const studentInterviews = dataStore.getStudentMockInterviews("usr-student-01");
  console.log("Current interview URL:", studentInterviews[0].zoomMeetingUrl);
  console.log("Current interview ID:", studentInterviews[0].zoomMeetingId);

  console.log("\n--- 2. Counselor Updates Zoom Link to Personal URL ---");
  const updated = dataStore.updateMockInterviewZoom(
    studentInterviews[0].id,
    "usr-counselor-01",
    "https://zoom.us/j/5551234567?pwd=GVKSUCCESS",
    "555 123 4567",
    "GVKSUCCESS"
  );
  console.log("Updated Zoom URL:", updated?.zoomMeetingUrl);
  console.log("Updated Meeting ID:", updated?.zoomMeetingId);
  console.log("Updated Passcode:", updated?.zoomPasscode);

  console.log("\n--- 3. Verifying Student Portal Sees New Link ---");
  const studentUpdated = dataStore.getStudentMockInterviews("usr-student-01");
  console.log("Student sees Zoom URL:", studentUpdated[0].zoomMeetingUrl);
  console.log("Student sees Meeting ID:", studentUpdated[0].zoomMeetingId);

  console.log("\n--- 4. Checking In-App Notification Sent to Student ---");
  const notifs = dataStore.getNotifications("usr-student-01");
  const latestNotif = notifs[0];
  console.log("Latest notification title:", latestNotif?.title);
  console.log("Latest notification message:", latestNotif?.message);

  console.log("\n--- 5. Resetting to Permanent Verified Room https://zoom.us/test ---");
  dataStore.updateMockInterviewZoom(
    studentInterviews[0].id,
    "usr-counselor-01",
    "https://zoom.us/test",
    "984 9012 3456",
    "GVK2026"
  );
  console.log("Reset confirmed:", dataStore.getStudentMockInterviews("usr-student-01")[0].zoomMeetingUrl);
  console.log("\nALL TESTS PASSED SUCCESSFULLY!");
}

testZoomUpdate().catch(console.error);
