const fs = require('fs');

// We can read store.ts directly and extract initial store.journeyRecords
const code = fs.readFileSync('src/lib/data/store.ts', 'utf8');
const match = code.match(/journeyRecords:\s*\[([\s\S]*?)\n\s*tasks:/);
if (match) {
  const recordsStr = '[' + match[1].replace(/,\s*$/, '') + ']';
  try {
    // evaluate records
    const records = eval(recordsStr);
    console.log("In-memory journey records in store.ts:");
    records.slice(0, 10).forEach(r => {
      console.log(`Stage ${r.stageNumber}: ${r.stageName.padEnd(30)} status=${r.status}`);
    });
  } catch (e) {
    console.error("Parse error:", e);
  }
}
