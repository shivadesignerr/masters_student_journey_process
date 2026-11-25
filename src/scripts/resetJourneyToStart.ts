import { getDb } from "../lib/mongodb";

async function run() {
  const db = await getDb();
  console.log("Connecting to MongoDB...");

  // Stage 1: in_progress, NOT completed
  await db.collection("journey_records").updateOne(
    { studentId: "usr-student-01", stageNumber: 1 },
    {
      $set: {
        status: "in_progress",
        startDate: "2026-11-19",
        updatedAt: new Date().toISOString(),
      },
      $unset: {
        completionDate: "",
      },
    }
  );

  // Stages 2..25: not_started, NOT completed
  await db.collection("journey_records").updateMany(
    { studentId: "usr-student-01", stageNumber: { $gt: 1 } },
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

  console.log("Successfully reset journey records for usr-student-01: Stage 1 in_progress, Stages 2..25 not_started.");
  process.exit(0);
}

run().catch((err) => {
  console.error("Error resetting journey:", err);
  process.exit(1);
});
