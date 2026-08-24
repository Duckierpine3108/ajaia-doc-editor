import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper to ensure mock users exist in Postgres to prevent foreign key errors
async function ensureUserExists(userId: string) {
  try {
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: userId === "alice-id" ? "alice@ajaia.internal" : "bob@ajaia.internal",
        name: userId === "alice-id" ? "Alice (Owner)" : "Bob (Collaborator)",
      },
    });
  } catch (e) {
    console.error("User upsert error:", e);
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Ensure user exists in Postgres
    await ensureUserExists(userId);

    // Get docs owned by user
    const owned = await prisma.document.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: "desc" },
    });

    // Get docs shared with user
    const sharedAccess = await prisma.documentAccess.findMany({
      where: { userId },
      include: { document: true },
    });
    const shared = sharedAccess.map((sa) => sa.document);

    return NextResponse.json({ owned, shared });
  } catch (error: any) {
    console.error("GET /api/documents error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { title, content, ownerId } = await req.json();
    const currentOwnerId = ownerId || "alice-id";

    // 1. Ensure user exists first so Postgres doesn't reject the foreign key
    await ensureUserExists(currentOwnerId);

    // 2. Create the document
    const doc = await prisma.document.create({
      data: {
        title: title || "Untitled Document",
        content: content || "<p>Start writing...</p>",
        ownerId: currentOwnerId,
      },
    });

    return NextResponse.json(doc);
  } catch (error: any) {
    console.error("POST /api/documents error:", error);
    return NextResponse.json({ error: error.message || "Failed to create" }, { status: 500 });
  }
}
