export class AiGenerationError extends Error {
  readonly code: string;

  constructor(
    message: string,
    code = "AI_GENERATION_FAILED"
  ) {
    super(message);
    this.name = "AiGenerationError";
    this.code = code;
  }
}

export class AiGenerationLimitError extends AiGenerationError {
  constructor(message = "AI generation limit reached.") {
    super(message, "AI_GENERATION_LIMIT_REACHED");
    this.name = "AiGenerationLimitError";
  }
}

export class AiProviderConfigurationError extends AiGenerationError {
  constructor(message = "AI provider is not configured.") {
    super(message, "AI_PROVIDER_NOT_CONFIGURED");
    this.name = "AiProviderConfigurationError";
  }
}
