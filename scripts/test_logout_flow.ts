async function runTest() {
  const base = "http://localhost:3000";

  console.log("==================================================");
  console.log("TESTING LOGOUT & SESSION ISOLATION");
  console.log("==================================================");

  // 1. Test /api/auth/logout sets expired cookie and redirects to /auth/login
  const logoutRes = await fetch(base + "/api/auth/logout", { redirect: "manual" });
  const setCookie = logoutRes.headers.get("set-cookie") || "";
  const location = logoutRes.headers.get("location") || "";
  console.log("\n[1] GET /api/auth/logout:");
  console.log("    Status:", logoutRes.status);
  console.log("    Redirect Location:", location);
  console.log("    Has Expired Cookie (Max-Age=0):", setCookie.includes("Max-Age=0"));

  if (logoutRes.status === 307 && location.includes("/auth/login") && setCookie.includes("Max-Age=0")) {
    console.log("    ✅ PASSED: Session cookie wiped and user redirected to /auth/login.");
  } else {
    throw new Error(`Logout test failed. Status: ${logoutRes.status}`);
  }

  // 2. Test accessing protected Student Dashboard without cookie
  const stuRes = await fetch(base + "/student/dashboard", { redirect: "manual" });
  console.log("\n[2] GET /student/dashboard without credentials/cookie:");
  console.log("    Status:", stuRes.status);
  console.log("    Redirect Location:", stuRes.headers.get("location"));
  if (stuRes.status === 307 && stuRes.headers.get("location")?.includes("/auth/login?role=student")) {
    console.log("    ✅ PASSED: Blocked from student dashboard; forced to login with credentials.");
  } else {
    throw new Error("Student protection failed");
  }

  // 3. Test accessing protected Counselor Dashboard without cookie
  const counsRes = await fetch(base + "/counselor/dashboard", { redirect: "manual" });
  console.log("\n[3] GET /counselor/dashboard without credentials/cookie:");
  console.log("    Status:", counsRes.status);
  console.log("    Redirect Location:", counsRes.headers.get("location"));
  if (counsRes.status === 307 && counsRes.headers.get("location")?.includes("/auth/login?role=counselor")) {
    console.log("    ✅ PASSED: Blocked from counselor dashboard; forced to login with credentials.");
  } else {
    throw new Error("Counselor protection failed");
  }

  // 4. Test Cross-role switch: If user has a counselor cookie but opens /auth/login?role=student
  const counselorPayload = JSON.stringify({
    id: "usr-counselor-01",
    email: "shivdesignerr@gmail.com",
    role: "counselor",
    fullName: "Shiva",
    identifierCode: "GVK-EMP-014",
  });
  const counselorCookie = `gvk_auth_session=${encodeURIComponent(counselorPayload)}`;
  const crossRoleRes = await fetch(base + "/auth/login?role=student", {
    headers: { cookie: counselorCookie },
    redirect: "manual",
  });
  console.log("\n[4] Opening Student Portal with existing Counselor cookie:");
  console.log("    Status:", crossRoleRes.status);
  const crossSetCookie = crossRoleRes.headers.get("set-cookie") || "";
  console.log("    Wiped old Counselor session (Max-Age=0):", crossSetCookie.includes("Max-Age=0"));
  if (crossSetCookie.includes("Max-Age=0") && crossRoleRes.status === 200) {
    console.log("    ✅ PASSED: Old counselor session was cleared; student login page is presented!");
  } else {
    throw new Error("Cross-role switch test failed");
  }

  console.log("\n==================================================");
  console.log("ALL LOGOUT & CREDENTIAL LOGIN CHECKS PASSED 100%");
  console.log("==================================================");
}

runTest();
