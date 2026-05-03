import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getSession();
  if (!user || (user.role !== "ADMIN" && user.role !== "FORMATEUR")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const [formations, qualiopiCriteria, opcoDocs, emailTemplates] = await Promise.all([
    prisma.formation.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        modules: {
          orderBy: { orderIndex: "asc" },
          select: {
            id: true,
            title: true,
            orderIndex: true,
            lessons: {
              orderBy: { orderIndex: "asc" },
              select: { id: true, title: true, orderIndex: true, type: true },
            },
            quizzes: { select: { id: true, title: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.qualiopiCriterion.findMany({
      orderBy: { number: "asc" },
      select: {
        id: true,
        number: true,
        title: true,
        items: {
          select: { id: true, label: true, status: true },
        },
      },
    }),
    prisma.oPCODocument.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,
        status: true,
        formation: { select: { title: true } },
        company: { select: { name: true } },
      },
      take: 100,
    }),
    prisma.emailTemplate.findMany({
      orderBy: { name: "asc" },
      select: { id: true, slug: true, name: true },
    }),
  ]);

  return NextResponse.json({ formations, qualiopiCriteria, opcoDocs, emailTemplates });
}
