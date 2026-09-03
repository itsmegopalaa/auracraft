import { createHttpAiProvider } from "./http";

const endpoint =
  process.env.FLUX_API_ENDPOINT?.trim() ?? "";

const apiKey =
  process.env.FLUX_API_KEY?.trim() || undefined;

const model =
  process.env.FLUX_MODEL?.trim() || "FLUX.1-schnell";

export const fluxProvider = createHttpAiProvider({
  id: "flux",
  name: "FLUX",
  endpoint,
  apiKey,
  model,
});
