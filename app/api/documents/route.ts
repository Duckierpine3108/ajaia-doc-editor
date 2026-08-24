import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

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
}

export async function POST(req: Request) {
  const { title, content, ownerId } = await req.json();
  const doc = await prisma.document.create({
    data: {
      title: title || "Untitled Document",
      content: content || "<p>Start writing...</p>",
      ownerId,
    },
  });
  return NextResponse.json(doc);
}