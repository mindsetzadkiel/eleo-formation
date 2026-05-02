import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const formation = await prisma.formation.findUnique({
    where: { id },
    include: {
      modules: {
        orderBy: { orderIndex: "asc" },
        include: {
          lessons: { orderBy: { orderIndex: "asc" } },
          quizzes: { include: { questions: { orderBy: { orderIndex: "asc" } } } },
        },
      },
      sessions: true,
    },
  });

  if (!formation) {
    return NextResponse.json({ error: "Formation non trouvée" }, { status: 404 });
  }

  return NextResponse.json({ formation });
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

  const formation = await prisma.formation.update({
    where: { id },
    data: body,
  });

  return NextResponse.json({ formation });
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
  await prisma.formation.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
