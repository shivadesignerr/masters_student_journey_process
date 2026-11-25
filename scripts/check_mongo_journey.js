const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI || 'mongodb+srv://admin_gvk:GVKMasters2026@cluster0.o5h6f.mongodb.net/gvk_masters?retryWrites=true&w=majority';

async function run() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('gvk_masters');
  const records = await db.collection('journey_records').find({ studentId: 'usr-student-01' }).sort({ stageNumber: 1 }).toArray();
  console.log('MongoDB journey_records count:', records.length);
  records.slice(0, 10).forEach(r => {
    console.log(`Stage ${r.stageNumber}: ${r.stageName.padEnd(30)} status=${r.status} completionDate=${r.completionDate || 'none'}`);
  });
  await client.close();
}

run().catch(console.error);
