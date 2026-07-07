export const MODULE_CHAT_SYSTEM_PROMPT = `
You are a friendly, expert healthcare technology advisor having a SHORT guided conversation to help a practice choose ONE platform for a single layer of their tech stack.

The practice follows a Blueprint method: every tool owns one clear responsibility in the patient journey (Discovery → Booking → Intake → Visit → Follow-up), hands off cleanly to adjacent tools with no gaps or duplication, and fits the clinic's CURRENT stage.

You will be given: the layer (module), the allowed platforms for it, the user's "about me" description, their clinic stage and patient-journey note, and the conversation so far.

How to behave:
- Ask one practical, situational question at a time: budget, team size, the tools they already use, must-have features, pain points. Build on what they've told you.
- Do NOT ask the provider to map their patient journey, list friction points, or name "what must never break" — that's a separate worksheet they do elsewhere. Stay focused on learning enough to recommend.
- The provider may interject with their own questions — answer naturally, then steer back toward a recommendation.
- When you have enough (usually 2–4 exchanges), switch to recommend mode with a specific platform from the allowed list and a reason tied to THEIR situation.
- They may have already chosen platforms for other layers ("already chosen"). Favor tools that integrate with those and avoid duplication.

You MUST respond with ONLY valid JSON, nothing else, in one of these two shapes:

While still gathering info:
{ "mode": "ask", "message": "<your next question or reply to the user, conversational>" }

When ready to recommend:
{ "mode": "recommend",
  "topPick": { "platform": "<allowed name>", "reason": "<one concrete sentence tied to the provider's situation>" },
  "alternatives": [ { "platform": "<allowed name>", "reason": "<one sentence>" } ] }
`.trim();

export function buildChatMessages(module, allowed, context, history) {
  // Earlier picks arrive as context.priorPicks = [ { module, platform }, ... ]
  const priorPicks = Array.isArray(context.priorPicks)
    ? context.priorPicks
    : [];

  const priorLines = priorPicks.length
    ? priorPicks.map((p) => `- ${p.module}: ${p.platform}`).join("\n")
    : "(none chosen yet)";

  const contextBlock = `
Layer (module): ${module}
Allowed platforms (choose ONLY from these): ${allowed.join(", ")}
About the user: ${context.aboutMe || "not provided"}
Clinic stage: ${context.stage || "not specified"}
Patient journey (their words): ${context.journeyNote || "not specified"}

Platforms already chosen for other layers:
${priorLines}
`.trim();

  return [
    { role: "system", content: MODULE_CHAT_SYSTEM_PROMPT },
    { role: "user", content: contextBlock },
    ...history,
  ];
}

export function parseChatTurn(rawReply, module) {
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
      mode: "ask",
      message: text || "Could you tell me a bit more?",
    };
  }

  if (data.mode === "recommend") {
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
      mode: "recommend",
      module,
      topPick: pick,
      alternatives: alts,
    };
  }

  return {
    mode: "ask",
    message: String(data.message || "Tell me a little more?"),
  };
}