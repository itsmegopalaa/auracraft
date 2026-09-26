import { describe, expect, it } from "vitest";
import { getCartItemKey } from "@/app/context/CartContext";

describe("getCartItemKey", () => {
  const base = {
    id: "product-1",
    pages: 200 as const,
    paper: "plain" as const,
    paperGsm: 80,
    size: "A4" as const,
    orientation: "portrait" as const,
  };

  it("merges identical physical configurations", () => {
    const keyA = getCartItemKey(base);
    const keyB = getCartItemKey({ ...base });

    expect(keyA).toBe(keyB);
  });

  it("separates different page counts", () => {
    const baseKey = getCartItemKey(base);

    expect(
      getCartItemKey({
        ...base,
        pages: 100,
      }),
    ).not.toBe(baseKey);

    expect(
      getCartItemKey({
        ...base,
        pages: 150,
      }),
    ).not.toBe(baseKey);
  });

  it("separates different paper types", () => {
    const baseKey = getCartItemKey(base);

    expect(
      getCartItemKey({
        ...base,
        paper: "ruled",
      }),
    ).not.toBe(baseKey);

    expect(
      getCartItemKey({
        ...base,
        paper: "dotGrid",
      }),
    ).not.toBe(baseKey);
  });

  it("separates different GSM values", () => {
    const baseKey = getCartItemKey(base);

    expect(
      getCartItemKey({
        ...base,
        paperGsm: 90,
      }),
    ).not.toBe(baseKey);
  });

  it("separates different sizes", () => {
    const baseKey = getCartItemKey(base);

    expect(
      getCartItemKey({
        ...base,
        size: "A5",
      }),
    ).not.toBe(baseKey);
  });

  it("separates different orientations", () => {
    const baseKey = getCartItemKey(base);

    expect(
      getCartItemKey({
        ...base,
        orientation: "landscape",
      }),
    ).not.toBe(baseKey);
  });

  it("separates custom-cover items from normal items", () => {
    const baseKey = getCartItemKey(base);

    const customKey = getCartItemKey({
      ...base,
      customCoverId: "custom-1",
    });

    expect(customKey).not.toBe(baseKey);
    expect(customKey).toBe("product-1::custom::custom-1");
  });

  it("keeps different custom covers separate", () => {
    const customA = getCartItemKey({
      ...base,
      customCoverId: "custom-1",
    });

    const customB = getCartItemKey({
      ...base,
      customCoverId: "custom-2",
    });

    expect(customA).not.toBe(customB);
  });

  it("gives explicit cartKey priority", () => {
    expect(
      getCartItemKey({
        ...base,
        cartKey: "explicit-key",
      }),
    ).toBe("explicit-key");
  });

  it("uses stable defaults when optional physical fields are missing", () => {
    expect(
      getCartItemKey({
        id: "product-1",
      }),
    ).toBe(
      "product-1::pages::default::paper::plain::gsm::80::size::A4::orientation::portrait",
    );
  });

  it("keeps different products separate", () => {
    const productA = getCartItemKey(base);

    const productB = getCartItemKey({
      ...base,
      id: "product-2",
    });

    expect(productA).not.toBe(productB);
  });
});
