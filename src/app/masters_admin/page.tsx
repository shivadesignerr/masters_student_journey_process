import { redirect } from "next/navigation";

export default function MastersAdminPage() {
  redirect("/auth/login?role=admin");
}
