import { getDb } from "../src/lib/mongodb";
import { initialStore } from "../src/lib/data/store";

async function seed() {
  console.log("Starting MongoDB seeding for GVK Masters Platform...");
  try {
    const db = await getDb();
    console.log(`Connected to target database: ${db.databaseName}`);

    const collections = [
      { name: "users", data: initialStore.users },
      { name: "student_profiles", data: initialStore.studentProfiles },
      { name: "counselor_profiles", data: initialStore.counselorProfiles },
      { name: "counselor_assignments", data: initialStore.counselorAssignments },
      { name: "universities", data: initialStore.universities },
      { name: "applications", data: initialStore.applications },
      { name: "documents", data: initialStore.documents },
      { name: "journey_records", data: initialStore.journeyRecords },
      { name: "tasks", data: initialStore.tasks },
      { name: "mock_interviews", data: initialStore.mockInterviews },
      { name: "loan_cases", data: initialStore.loanCases },
      { name: "counselor_internal_notes", data: initialStore.counselorInternalNotes },
      { name: "messages", data: initialStore.messages },
      { name: "notifications", data: initialStore.notifications },
      { name: "activity_logs", data: initialStore.activityLogs },
    ];

    for (const col of collections) {
      const collection = db.collection(col.name);
      // Drop existing or clear to prevent duplicate key errors on clean seed
      await collection.deleteMany({});
      if (col.data && col.data.length > 0) {
        // Deep copy items and let MongoDB assign its own ObjectId _id, preserving id field
        const docs = col.data.map((item: any) => {
          const { _id, ...rest } = item;
          return {
            ...rest,
            createdAt: rest.createdAt || new Date().toISOString(),
            updatedAt: rest.updatedAt || new Date().toISOString(),
          };
        });
        const result = await collection.insertMany(docs);
        console.log(`✓ Seeded ${col.name}: ${result.insertedCount} documents`);
      } else {
        console.log(`- ${col.name}: 0 documents (empty)`);
      }
    }

    // Create helpful indices
    await db.collection("users").createIndex({ email: 1 });
    await db.collection("student_profiles").createIndex({ studentIdCode: 1 });
    await db.collection("applications").createIndex({ studentId: 1 });
    await db.collection("journey_records").createIndex({ studentId: 1, stageNumber: 1 });
    await db.collection("documents").createIndex({ studentId: 1 });
    await db.collection("tasks").createIndex({ studentId: 1 });
    await db.collection("messages").createIndex({ studentId: 1 });
    await db.collection("activity_logs").createIndex({ createdAt: -1 });

    console.log("✓ MongoDB Indices created successfully.");
    console.log("✓ All collections seeded successfully in MongoDB Atlas!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed with error:", err);
    process.exit(1);
  }
}

seed();
