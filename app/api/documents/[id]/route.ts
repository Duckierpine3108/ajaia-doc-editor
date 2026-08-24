import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const documentId = resolvedParams.id;

    const { title, content } = await req.json();

    const updated = await prisma.document.update({
      where: { id: documentId },
      data: { 
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content })
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PUT /api/documents/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to update" }, { status: 500 });
  }
}
