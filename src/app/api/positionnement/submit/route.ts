import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Endpoint public : soumission d'un questionnaire de positionnement.
 * Authentifie OU anonyme (avec email obligatoire).
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { formationId, learnerId, learnerEmail, learnerName, answers } = body;

  if (!formationId || !Array.isArray(answers) || answers.length === 0) {
    return NextResponse.json({ error: "formationId et answers requis" }, { status: 400 });
  }

  let resolvedLearnerId = learnerId;
  if (!resolvedLearnerId && learnerEmail) {
    // Recherche learner par email user
    const user = await prisma.user.findUnique({ where: { email: learnerEmail }, include: { learnerProfile: true } });
    if (user?.learnerProfile) {
      resolvedLearnerId = user.learnerProfile.id;
    }
  }
  if (!resolvedLearnerId) {
    // Crée un learner anonyme rattaché à un user temporaire
    if (!learnerEmail || !learnerName) {
      return NextResponse.json({ error: "email + nom requis pour invité" }, { status: 400 });
    }
    const [firstName, ...rest] = learnerName.split(" ");
    const lastName = rest.join(" ") || "(invité)";
    const newUser = await prisma.user.create({
      data: {
        email: learnerEmail,
        firstName,
        lastName,
        role: "APPRENANT",
        passwordHash: "INVITE_PENDING",
        learnerProfile: { create: {} },
      },
      include: { learnerProfile: true },
    });
    resolvedLearnerId = newUser.learnerProfile!.id;
  }

  const response = await prisma.positioningResponse.create({
    data: {
      learnerId: resolvedLearnerId,
      formationId,
      answers: {
        create: answers.map((a: { questionId: string; answer: string }) => ({
          questionId: a.questionId,
          answer: a.answer,
        })),
      },
    },
  });

  return NextResponse.json({ ok: true, responseId: response.id });
}
