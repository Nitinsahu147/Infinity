import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { userId, orgId, orgRole, getToken } = await auth();

    if (orgRole !== "org:admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!orgId) {
      return NextResponse.json({ error: "No active organization" }, { status: 400 });
    }

    const body = await req.json();
    const { keyId } = body as { keyId?: number };

    if (!keyId) {
      return NextResponse.json({ error: "keyId is required" }, { status: 400 });
    }

    const token = await getToken();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        accessToken: async () => token ?? null,
      }
    );

    const { data: updatedKey, error: updateError } = await supabase
      .from("api_keys")
      .update({
        status: "revoked",
      })
      .eq("id", keyId)
      .eq("org_id", orgId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    const { error: auditError } = await supabase.from("audit_logs").insert([
      {
        org_id: orgId,
        actor_user_id: userId,
        action: "api_key_revoked",
        entity_type: "api_key",
        entity_id: String(keyId),
      },
    ]);

    return NextResponse.json({
      success: true,
      revokedKey: updatedKey,
      auditError: auditError?.message ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Something went wrong" },
      { status: 500 }
    );
  }
}