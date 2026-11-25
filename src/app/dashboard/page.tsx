import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  if (session.role === "student") {
    redirect("/student/dashboard");
  }

  if (session.role === "counselor") {
    redirect("/counselor/dashboard");
  }

  if (session.role === "admin") {
    redirect("/admin/dashboard");
  }

  redirect("/auth/login");
}
