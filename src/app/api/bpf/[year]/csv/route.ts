import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { COMPANY } from "@/config/company";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ year: string }> },
) {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { year: yearStr } = await params;
  const year = parseInt(yearStr, 10);
  if (Number.isNaN(year)) return NextResponse.json({ error: "Année invalide" }, { status: 400 });

  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);

  const enrollments = await prisma.enrollment.findMany({
    where: { enrolledAt: { gte: start, lt: end } },
    include: {
      session: { include: { formation: true } },
      learner: { include: { user: true, company: true } },
    },
  });

  const sessions = await prisma.session.findMany({
    where: { startDate: { gte: start, lt: end } },
    include: { formation: true, enrollments: true },
  });

  const lines: string[] = [];
  lines.push(`# BPF ${year} — ${COMPANY.name} — SIRET ${COMPANY.siret}`);
  lines.push("");
  lines.push("# SECTION A — Activité");
  lines.push("Indicateur;Valeur");
  lines.push(`Nombre de sessions de formation organisées;${sessions.length}`);
  lines.push(`Nombre d'apprenants distincts;${new Set(enrollments.map((e) => e.learnerId)).size}`);
  lines.push(`Nombre total d'inscriptions;${enrollments.length}`);
  lines.push(`Heures stagiaires totales;${enrollments.reduce((acc, e) => acc + e.session.formation.duration, 0)}`);
  lines.push("");

  lines.push("# DETAIL SESSIONS");
  lines.push("Date début;Date fin;Formation;Format;Lieu;Apprenants inscrits;Durée (h)");
  for (const s of sessions) {
    lines.push([
      s.startDate.toISOString().substring(0, 10),
      s.endDate.toISOString().substring(0, 10),
      s.formation.title.replace(/;/g, ","),
      s.format,
      (s.location || "").replace(/;/g, ","),
      s.enrollments.length.toString(),
      s.formation.duration.toString(),
    ].join(";"));
  }
  lines.push("");

  lines.push("# DETAIL INSCRIPTIONS");
  lines.push("Date inscription;Apprenant;Email;Entreprise;Formation;Statut;Financement");
  for (const e of enrollments) {
    lines.push([
      e.enrolledAt.toISOString().substring(0, 10),
      `${e.learner.user.firstName} ${e.learner.user.lastName}`.replace(/;/g, ","),
      e.learner.user.email,
      (e.learner.company?.name || "").replace(/;/g, ","),
      e.session.formation.title.replace(/;/g, ","),
      e.status,
      e.learner.funding || "",
    ].join(";"));
  }

  const csv = "\uFEFF" + lines.join("\r\n"); // BOM UTF-8 pour Excel FR
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bpf-${year}-${COMPANY.brandName.replace(/\s+/g, "-").toLowerCase()}.csv"`,
    },
  });
}
