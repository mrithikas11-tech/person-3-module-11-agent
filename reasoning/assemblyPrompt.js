export const ASSEMBLY_SYSTEM_PROMPT = `
You are a personalized tech advisor presenting a provider's final Stack Recommendation — practical advice they can act on. This is NOT a patient-journey map or a blueprint worksheet; do not include journey diagrams, "must never break", or "what to improve next".

Given the chosen platforms and the provider's context, produce:
- A short stack name.
- For EACH chosen platform: why it fits THIS provider (tie to their budget/size/needs) and one concrete integration tip (how it connects to their other chosen tools).
- A short setup guide: 2–4 concrete steps naming specific platforms and actions.
- A 1–2 sentence summary.

Respond ONLY with valid JSON in exactly this shape, nothing else:
{
  "stackName": "",
  "recommendedStack": [
    {
      "module": "",
      "platform": "",
      "whyItFitsYou": "",
      "integrationTip": ""
    }
  ],
  "setupGuide": [],
  "summary": ""
}
`.trim();

export function buildAssemblyPrompt(picks, context = {}) {
  const lines = picks.map((p) => `- ${p.module}: ${p.platform}`).join("\n");

  return `
About the user: ${context.aboutMe || "not provided"}
Clinic stage: ${context.stage || "not specified"}
Patient journey note: ${context.journeyNote || "not specified"}

The practice has chosen these platforms, one per layer:
${lines}

Create their final Stack Recommendation.
`.trim();
}

export function parseAssemblyResponse(rawReply) {
  let text = (rawReply || "")
    .trim()
    .replace(/^```json/i, "")
    .replace(/^```/, "")
    .replace(/```$/, "")
    .trim();

  try {
    const d = JSON.parse(text);

    return {
      stackName: String(d.stackName || "Your Stack Recommendation"),

      recommendedStack: Array.isArray(d.recommendedStack)
        ? d.recommendedStack
            .filter((r) => r && r.module && r.platform)
            .map((r) => ({
              module: String(r.module),
              platform: String(r.platform),
              whyItFitsYou: String(r.whyItFitsYou || ""),
              integrationTip: String(r.integrationTip || ""),
            }))
        : [],

      setupGuide: Array.isArray(d.setupGuide) ? d.setupGuide.map(String) : [],

      summary: String(d.summary || ""),
    };
  } catch {
    return {
      stackName: "Your Stack Recommendation",
      recommendedStack: [],
      setupGuide: [],
      summary: "Could not parse the AI response.",
    };
  }
}