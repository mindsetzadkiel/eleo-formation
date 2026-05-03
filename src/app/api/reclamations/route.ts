import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getSession();
  if (!user || (user.role !== "ADMIN" && user.role !== "FORMATEUR")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const complaints = await prisma.complaint.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ complaints });
}

// Public submission
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { reporterName, reporterEmail, reporterRole, formationId, category, severity, description } = body;
  if (!reporterName || !reporterEmail || !category || !description) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }
  const created = await prisma.complaint.create({
    data: {
      reporterName,
      reporterEmail,
      reporterRole: reporterRole || "AUTRE",
      formationId: formationId || null,
      category,
      severity: severity || "MOYENNE",
      description,
    },
  });
  return NextResponse.json({ ok: true, id: created.id });
}

export async function PATCH(request: NextRequest) {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const body = await request.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  if (updates.status === "RESOLU" && !updates.resolvedAt) {
    updates.resolvedAt = new Date();
  }
  if (updates.status === "CLOS" && !updates.closedAt) {
    updates.closedAt = new Date();
  }

  const updated = await prisma.complaint.update({ where: { id }, data: updates });
  return NextResponse.json({ complaint: updated });
}
