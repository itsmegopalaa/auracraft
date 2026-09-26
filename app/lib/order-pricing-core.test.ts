import { describe, expect, it } from "vitest";

import {
  normalizePhysicalConfig,
  resolvePagePrice,
} from "./order-pricing-core";

const pricingRows = [
  { product_id: "product-1", pages: 100, price: 849 },
  { product_id: "product-1", pages: 150, price: 1049 },
  { product_id: "product-1", pages: 200, price: 1249 },
];

const base = {
  pages: 200,
  paper: "ruled",
  paperGsm: 80,
  size: "A4",
  orientation: "portrait",
} as const;

describe("order-pricing-core", () => {
  it("resolves canonical page prices", () => {
    expect(
      resolvePagePrice(pricingRows, "product-1", 100),
    ).toBe(849);

    expect(
      resolvePagePrice(pricingRows, "product-1", 150),
    ).toBe(1049);

    expect(
      resolvePagePrice(pricingRows, "product-1", 200),
    ).toBe(1249);
  });

  it("normalizes physical config", () => {
    expect(normalizePhysicalConfig(base)).toEqual({
      pages: 200,
      paper: "ruled",
      paperGsm: 80,
      size: "A4",
      orientation: "portrait",
    });
  });

  it("preserves paper", () => {
    expect(
      normalizePhysicalConfig({
        ...base,
        paper: "plain",
      }).paper,
    ).toBe("plain");
  });

  it("preserves GSM", () => {
    expect(
      normalizePhysicalConfig({
        ...base,
        paperGsm: 100,
      }).paperGsm,
    ).toBe(100);
  });

  it("preserves size", () => {
    expect(
      normalizePhysicalConfig({
        ...base,
        size: "A5",
      }).size,
    ).toBe("A5");
  });

  it("preserves orientation", () => {
    expect(
      normalizePhysicalConfig({
        ...base,
        orientation: "landscape",
      }).orientation,
    ).toBe("landscape");
  });

  it("rejects invalid pages", () => {
    expect(() =>
      normalizePhysicalConfig({
        ...base,
        pages: 250,
      }),
    ).toThrow();
  });

  it("rejects invalid paper", () => {
    expect(() =>
      normalizePhysicalConfig({
        ...base,
        paper: "invalid",
      }),
    ).toThrow();
  });

  it("rejects invalid size", () => {
    expect(() =>
      normalizePhysicalConfig({
        ...base,
        size: "A3",
      }),
    ).toThrow();
  });

  it("rejects invalid orientation", () => {
    expect(() =>
      normalizePhysicalConfig({
        ...base,
        orientation: "sideways",
      }),
    ).toThrow();
  });

  it("rejects invalid GSM", () => {
    expect(() =>
      normalizePhysicalConfig({
        ...base,
        paperGsm: 0,
      }),
    ).toThrow();
  });

  it("rejects missing product pricing", () => {
    expect(() =>
      resolvePagePrice(
        pricingRows,
        "missing-product",
        200,
      ),
    ).toThrow();
  });
});
