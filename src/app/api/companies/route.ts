import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const user = await getSession();
  if (!user || (user.role !== "ADMIN" && user.role !== "FORMATEUR")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const companies = await prisma.company.findMany({
    include: {
      _count: { select: { learners: true, prospects: true, opcoDocuments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ companies });
}

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const company = await prisma.company.create({
      data: {
        name: body.name,
        siret: body.siret || null,
        address: body.address || null,
        contactName: body.contactName || null,
        contactEmail: body.contactEmail || null,
        contactPhone: body.contactPhone || null,
        opcoName: body.opcoName || null,
        notes: body.notes || null,
      },
    });

    return NextResponse.json({ company }, { status: 201 });
  } catch (error) {
    console.error("Erreur création entreprise:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
