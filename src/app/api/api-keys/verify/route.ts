import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { hashApiKey, isGracePeriodValid } from "@/lib/security/api-keys";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      apiKey,
      endpointName = "default",
    } = body as {
      apiKey?: string;
      endpointName?: string;
    };

    if (!apiKey) {
      return NextResponse.json(
        { valid: false, error: "apiKey is required" },
        { status: 400 }
      );
    }

    const keyHash = hashApiKey(apiKey);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: keyRow, error } = await supabase
      .from("api_keys")
      .select("*")
      .eq("key_hash", keyHash)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { valid: false, error: error.message },
        { status: 400 }
      );
    }

    if (!keyRow) {
      return NextResponse.json(
        { valid: false, error: "Invalid API key" },
        { status: 401 }
      );
    }

    if (keyRow.status === "revoked") {
      return NextResponse.json(
        { valid: false, error: "API key is revoked" },
        { status: 403 }
      );
    }

    if (keyRow.status === "grace_period") {
      const allowed = isGracePeriodValid(keyRow.grace_until);

      if (!allowed) {
        return NextResponse.json(
          { valid: false, error: "Grace period expired" },
          { status: 403 }
        );
      }

      await supabase.from("api_usage_logs").insert([
        {
          org_id: keyRow.org_id,
          api_key_id: keyRow.id,
          endpoint_name: endpointName,
          status: "success",
        },
      ]);

      return NextResponse.json({
        valid: true,
        message: "API key accepted during grace period",
        key: {
          id: keyRow.id,
          name: keyRow.name,
          org_id: keyRow.org_id,
          key_type: keyRow.key_type,
          status: keyRow.status,
          grace_until: keyRow.grace_until,
        },
      });
    }

    if (keyRow.status === "active") {
      await supabase.from("api_usage_logs").insert([
        {
          org_id: keyRow.org_id,
          api_key_id: keyRow.id,
          endpoint_name: endpointName,
          status: "success",
        },
      ]);

      return NextResponse.json({
        valid: true,
        message: "API key is valid",
        key: {
          id: keyRow.id,
          name: keyRow.name,
          org_id: keyRow.org_id,
          key_type: keyRow.key_type,
          status: keyRow.status,
        },
      });
    }

    return NextResponse.json(
      { valid: false, error: "Unknown key status" },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        valid: false,
        error: error instanceof Error ? error.message : "Something went wrong",
      },
      { status: 500 }
    );
  }
}