import { getDb } from "../lib/mongodb";

async function clean() {
  const db = await getDb();
  const msgs = await db.collection("messages").find({}).toArray();
  console.log("Current messages in Mongo before clean:", msgs.length);
  msgs.forEach(m => console.log(`- [${m.senderRole}] ${m.senderName}: "${m.content}" (${m.id})`));

  // Remove the test message sent by the browser test runner
  const res = await db.collection("messages").deleteMany({
    senderRole: "student",
    content: { $regex: "Stage 01 counseling call" },
  });
  console.log("Deleted automated test messages count:", res.deletedCount);

  const remaining = await db.collection("messages").find({}).toArray();
  console.log("Remaining messages in Mongo:", remaining.length);
  remaining.forEach(m => console.log(`- [${m.senderRole}] ${m.senderName}: "${m.content}" (${m.id})`));

  process.exit(0);
}

clean().catch(err => {
  console.error(err);
  process.exit(1);
});
