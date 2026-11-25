import { getDb } from "../lib/mongodb";

async function run() {
  const db = await getDb();
  console.log("Connecting to MongoDB...");

  // Stages 1..4: completed (as shown in user's screenshot)
  await db.collection("journey_records").updateMany(
    { studentId: "usr-student-01", stageNumber: { $lte: 4 } },
    {
      $set: {
        status: "completed",
        completionDate: "2026-11-25",
        startDate: "2026-11-19",
        updatedAt: new Date().toISOString(),
      },
    }
  );

  // Stage 5: in_progress (Application Submission active, as shown in user's screenshot)
  await db.collection("journey_records").updateOne(
    { studentId: "usr-student-01", stageNumber: 5 },
    {
      $set: {
        status: "in_progress",
        startDate: "2026-11-25",
        updatedAt: new Date().toISOString(),
      },
      $unset: {
        completionDate: "",
      },
    }
  );

  // Stages 6..25: not_started
  await db.collection("journey_records").updateMany(
    { studentId: "usr-student-01", stageNumber: { $gt: 5 } },
    {
      $set: {
        status: "not_started",
        updatedAt: new Date().toISOString(),
      },
      $unset: {
        completionDate: "",
        startDate: "",
      },
    }
  );

  console.log("Successfully set journey for usr-student-01: Stages 1..4 completed, Stage 5 in_progress, Stages 6..25 not_started.");
  process.exit(0);
}

run().catch((err) => {
  console.error("Error updating journey:", err);
  process.exit(1);
});
