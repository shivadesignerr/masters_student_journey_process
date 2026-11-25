const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://shivamudhiraj2610_db_user:shiva1275@master-application-proc.nycldq6.mongodb.net/gvk_masters?retryWrites=true&w=majority';

async function run() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('gvk_masters');

  const res = await db.collection('tasks').deleteMany({
    $or: [
      { id: 'tsk-02' },
      { title: { $regex: 'Aspiration Questionnaire', $options: 'i' } }
    ]
  });
  console.log('Deleted tasks from Mongo:', res.deletedCount);

  const remaining = await db.collection('tasks').find({}).toArray();
  console.log('Remaining tasks in Mongo:');
  remaining.forEach(t => console.log(' - Task:', t.id, t.title));

  await client.close();
}

run().catch(console.error);
