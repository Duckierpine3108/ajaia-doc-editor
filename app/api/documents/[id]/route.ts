import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { title, content } = await req.json();
  const updated = await prisma.document.update({
    where: { id: params.id },
    data: { title, content },
  });
  return NextResponse.json(updated);
}