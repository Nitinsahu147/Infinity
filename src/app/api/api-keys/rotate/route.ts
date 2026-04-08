import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  generatePlainApiKey,
  getGraceUntil,
  getKeyPrefix,
  hashApiKey,
} from "@/lib/security/api-keys";

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
    const { keyId, graceHours = 48 } = body as {
      keyId?: number;
      graceHours?: number;
    };

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

    // 1. Fetch old key
    const { data: oldKey, error: oldKeyError } = await supabase
      .from("api_keys")
      .select("*")
      .eq("id", keyId)
      .eq("org_id", orgId)
      .single();

    if (oldKeyError || !oldKey) {
      return NextResponse.json(
        { error: oldKeyError?.message ?? "Old key not found" },
        { status: 404 }
      );
    }

    if (oldKey.status !== "active") {
      return NextResponse.json(
        { error: "Only active keys can be rotated" },
        { status: 400 }
      );
    }

    // 2. Generate new key
    const plainKey = generatePlainApiKey(oldKey.key_type);
    const keyHash = hashApiKey(plainKey);
    const keyPrefix = getKeyPrefix(plainKey);
    const graceUntil = getGraceUntil(graceHours);

    // 3. Insert new key
    const { data: newKey, error: newKeyError } = await supabase
      .from("api_keys")
      .insert([
        {
          org_id: orgId,
          name: `${oldKey.name} (Rotated)`,
          key_prefix: keyPrefix,
          key_hash: keyHash,
          key_type: oldKey.key_type,
          status: "active",
          created_by: userId,
          rotated_from_key_id: oldKey.id,
        },
      ])
      .select()
      .single();

    if (newKeyError || !newKey) {
      return NextResponse.json(
        { error: newKeyError?.message ?? "Failed to create new key" },
        { status: 400 }
      );
    }

    // 4. Update old key with grace window
    const { error: updateOldError } = await supabase
      .from("api_keys")
      .update({
        status: "grace_period",
        grace_until: graceUntil,
        replaced_by_key_id: newKey.id,
      })
      .eq("id", oldKey.id)
      .eq("org_id", orgId);

    if (updateOldError) {
      return NextResponse.json(
        { error: updateOldError.message },
        { status: 400 }
      );
    }

    // 5. Audit log
    const { error: auditError } = await supabase.from("audit_logs").insert([
      {
        org_id: orgId,
        actor_user_id: userId,
        action: "api_key_rotated",
        entity_type: "api_key",
        entity_id: String(oldKey.id),
      },
    ]);

    return NextResponse.json({
      success: true,
      key: plainKey,
      oldKeyId: oldKey.id,
      newKey,
      graceUntil,
      auditError: auditError?.message ?? null,
      message: "Save this rotated key now. It will not be shown again.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Something went wrong" },
      { status: 500 }
    );
  }
}