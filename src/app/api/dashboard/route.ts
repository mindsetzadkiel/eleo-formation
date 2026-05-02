import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const user = await getSession();
  if (!user || (user.role !== "ADMIN" && user.role !== "FORMATEUR")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const [
    totalProspects,
    validProspects,
    refusedProspects,
    fondsPropresProspects,
    entrepriseProspects,
    opcoProspects,
    franceTravailProspects,
    formations,
    sessions,
    learners,
    opcoDocuments,
    qualiopiItems,
  ] = await Promise.all([
    prisma.prospect.count(),
    prisma.prospect.count({ where: { autoRefused: false } }),
    prisma.prospect.count({ where: { autoRefused: true } }),
    prisma.prospect.count({ where: { status: "PROSPECT_FONDS_PROPRES" } }),
    prisma.prospect.count({ where: { status: "PROSPECT_ENTREPRISE" } }),
    prisma.prospect.count({ where: { status: "PROSPECT_OPCO" } }),
    prisma.prospect.count({ where: { status: "PROSPECT_FRANCE_TRAVAIL" } }),
    prisma.formation.count({ where: { status: "PUBLIEE" } }),
    prisma.session.count({ where: { status: { in: ["OUVERTE", "COMPLETE"] } } }),
    prisma.learner.count(),
    prisma.oPCODocument.count({ where: { status: { not: "VALIDE" } } }),
    prisma.qualiopiItem.count({ where: { status: { in: ["A_FAIRE", "EN_COURS"] } } }),
  ]);

  const recentProspects = await prisma.prospect.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      fundingMode: true,
      status: true,
      autoRefused: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    stats: {
      totalProspects,
      validProspects,
      refusedProspects,
      fondsPropresProspects,
      entrepriseProspects,
      opcoProspects,
      franceTravailProspects,
      formations,
      sessions,
      learners,
      opcoDocumentsPending: opcoDocuments,
      qualiopiItemsPending: qualiopiItems,
    },
    recentProspects,
  });
}
