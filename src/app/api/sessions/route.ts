import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const user = await getSession();
  if (!user || (user.role !== "ADMIN" && user.role !== "FORMATEUR")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const sessions = await prisma.session.findMany({
    orderBy: { startDate: "desc" },
    include: {
      formation: { select: { title: true, slug: true } },
      trainer: { select: { firstName: true, lastName: true } },
      _count: { select: { enrollments: true } },
    },
  });

  return NextResponse.json({ sessions });
}

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const session = await prisma.session.create({
      data: {
        formationId: body.formationId,
        trainerId: body.trainerId || null,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        maxPlaces: body.maxPlaces || 8,
        format: body.format || "HYBRIDE",
        location: body.location || null,
        status: body.status || "BROUILLON",
      },
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error("Erreur création session:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
