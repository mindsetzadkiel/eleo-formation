import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const user = await getSession();
  if (!user || (user.role !== "ADMIN" && user.role !== "FORMATEUR")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const criteria = await prisma.qualiopiCriterion.findMany({
    include: { items: { orderBy: { label: "asc" } } },
    orderBy: { number: "asc" },
  });

  return NextResponse.json({ criteria });
}

export async function PUT(request: NextRequest) {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { itemId, ...data } = body;

    const item = await prisma.qualiopiItem.update({
      where: { id: itemId },
      data: {
        ...data,
        lastUpdated: new Date(),
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Erreur mise à jour Qualiopi:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
