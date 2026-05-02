import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user || (user.role !== "ADMIN" && user.role !== "FORMATEUR")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const prospect = await prisma.prospect.findUnique({
    where: { id },
    include: {
      formation: { select: { title: true } },
      company: { select: { name: true } },
    },
  });

  if (!prospect) {
    return NextResponse.json({ error: "Prospect non trouvé" }, { status: 404 });
  }

  return NextResponse.json({ prospect });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user || (user.role !== "ADMIN" && user.role !== "FORMATEUR")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const prospect = await prisma.prospect.update({
    where: { id },
    data: body,
  });

  return NextResponse.json({ prospect });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.prospect.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
