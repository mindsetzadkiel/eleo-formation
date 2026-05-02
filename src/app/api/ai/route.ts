import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAIProvider } from "@/lib/ai-provider";

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user || (user.role !== "ADMIN" && user.role !== "FORMATEUR")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { prompt, systemPrompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt requis" }, { status: 400 });
    }

    const provider = getAIProvider();
    const response = await provider.generateText(
      prompt,
      systemPrompt || "Tu es l'assistant administratif d'Eleo Formation. Tu aides à rédiger des documents de formation professionnelle."
    );

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Erreur IA:", error);
    return NextResponse.json({ error: "Erreur du service IA" }, { status: 500 });
  }
}
