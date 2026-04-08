import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getOnboardingStatus(userId: string, orgId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("onboarding_complete")
    .eq("clerk_user_id", userId)
    .eq("org_id", orgId)
    .maybeSingle();

  if (error) {
    return false;
  }

  return data?.onboarding_complete ?? false;
}