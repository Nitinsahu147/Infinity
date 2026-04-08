import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const { userId, orgId, orgRole } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  if (!orgId) {
    redirect("/organization-select");
  }

  if (orgRole !== "org:admin") {
    redirect("/dashboard");
  }

  return { userId, orgId, orgRole };
}