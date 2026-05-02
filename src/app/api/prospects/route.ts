import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { REFUSED_FUNDING_MODES } from "@/config/company";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      companyName,
      companySiret,
      professionalGoal,
      formationTitle,
      currentLevel,
      preferredFormat,
      idealDelay,
      message,
      fundingMode,
    } = body;

    if (!firstName || !lastName || !email || !fundingMode) {
      return NextResponse.json(
        { error: "Nom, prénom, email et mode de financement sont requis" },
        { status: 400 }
      );
    }

    const isRefused = (REFUSED_FUNDING_MODES as readonly string[]).includes(fundingMode);

    let status = "NOUVEAU";
    let autoRefused = false;
    let refusalReason: string | null = null;

    if (isRefused) {
      autoRefused = true;
      if (fundingMode === "STAGE_ALTERNANCE") {
        status = "REFUS_ALTERNANCE";
        refusalReason = "Demande de stage/alternance/apprentissage — refus automatique";
      } else if (fundingMode === "IMMERSION_GRATUITE") {
        status = "REFUS_IMMERSION";
        refusalReason = "Demande d'immersion gratuite/PMSMP — refus automatique";
      } else if (fundingMode === "CANDIDATURE_EMPLOI") {
        status = "REFUS_CANDIDATURE";
        refusalReason = "Candidature emploi — refus automatique";
      }
    } else {
      switch (fundingMode) {
        case "FONDS_PROPRES":
          status = "PROSPECT_FONDS_PROPRES";
          break;
        case "ENTREPRISE":
          status = "PROSPECT_ENTREPRISE";
          break;
        case "OPCO":
          status = "PROSPECT_OPCO";
          break;
        case "FRANCE_TRAVAIL":
          status = "PROSPECT_FRANCE_TRAVAIL";
          break;
        default:
          status = "NOUVEAU";
      }
    }

    let formation = null;
    if (formationTitle) {
      formation = await prisma.formation.findFirst({
        where: {
          OR: [
            { title: { contains: formationTitle } },
            { slug: { contains: formationTitle.toLowerCase().replace(/\s+/g, "-") } },
          ],
        },
      });
    }

    const prospect = await prisma.prospect.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        companyName: companyName || null,
        companySiret: companySiret || null,
        professionalGoal: professionalGoal || null,
        formationId: formation?.id || null,
        currentLevel: currentLevel || null,
        preferredFormat: preferredFormat || null,
        idealDelay: idealDelay || null,
        message: message || null,
        fundingMode,
        status,
        autoRefused,
        refusalReason,
        source: "SITE",
      },
    });

    return NextResponse.json({ prospect, autoRefused });
  } catch (error) {
    console.error("Erreur création prospect:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la création du prospect" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const user = await getSession();
  if (!user || (user.role !== "ADMIN" && user.role !== "FORMATEUR")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const prospects = await prisma.prospect.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      formation: { select: { title: true } },
      company: { select: { name: true } },
    },
  });

  return NextResponse.json({ prospects });
}
