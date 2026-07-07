// Standing instruction for the per-module recommendation.
export const MODULE_SYSTEM_PROMPT = `
You are a healthcare technology advisor helping a practice choose ONE platform for a single layer of their tech stack.
You will be given the layer (module), the list of allowed platforms for it, and the practice's answers to a few questions.
Choose the single best platform for this layer from the allowed list, plus 1 to 2 alternatives worth considering.
Base your reasoning on the answers (practice size, budget, insurance, specialty, etc.). Never suggest a platform that isn't in the allowed list.
Respond ONLY with valid JSON in exactly this shape, nothing else:
{
  "module": "<module>",
  "topPick": { "platform": "<name>", "reason": "<one concrete sentence>" },
  "alternatives": [ { "platform": "<name>", "reason": "<one sentence>" } ]
}
`.trim();

// module   = e.g. "ehr"
// answers  = { "How many providers?": "1", "Do you accept insurance?": "No", ... }
// menu     = the parsed platformMenu.json
export function buildModulePrompt(module, answers, menu) {
  const allowed = (menu.modules && menu.modules[module]) || [];

  const answerLines = Object.entries(answers)
    .map(([q, a]) => `- ${q} ${a}`)
    .join("\n");

  return `
Layer (module): ${module}
Allowed platforms (choose only from these): ${allowed.join(", ")}

The practice answered:
${answerLines || "- (no answers provided)"}

Pick the best platform for the "${module}" layer now.
`.trim();
}

// Turn GPT's raw reply into a guaranteed-valid per-module result.
export function parseModuleResponse(rawReply, module) {
  let text = (rawReply || "")
    .trim()
    .replace(/^```json/i, "")
    .replace(/^```/, "")
    .replace(/```$/, "")
    .trim();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    return {
      module,
      topPick: null,
      alternatives: [],
      error: "Could not parse AI response",
    };
  }

  const pick =
    data.topPick && data.topPick.platform
      ? {
          platform: String(data.topPick.platform),
          reason: String(data.topPick.reason || ""),
        }
      : null;

  const alts = Array.isArray(data.alternatives)
    ? data.alternatives
        .filter((a) => a && a.platform)
        .map((a) => ({
          platform: String(a.platform),
          reason: String(a.reason || ""),
        }))
        .slice(0, 2)
    : [];

  return {
    module: data.module || module,
    topPick: pick,
    alternatives: alts,
  };
}