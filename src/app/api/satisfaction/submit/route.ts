import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { learnerId, formationId, type, rating, comments, recommend, raw } = body;
  if (!learnerId || !formationId || !type) {
    return NextResponse.json({ error: "learnerId, formationId, type requis" }, { status: 400 });
  }
  const created = await prisma.satisfactionResponse.create({
    data: {
      learnerId,
      formationId,
      type,
      rating: rating ? Number(rating) : null,
      comments: comments || null,
      recommend: recommend === true || recommend === "true",
      raw: typeof raw === "string" ? raw : JSON.stringify(raw || {}),
    },
  });
  return NextResponse.json({ ok: true, id: created.id });
}
