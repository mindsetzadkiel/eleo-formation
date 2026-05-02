import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  const user = await getSession();
  if (!user || (user.role !== "ADMIN" && user.role !== "FORMATEUR")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const learners = await prisma.learner.findMany({
    include: {
      user: { select: { firstName: true, lastName: true, email: true, phone: true, active: true } },
      company: { select: { name: true } },
      enrollments: {
        include: { session: { include: { formation: { select: { title: true } } } } },
      },
      _count: { select: { completions: true, quizAttempts: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ learners });
}

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, companyId, funding, specialNeeds, currentLevel } = body;

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: "Nom, prénom et email requis" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Un utilisateur avec cet email existe déjà" }, { status: 400 });
    }

    const passwordHash = await hashPassword("Eleo2026!");

    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        phone: phone || null,
        role: "APPRENANT",
        learnerProfile: {
          create: {
            companyId: companyId || null,
            funding: funding || null,
            specialNeeds: specialNeeds || null,
            currentLevel: currentLevel || null,
          },
        },
      },
      include: { learnerProfile: true },
    });

    return NextResponse.json({ learner: newUser.learnerProfile }, { status: 201 });
  } catch (error) {
    console.error("Erreur création apprenant:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
