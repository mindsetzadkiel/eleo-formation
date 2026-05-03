import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getSession();
  if (!user || (user.role !== "ADMIN" && user.role !== "FORMATEUR")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const active = await prisma.regulationDocument.findFirst({ where: { active: true }, orderBy: { updatedAt: "desc" } });
  const history = await prisma.regulationDocument.findMany({ orderBy: { createdAt: "desc" }, take: 20 });
  return NextResponse.json({ active, history });
}

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { version, title, content, newVersion } = await request.json();

  if (newVersion) {
    // Désactive l'ancien actif et crée un nouveau
    await prisma.regulationDocument.updateMany({ where: { active: true }, data: { active: false } });
    const created = await prisma.regulationDocument.create({
      data: { version, title, content, active: true },
    });
    return NextResponse.json({ regulation: created });
  }

  // Mise à jour de l'actif
  const active = await prisma.regulationDocument.findFirst({ where: { active: true } });
  if (!active) {
    const created = await prisma.regulationDocument.create({
      data: { version, title, content, active: true },
    });
    return NextResponse.json({ regulation: created });
  }
  const updated = await prisma.regulationDocument.update({
    where: { id: active.id },
    data: { version, title, content },
  });
  return NextResponse.json({ regulation: updated });
}
