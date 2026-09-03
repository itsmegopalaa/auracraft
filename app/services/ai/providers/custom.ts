import { createHttpAiProvider } from "./http";

const endpoint =
  process.env.CUSTOM_AI_API_ENDPOINT?.trim() ?? "";

const apiKey =
  process.env.CUSTOM_AI_API_KEY?.trim() || undefined;

const model =
  process.env.CUSTOM_AI_MODEL?.trim() || "custom";

export const customAiProvider = createHttpAiProvider({
  id: "custom",
  name: "Custom / Self-hosted",
  endpoint,
  apiKey,
  model,
});
