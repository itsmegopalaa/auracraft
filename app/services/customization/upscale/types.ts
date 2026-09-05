export type UpscaleProviderId =
  | "sharp"
  | "external"
  | "custom";

export type UpscaleInput = {
  artwork: Buffer;
  width: number;
  height: number;
  mimeType: string;
  targetWidth: number;
  targetHeight: number;
  provider?: UpscaleProviderId;
};

export type UpscaleResult = {
  buffer: Buffer;
  width: number;
  height: number;
  mimeType: "image/png";
  provider: UpscaleProviderId;
  scaleFactor: number;
  fileSize: number;
};

export type UpscaleProvider = {
  id: UpscaleProviderId;
  name: string;

  upscale(
    input: UpscaleInput
  ): Promise<UpscaleResult>;
};
