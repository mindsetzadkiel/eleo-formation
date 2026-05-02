import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const user = await getSession();
  if (!user || (user.role !== "ADMIN" && user.role !== "FORMATEUR")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const documents = await prisma.oPCODocument.findMany({
    include: {
      formation: { select: { title: true } },
      company: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ documents });
}

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const document = await prisma.oPCODocument.create({
      data: {
        formationId: body.formationId,
        companyId: body.companyId || null,
        type: body.type,
        status: body.status || "A_GENERER",
        remarks: body.remarks || null,
      },
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error("Erreur création document OPCO:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
