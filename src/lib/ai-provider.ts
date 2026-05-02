export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIProvider {
  generateText(prompt: string, systemPrompt?: string): Promise<string>;
  chat(messages: AIMessage[]): Promise<string>;
}

class MockAIProvider implements AIProvider {
  async generateText(prompt: string, systemPrompt?: string): Promise<string> {
    const lowerPrompt = prompt.toLowerCase();

    if (lowerPrompt.includes("programme") || lowerPrompt.includes("formation")) {
      return `[Mode démonstration — Assistant IA Eleo Formation]

Voici une ébauche de programme de formation :

1. Objectifs pédagogiques
   - À définir selon le besoin identifié

2. Public cible
   - Salariés, indépendants, techniciens en poste

3. Prérequis
   - Connaissances de base en informatique

4. Contenu pédagogique
   - Module théorique en ligne
   - Exercices pratiques
   - Atelier présentiel à Aix-en-Provence

5. Modalités d'évaluation
   - Quiz de validation
   - Étude de cas pratique
   - Évaluation continue

⚠️ Ce contenu est généré en mode démonstration. Vérification humaine obligatoire avant usage officiel.`;
    }

    if (lowerPrompt.includes("devis") || lowerPrompt.includes("proposition")) {
      return `[Mode démonstration — Assistant IA Eleo Formation]

Proposition de structure de devis :

- Intitulé de la formation : [à compléter]
- Durée : [à compléter] heures
- Format : Hybride (en ligne + atelier Aix-en-Provence)
- Tarif HT : [à compléter] €
- TVA (20%) : [à compléter] €
- Total TTC : [à compléter] €

Conditions :
- Paiement à 30 jours
- Formation contractualisée et facturée

⚠️ Ce contenu est généré en mode démonstration. Vérification humaine obligatoire avant usage officiel.`;
    }

    if (lowerPrompt.includes("mail") || lowerPrompt.includes("email") || lowerPrompt.includes("opco")) {
      return `[Mode démonstration — Assistant IA Eleo Formation]

Objet : Demande de prise en charge formation — Eleo Formation

Madame, Monsieur,

Nous souhaitons soumettre une demande de prise en charge pour la formation suivante :

- Intitulé : [à compléter]
- Durée : [à compléter] heures
- Salarié concerné : [à compléter]
- Entreprise : [à compléter]
- SIRET : [à compléter]

Vous trouverez ci-joint le programme détaillé, le devis et la convention de formation.

Cordialement,
Eleo Informatique — Eleo Formation
04 42 29 06 65

⚠️ Ce contenu est généré en mode démonstration. Vérification humaine obligatoire avant usage officiel.`;
    }

    if (lowerPrompt.includes("refus") || lowerPrompt.includes("alternance") || lowerPrompt.includes("stage")) {
      return `[Mode démonstration — Assistant IA Eleo Formation]

Objet : Réponse à votre demande d'accueil chez Eleo Informatique

Bonjour,

Merci pour votre message.

Eleo Informatique ne recrute actuellement ni apprenti, ni alternant, ni stagiaire, et n'accueille plus de personnes en immersion ou formation gratuite.

L'entreprise accompagne déjà un apprenti, ce qui mobilise notre capacité de formation interne.

Nous ne traitons désormais que les demandes de formation professionnelle financée, contractualisée ou payée en fonds propres.

Nous vous souhaitons une bonne continuation dans vos recherches.

Cordialement,
Eleo Informatique

⚠️ Ce contenu est généré en mode démonstration. Vérification humaine obligatoire avant usage officiel.`;
    }

    if (lowerPrompt.includes("quiz") || lowerPrompt.includes("évaluation") || lowerPrompt.includes("evaluation")) {
      return `[Mode démonstration — Assistant IA Eleo Formation]

Quiz — Évaluation des connaissances

Question 1 : Quelle est la première étape d'un diagnostic informatique ?
a) Remplacer le disque dur
b) Interroger le client sur les symptômes
c) Réinstaller le système
d) Vérifier la connexion internet

Réponse correcte : b

Question 2 : Quel est le principal risque du phishing ?
a) Perte de données
b) Vol d'identifiants
c) Surchauffe du processeur
d) Lenteur du réseau

Réponse correcte : b

⚠️ Ce contenu est généré en mode démonstration. Vérification humaine obligatoire avant usage officiel.`;
    }

    return `[Mode démonstration — Assistant IA Eleo Formation]

Je suis l'assistant IA d'Eleo Formation en mode démonstration.

Je peux vous aider à :
- Rédiger un programme de formation
- Préparer un devis
- Générer un mail OPCO
- Créer un email de refus
- Rédiger un quiz ou une évaluation
- Reformuler des objectifs pédagogiques
- Analyser les pièces manquantes d'un dossier

Posez-moi votre question et je vous proposerai une ébauche.

⚠️ Ce contenu est généré en mode démonstration. Vérification humaine obligatoire avant usage officiel.`;
  }

  async chat(messages: AIMessage[]): Promise<string> {
    const lastMessage = messages[messages.length - 1];
    return this.generateText(lastMessage?.content || "");
  }
}

/**
 * OpenRouter provider — API compatible OpenAI (fetch natif, pas de SDK).
 * Accès unifié à 300+ modèles dont plusieurs gratuits (suffix :free).
 * Fallback automatique sur d'autres modèles en cas d'erreur/rate-limit.
 */
class OpenRouterProvider implements AIProvider {
  private apiKey: string;
  private primaryModel: string;
  private fallbackModels: string[];
  private siteUrl: string;
  private appName: string;

  constructor() {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) throw new Error("OPENROUTER_API_KEY manquante dans l'environnement");
    this.apiKey = key;
    this.primaryModel = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free";
    this.fallbackModels = (process.env.OPENROUTER_FALLBACK_MODELS || "google/gemini-2.0-flash-exp:free,deepseek/deepseek-r1:free")
      .split(",").map((s) => s.trim()).filter(Boolean);
    this.siteUrl = process.env.OPENROUTER_SITE_URL || "https://formation.eleo-informatique.fr";
    this.appName = process.env.OPENROUTER_APP_NAME || "Eleo Formation";
  }

  private async callModel(model: string, messages: AIMessage[]): Promise<string> {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": this.siteUrl,
        "X-Title": this.appName,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenRouter ${res.status} (${model}): ${errText}`);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      throw new Error(`Réponse vide de ${model}`);
    }
    return content;
  }

  async chat(messages: AIMessage[]): Promise<string> {
    const modelsToTry = [this.primaryModel, ...this.fallbackModels];
    const errors: string[] = [];
    for (const model of modelsToTry) {
      try {
        return await this.callModel(model, messages);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(msg);
        console.warn(`[OpenRouter] Échec ${model} — tentative suivante. Détail: ${msg}`);
      }
    }
    throw new Error(`Tous les modèles OpenRouter ont échoué:\n${errors.join("\n")}`);
  }

  async generateText(prompt: string, systemPrompt?: string): Promise<string> {
    const messages: AIMessage[] = [];
    if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
    messages.push({ role: "user", content: prompt });
    return this.chat(messages);
  }
}

export function getAIProvider(): AIProvider {
  const provider = (process.env.AI_PROVIDER || "mock").toLowerCase();

  switch (provider) {
    case "openrouter":
      try {
        return new OpenRouterProvider();
      } catch (err) {
        console.error("[AI] OpenRouter indisponible, fallback mock:", err);
        return new MockAIProvider();
      }
    case "mock":
    default:
      return new MockAIProvider();
  }
}
