import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { targetEmail } = await req.json();
  
  // Find the user they want to share with
  const userToShareWith = await prisma.user.findUnique({ where: { email: targetEmail } });
  if (!userToShareWith) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Grant access
  const access = await prisma.documentAccess.upsert({
    where: { documentId_userId: { documentId: params.id, userId: userToShareWith.id } },
    update: { role: "EDITOR" },
    create: { documentId: params.id, userId: userToShareWith.id, role: "EDITOR" },
  });

  return NextResponse.json({ success: true, access });
}