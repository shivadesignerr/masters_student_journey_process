import { redirect } from "next/navigation";
import { clearSession } from "@/lib/auth/session";

export default async function HomePage() {
  // Always open login screen panel first when landing on the site root
  await clearSession();
  redirect("/auth/login");
}
