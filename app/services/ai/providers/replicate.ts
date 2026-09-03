import { createHttpAiProvider } from "./http";

const endpoint =
  process.env.REPLICATE_API_ENDPOINT?.trim() ?? "";

const apiKey =
  process.env.REPLICATE_API_TOKEN?.trim() || undefined;

const model =
  process.env.REPLICATE_MODEL?.trim() || "flux";

export const replicateProvider = createHttpAiProvider({
  id: "replicate",
  name: "Replicate",
  endpoint,
  apiKey,
  model,
});
