import OpenAI from "openai";
import dotenv from "dotenv";
import { MODULE_CHAT_SYSTEM_PROMPT, buildChatMessages, parseChatTurn } from "../reasoning/conversationPrompt.js";
import { buildAssemblyPrompt, ASSEMBLY_SYSTEM_PROMPT, parseAssemblyResponse } from "../reasoning/assemblyPrompt.js";

dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Send a full messages array to GPT and return the raw reply text.
async function askGptMessages(messages) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    response_format: { type: "json_object" },
  });
  return completion.choices[0].message.content;
}

// One conversational turn for a module.
// history = [ { role:"assistant"|"user", content }, ... ]
// context = { aboutMe, stage, journeyNote }
export async function moduleTurn(module, history, context, menu) {
  const allowed = (menu.modules && menu.modules[module]) || [];
  const messages = buildChatMessages(module, allowed, context, history);  // Person 2
  const reply = await askGptMessages(messages);                           // you
  return parseChatTurn(reply, module);                                    // Person 2 → {mode:"ask"...} or {mode:"recommend"...}
}

// Final assembly (unchanged flow, richer context).
export async function assembleStack(picks, context) {
  const prompt = buildAssemblyPrompt(picks, context);
  const messages = [
    { role: "system", content: ASSEMBLY_SYSTEM_PROMPT },
    { role: "user", content: prompt },
  ];
  const reply = await askGptMessages(messages);
  return parseAssemblyResponse(reply);
}



