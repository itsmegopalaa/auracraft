import { createHttpAiProvider } from "./http";

const endpoint =
  process.env.OPENAI_IMAGE_ENDPOINT?.trim() ?? "";

const apiKey =
  process.env.OPENAI_API_KEY?.trim() || undefined;

const model =
  process.env.OPENAI_IMAGE_MODEL?.trim() || "image-generation";

export const openAiProvider = createHttpAiProvider({
  id: "openai",
  name: "OpenAI",
  endpoint,
  apiKey,
  model,
});
