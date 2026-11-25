import { redirect } from "next/navigation";

export default function HomePage() {
  // Direct redirect to unified enterprise authentication gateway
  redirect("/auth/login");
}
