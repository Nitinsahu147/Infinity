import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!orgId) {
      return NextResponse.json({ error: "No active organization" }, { status: 400 });
    }

    const { emailAddress, role } = (await req.json()) as {
      emailAddress?: string;
      role?: "org:member" | "org:admin";
    };

    if (!emailAddress) {
      return NextResponse.json({ error: "emailAddress is required" }, { status: 400 });
    }

    const client = await clerkClient();

    const invitation = await client.organizations.createOrganizationInvitation({
      organizationId: orgId,
      emailAddress,
      role: role ?? "org:member",
      redirectUrl: "http://localhost:3000/sign-up",
    });

    return NextResponse.json({ success: true, invitationId: invitation.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Something went wrong" },
      { status: 500 }
    );
  }
}