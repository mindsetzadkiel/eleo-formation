import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  const formations = await prisma.formation.findMany({
    orderBy: { createdAt: "desc" },
    include: { modules: { orderBy: { orderIndex: "asc" } }, _count: { select: { sessions: true } } },
  });
  return NextResponse.json({ formations });
}

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const slug = slugify(body.title);

    const formation = await prisma.formation.create({
      data: {
        title: body.title,
        slug,
        description: body.description || "",
        objectives: body.objectives || "",
        targetAudience: body.targetAudience || "",
        nonTargetAudience: body.nonTargetAudience || "",
        prerequisites: body.prerequisites || "",
        duration: body.duration || 35,
        format: body.format || "HYBRIDE",
        priceHT: body.priceHT || 0,
        accessModalities: body.accessModalities || "",
        accessDelay: body.accessDelay || "",
        disabilityAccess: body.disabilityAccess || "",
        teachingMethods: body.teachingMethods || "",
        evaluationMethods: body.evaluationMethods || "",
        status: body.status || "BROUILLON",
      },
    });

    return NextResponse.json({ formation }, { status: 201 });
  } catch (error) {
    console.error("Erreur création formation:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
