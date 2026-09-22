export const CUSTOM_COVER_BASE_FEE = 200;
export const CUSTOM_COVER_ADDITIONAL_COPY_FEE = 100;

export function getCustomCoverFee(quantity: number) {
  const normalizedQuantity = Math.max(
    1,
    Math.floor(
      Number.isFinite(Number(quantity))
        ? Number(quantity)
        : 1,
    ),
  );

  return (
    CUSTOM_COVER_BASE_FEE +
    CUSTOM_COVER_ADDITIONAL_COPY_FEE *
      Math.max(0, normalizedQuantity - 1)
  );
}
