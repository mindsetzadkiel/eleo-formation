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
  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      formation: true,
      trainer: { select: { firstName: true, lastName: true } },
      enrollments: {
        include: { learner: { include: { user: { select: { firstName: true, lastName: true, email: true } } } } },
      },
      workshops: true,
    },
  });

  if (!session) {
    return NextResponse.json({ error: "Session non trouvée" }, { status: 404 });
  }

  return NextResponse.json({ session });
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

  if (body.startDate) body.startDate = new Date(body.startDate);
  if (body.endDate) body.endDate = new Date(body.endDate);

  const session = await prisma.session.update({
    where: { id },
    data: body,
  });

  return NextResponse.json({ session });
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
  await prisma.session.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
