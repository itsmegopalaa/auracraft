import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  CreateAiGenerationRowInput,
  CreateCustomCoverAssetRowInput,
  AiGenerationRow,
  CustomCoverAssetRow,
} from "./types";

type DatabaseClient = SupabaseClient;

export async function createAiGenerationRecord(
  supabase: DatabaseClient,
  input: CreateAiGenerationRowInput
): Promise<AiGenerationRow> {
  const { data, error } = await supabase
    .from("custom_cover_generations")
    .insert({
      id: input.id,
      customization_id: input.customizationId,
      provider: input.provider,
      model: input.model ?? null,
      prompt: input.prompt,
      negative_prompt: input.negativePrompt ?? null,
      generation_number: input.generationNumber,
      status: input.status ?? "pending",
      metadata: input.metadata ?? {},
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Failed to create AI generation record: ${error.message}`
    );
  }

  return data as AiGenerationRow;
}

export async function completeAiGenerationRecord(
  supabase: DatabaseClient,
  generationId: string,
  input: {
    model: string;
    status: "completed";
    frontAssetId?: string | null;
    backAssetId?: string | null;
    metadata?: Record<string, unknown>;
  }
): Promise<AiGenerationRow> {
  const { data, error } = await supabase
    .from("custom_cover_generations")
    .update({
      model: input.model,
      status: input.status,
      front_asset_id: input.frontAssetId ?? null,
      back_asset_id: input.backAssetId ?? null,
      metadata: input.metadata ?? {},
      error_message: null,
      completed_at: new Date().toISOString(),
    })
    .eq("id", generationId)
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Failed to complete AI generation record: ${error.message}`
    );
  }

  return data as AiGenerationRow;
}

export async function failAiGenerationRecord(
  supabase: DatabaseClient,
  generationId: string,
  errorMessage: string,
  metadata?: Record<string, unknown>
): Promise<AiGenerationRow> {
  const { data, error } = await supabase
    .from("custom_cover_generations")
    .update({
      status: "failed",
      error_message: errorMessage,
      metadata: metadata ?? {},
      completed_at: new Date().toISOString(),
    })
    .eq("id", generationId)
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Failed to mark AI generation as failed: ${error.message}`
    );
  }

  return data as AiGenerationRow;
}

export async function createCustomCoverAssetRecord(
  supabase: DatabaseClient,
  input: CreateCustomCoverAssetRowInput
): Promise<CustomCoverAssetRow> {
  const { data, error } = await supabase
    .from("custom_cover_assets")
    .insert({
      customization_id: input.customizationId,
      side: input.side,
      kind: input.kind,
      storage_path: input.storagePath,
      width: input.width ?? null,
      height: input.height ?? null,
      mime_type: input.mimeType,
      file_size: input.fileSize ?? null,
      metadata: input.metadata ?? {},
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Failed to create custom cover asset record: ${error.message}`
    );
  }

  return data as CustomCoverAssetRow;
}


export async function deleteCustomCoverAssetRecord(
  supabase: DatabaseClient,
  assetId: string
): Promise<void> {
  const { error } = await supabase
    .from("custom_cover_assets")
    .delete()
    .eq("id", assetId);

  if (error) {
    throw new Error(
      `Failed to delete custom cover asset record: ${error.message}`
    );
  }
}

export async function getAiGenerationById(
  supabase: DatabaseClient,
  generationId: string
): Promise<AiGenerationRow | null> {
  const { data, error } = await supabase
    .from("custom_cover_generations")
    .select("*")
    .eq("id", generationId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load AI generation record: ${error.message}`
    );
  }

  return data as AiGenerationRow | null;
}
