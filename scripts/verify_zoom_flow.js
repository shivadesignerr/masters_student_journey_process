async function verify() {
  const session = {
    userId: "usr-student-01",
    role: "student",
    email: "rahul.sharma@gmail.com",
    name: "Rahul Sharma",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
    createdAt: new Date().toISOString()
  };

  const res = await fetch("http://localhost:3000/student/mock-interview", {
    headers: {
      cookie: `gvk_auth_session=${encodeURIComponent(JSON.stringify(session))}`
    }
  });

  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Includes zoom.us:", text.includes("zoom.us"));
  console.log("Includes test room:", text.includes("zoom.us/test"));
  console.log("Includes Manchester:", text.includes("Manchester"));
  if (text.includes("zoom.us")) {
    const idx = text.indexOf("zoom.us");
    console.log("Context around zoom.us:", text.slice(Math.max(0, idx - 50), idx + 100));
  } else {
    console.log("Not found in HTML response. Length:", text.length);
  }
}

verify().catch(console.error);
