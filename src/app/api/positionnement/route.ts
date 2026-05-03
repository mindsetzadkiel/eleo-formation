import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const formationId = searchParams.get("formationId");

  const questions = await prisma.positioningQuestion.findMany({
    where: formationId ? { OR: [{ formationId }, { formationId: null }] } : { formationId: null },
    orderBy: { orderIndex: "asc" },
  });

  // Admin only : aussi les réponses
  if (user.role === "ADMIN" || user.role === "FORMATEUR") {
    const responses = await prisma.positioningResponse.findMany({
      where: formationId ? { formationId } : {},
      orderBy: { submittedAt: "desc" },
      include: { answers: { include: { question: true } } },
      take: 50,
    });
    return NextResponse.json({ questions, responses });
  }
  return NextResponse.json({ questions });
}

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { questions } = await request.json();
  if (!Array.isArray(questions)) {
    return NextResponse.json({ error: "questions array required" }, { status: 400 });
  }
  // Replace all (générique, formationId=null)
  await prisma.positioningQuestion.deleteMany({ where: { formationId: null } });
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    await prisma.positioningQuestion.create({
      data: {
        orderIndex: i + 1,
        question: q.question,
        type: q.type || "OPEN",
        required: q.required ?? true,
        formationId: null,
      },
    });
  }
  return NextResponse.json({ ok: true, count: questions.length });
}
