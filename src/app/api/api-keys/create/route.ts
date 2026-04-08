import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generatePlainApiKey, getKeyPrefix, hashApiKey } from "@/lib/security/api-keys";

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
    const { name, keyType } = body as {
      name?: string;
      keyType?: "secret" | "publishable" | "restricted";
    };

    if (!name || !keyType) {
      return NextResponse.json(
        { error: "Name and keyType are required" },
        { status: 400 }
      );
    }

    const plainKey = generatePlainApiKey(keyType);
    const keyHash = hashApiKey(plainKey);
    const keyPrefix = getKeyPrefix(plainKey);

    const token = await getToken();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        accessToken: async () => token ?? null,
      }
    );

    const { data, error } = await supabase
      .from("api_keys")
      .insert([
        {
          org_id: orgId,
          name,
          key_prefix: keyPrefix,
          key_hash: keyHash,
          key_type: keyType,
          status: "active",
          created_by: userId,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from("audit_logs").insert([
      {
        org_id: orgId,
        actor_user_id: userId,
        action: "api_key_created",
        entity_type: "api_key",
        entity_id: String(data.id),
      },
    ]);

    return NextResponse.json({
      success: true,
      key: plainKey,
      savedKey: data,
      message: "Save this key now. You won't be able to see it again.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Something went wrong" },
      { status: 500 }
    );
  }
}