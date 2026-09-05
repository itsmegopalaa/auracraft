import type { AiProvider } from "../types";
import type {
  AiCoverGenerationRequest,
  AiCoverGenerationResult,
  AiGeneratedAsset,
} from "../types";

import type { CoverSide } from "@/app/lib/customization";

type FluxSubmitResponse = {
  id?: string;
  polling_url?: string;
  cost?: number | null;
  input_mp?: number | null;
  output_mp?: number | null;
};

type FluxResultResponse = {
  id?: string;
  status?: string;
  result?: unknown;
  progress?: number | null;
  details?: Record<string, unknown> | null;
  preview?: Record<string, unknown> | null;
  cost?: number;
};

const ENDPOINT =
  process.env.FLUX_API_ENDPOINT?.trim() ||
  "https://api.bfl.ai/v1/flux-2-klein-4b";

const RESULT_ENDPOINT =
  process.env.FLUX_RESULT_ENDPOINT?.trim() ||
  "https://api.bfl.ai/v1/get_result";

const API_KEY =
  process.env.BFL_API_KEY?.trim() ||
  process.env.FLUX_API_KEY?.trim() ||
  "";

const MODEL =
  process.env.FLUX_MODEL?.trim() ||
  "flux-2-klein-4b";

const POLL_INTERVAL_MS = 1500;
const MAX_POLL_ATTEMPTS = 40;

/*
 * FLUX.2 Klein accepts image references as URLs or
 * base64 strings. MineNote currently uses text-to-image,
 * so input images are intentionally not supplied yet.
 *
 * 1024 × 1440 keeps an A4-like portrait composition
 * while remaining comfortably below the final A4
 * production resolution.
 */
const OUTPUT_WIDTH = 1024;
const OUTPUT_HEIGHT = 1440;

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function normalizeStatus(status: unknown): string {
  return typeof status === "string"
    ? status.trim().toLowerCase()
    : "";
}

function findHttpUrl(value: unknown): string | null {
  if (typeof value === "string") {
    return /^https?:\/\//i.test(value)
      ? value
      : null;
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const url = findHttpUrl(item);

      if (url) {
        return url;
      }
    }

    return null;
  }

  for (const nestedValue of Object.values(value)) {
    const url = findHttpUrl(nestedValue);

    if (url) {
      return url;
    }
  }

  return null;
}

function getResultImageUrl(
  payload: FluxResultResponse
): string | null {
  return findHttpUrl(payload.result);
}

async function pollResult(
  taskId: string
): Promise<FluxResultResponse> {
  for (
    let attempt = 1;
    attempt <= MAX_POLL_ATTEMPTS;
    attempt++
  ) {
    const response = await fetch(
      `${RESULT_ENDPOINT}?id=${encodeURIComponent(taskId)}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          "x-key": API_KEY,
        },
        cache: "no-store",
      }
    );

    const payload =
      (await response.json().catch(() => ({}))) as FluxResultResponse;

    if (!response.ok) {
      throw new Error(
        `FLUX result request failed (${response.status}).`
      );
    }

    const status =
      normalizeStatus(payload.status);

    if (status === "error") {
      const detail =
        payload.details &&
        typeof payload.details === "object"
          ? JSON.stringify(payload.details)
          : "";

      throw new Error(
        `FLUX generation failed${detail ? `: ${detail}` : "."}`
      );
    }

    if (
      status === "request moderated" ||
      status === "content moderated"
    ) {
      throw new Error(
        "FLUX generation was moderated and no image was produced."
      );
    }

    if (status === "task not found") {
      throw new Error(
        "FLUX generation task was not found."
      );
    }

    if (status === "ready") {
      const imageUrl =
        getResultImageUrl(payload);

      if (!imageUrl) {
        throw new Error(
          "FLUX reported Ready without a usable image URL."
        );
      }

      return payload;
    }

    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error(
    "FLUX generation timed out while waiting for the result."
  );
}

function buildSidePrompt(
  request: AiCoverGenerationRequest,
  side: CoverSide
): string {
  const sideInstruction =
    side === "front"
      ? "Create the FRONT cover artwork."
      : side === "insideFront"
        ? "Create the INSIDE FRONT cover artwork."
        : side === "insideBack"
          ? "Create the INSIDE BACK cover artwork."
          : "Create the BACK cover artwork.";

  const negativeInstruction =
    request.negativePrompt?.trim()
      ? ` Avoid the following: ${request.negativePrompt.trim()}.`
      : "";

  return [
    "Create artwork for a premium custom notebook cover.",
    sideInstruction,
    "Portrait composition.",
    "Keep important visual subjects away from the extreme edges.",
    "Do not add logos, brand names, watermarks, signatures, or customer names.",
    request.prompt.trim(),
    negativeInstruction,
  ]
    .filter(Boolean)
    .join(" ");
}

async function generateSingleSide(
  request: AiCoverGenerationRequest,
  side: CoverSide
): Promise<AiGeneratedAsset> {
  const prompt =
    buildSidePrompt(request, side);

  const response = await fetch(
    ENDPOINT,
    {
      method: "POST",

      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "x-key": API_KEY,
      },

      body: JSON.stringify({
        prompt,
        width: OUTPUT_WIDTH,
        height: OUTPUT_HEIGHT,
        safety_tolerance: 2,
        output_format: "png",
      }),
    }
  );

  const responseBody =
    await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail =
      responseBody &&
      typeof responseBody === "object"
        ? JSON.stringify(responseBody)
        : String(responseBody);

    throw new Error(
      `FLUX ${side} request failed (${response.status})${
        detail ? `: ${detail.slice(0, 500)}` : "."
      }`
    );
  }

  const task =
    responseBody as FluxSubmitResponse;

  if (!task.id) {
    throw new Error(
      `FLUX ${side} request did not return a task ID.`
    );
  }

  const result =
    await pollResult(task.id);

  const imageUrl =
    getResultImageUrl(result);

  if (!imageUrl) {
    throw new Error(
      `FLUX ${side} result did not contain an image URL.`
    );
  }

  return {
    side,
    url: imageUrl,
    width: OUTPUT_WIDTH,
    height: OUTPUT_HEIGHT,
    mimeType: "image/png",

    metadata: {
      provider: "black-forest-labs",
      model: MODEL,
      taskId: task.id,
      cost: task.cost ?? result.cost ?? null,
      inputMp: task.input_mp ?? null,
      outputMp: task.output_mp ?? null,
    },
  };
}

export const fluxProvider: AiProvider = {
  id: "flux" as const,

  name: "FLUX.2 Klein 4B",

  capabilities: {
    supportedSides: [
      "front",
      "insideFront",
      "insideBack",
      "back",
    ],
    supportsNegativePrompt: true,
    supportsImageToImage: true,
    supportsReferenceImages: true,
  },

  async generateCover(
    request: AiCoverGenerationRequest
  ): Promise<AiCoverGenerationResult> {
    if (!API_KEY) {
      throw new Error(
        "BFL_API_KEY is not configured."
      );
    }

    const sides: CoverSide[] =
      request.sides.length > 0
        ? request.sides
        : ["front"];

    const assets: AiGeneratedAsset[] = [];

    /*
     * Each requested side is its own FLUX task.
     * This prevents one image from incorrectly being
     * stored as both front and back.
     */
    for (const side of sides) {
      const asset =
        await generateSingleSide(
          request,
          side
        );

      assets.push(asset);
    }

    const taskIds = assets
      .map(
        (asset) =>
          asset.metadata?.taskId
      )
      .filter(
        (id): id is string =>
          typeof id === "string"
      );

    const costs = assets
      .map(
        (asset) =>
          asset.metadata?.cost
      )
      .filter(
        (cost): cost is number =>
          typeof cost === "number"
      );

    const totalCost =
      costs.length > 0
        ? costs.reduce(
            (sum, cost) =>
              sum + cost,
            0
          )
        : null;

    return {
      provider: "flux",

      model: MODEL,

      status: "completed",

      assets,

      metadata: {
        provider: "black-forest-labs",
        model: MODEL,
        taskIds,
        requestedSides: sides,
        outputWidth: OUTPUT_WIDTH,
        outputHeight: OUTPUT_HEIGHT,
        totalProviderCost: totalCost,
      },
    };
  },
};
