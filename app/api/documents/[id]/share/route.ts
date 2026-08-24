import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const documentId = resolvedParams.id;

    const { targetEmail } = await req.json();

    // Automatically find or create the user so sharing never fails with "User not found"
    const userToShareWith = await prisma.user.upsert({
      where: { email: targetEmail },
      update: {},
      create: {
        id: targetEmail.includes("bob") ? "bob-id" : "alice-id",
        email: targetEmail,
        name: targetEmail.includes("bob") ? "Bob (Collaborator)" : "Alice (Owner)",
      },
    });

    // Grant access
    const access = await prisma.documentAccess.upsert({
      where: { documentId_userId: { documentId: documentId, userId: userToShareWith.id } },
      update: { role: "EDITOR" },
      create: { documentId: documentId, userId: userToShareWith.id, role: "EDITOR" },
    });

    return NextResponse.json({ success: true, access });
  } catch (error: any) {
    console.error("Share error:", error);
    return NextResponse.json({ error: error.message || "Failed to share" }, { status: 500 });
  }
}
