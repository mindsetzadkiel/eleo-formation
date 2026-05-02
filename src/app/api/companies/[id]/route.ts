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
  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      learners: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
      prospects: true,
      opcoDocuments: true,
    },
  });

  if (!company) {
    return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 404 });
  }

  return NextResponse.json({ company });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const company = await prisma.company.update({
    where: { id },
    data: body,
  });

  return NextResponse.json({ company });
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
  await prisma.company.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
