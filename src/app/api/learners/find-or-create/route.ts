import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Trouve un learner par email user, ou en cree un (mode invite, sans password).
 * Endpoint public pour formulaires de satisfaction / positionnement.
 */
export async function POST(request: NextRequest) {
  const { email, name } = await request.json();
  if (!email || !name) {
    return NextResponse.json({ error: "email + nom requis" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { email: String(email).toLowerCase() },
    include: { learnerProfile: true },
  });

  if (existing?.learnerProfile) {
    return NextResponse.json({ learnerId: existing.learnerProfile.id });
  }

  if (existing && !existing.learnerProfile) {
    const profile = await prisma.learner.create({ data: { userId: existing.id } });
    return NextResponse.json({ learnerId: profile.id });
  }

  const [firstName, ...rest] = String(name).split(" ");
  const lastName = rest.join(" ") || "(invité)";
  const newUser = await prisma.user.create({
    data: {
      email: String(email).toLowerCase(),
      firstName,
      lastName,
      role: "APPRENANT",
      passwordHash: "INVITE_PENDING",
      learnerProfile: { create: {} },
    },
    include: { learnerProfile: true },
  });
  return NextResponse.json({ learnerId: newUser.learnerProfile!.id });
}
