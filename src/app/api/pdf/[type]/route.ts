import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  generateProgrammePDF,
  generateDevisPDF,
  generateConventionPDF,
  generateAttestationPDF,
  generateEmargementPDF,
  generateCertificatPDF,
  generateSatisfactionPDF,
  generateConvocationPDF,
} from "@/lib/pdf-generator";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const user = await getSession();
  if (!user || (user.role !== "ADMIN" && user.role !== "FORMATEUR")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { type } = await params;
  const body = await request.json();

  try {
    let pdfBytes: Uint8Array;
    let filename: string;

    switch (type) {
      case "programme":
        pdfBytes = await generateProgrammePDF(body);
        filename = `programme-${Date.now()}.pdf`;
        break;
      case "devis":
        pdfBytes = await generateDevisPDF(body);
        filename = `devis-${body.devisNumber || Date.now()}.pdf`;
        break;
      case "convention":
        pdfBytes = await generateConventionPDF(body);
        filename = `convention-${body.conventionNumber || Date.now()}.pdf`;
        break;
      case "attestation":
        pdfBytes = await generateAttestationPDF(body);
        filename = `attestation-${Date.now()}.pdf`;
        break;
      case "emargement":
        pdfBytes = await generateEmargementPDF(body);
        filename = `emargement-${Date.now()}.pdf`;
        break;
      case "certificat":
        pdfBytes = await generateCertificatPDF(body);
        filename = `certificat-${Date.now()}.pdf`;
        break;
      case "satisfaction":
        pdfBytes = await generateSatisfactionPDF(body);
        filename = `satisfaction-${body.type || "chaud"}-${Date.now()}.pdf`;
        break;
      case "convocation":
        pdfBytes = await generateConvocationPDF(body);
        filename = `convocation-${Date.now()}.pdf`;
        break;
      default:
        return NextResponse.json({ error: "Type de PDF inconnu" }, { status: 400 });
    }

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Erreur génération PDF:", error);
    return NextResponse.json({ error: "Erreur lors de la génération du PDF" }, { status: 500 });
  }
}
