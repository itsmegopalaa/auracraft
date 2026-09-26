import { describe, expect, it } from "vitest";

const pricingRows = [
  { product_id: "product-1", pages: 100, price: 849 },
  { product_id: "product-1", pages: 150, price: 1049 },
  { product_id: "product-1", pages: 200, price: 1249 },
];

const products = [
  {
    id: "product-1",
    name: "Sakura Anime",
    image: "/images/notebooks/sakura.png",
    stock: 50,
  },
];

function isAllowedPages(value: unknown) {
  return value === 100 || value === 150 || value === 200;
}

function isAllowedPaper(value: unknown) {
  return (
    value === "plain" ||
    value === "ruled" ||
    value === "dotGrid"
  );
}

function isAllowedSize(value: unknown) {
  return value === "A4" || value === "A5";
}

function isAllowedOrientation(value: unknown) {
  return value === "portrait" || value === "landscape";
}

function normalizeGsm(value: unknown) {
  const gsm = Number(value ?? 80);

  if (!Number.isFinite(gsm) || gsm <= 0 || gsm > 1000) {
    throw new Error("Invalid notebook paper GSM.");
  }

  return gsm;
}

/*
 * Mirrors the authoritative normalization contract used by
 * app/lib/order-pricing.ts.
 *
 * Security invariant:
 * price always comes from server-side pricingRows.
 * inputItem.price is never trusted.
 */
function normalizeOrderItem(inputItem: Record<string, unknown>) {
  const product = products.find(
    (item) => item.id === inputItem.id,
  );

  if (!product) {
    throw new Error("Invalid product.");
  }

  const pages = inputItem.pages;

  if (!isAllowedPages(pages)) {
    throw new Error("Missing/invalid pages.");
  }

  const paper = inputItem.paper;

  if (!isAllowedPaper(paper)) {
    throw new Error("Missing/invalid paper.");
  }

  const size = inputItem.size;

  if (!isAllowedSize(size)) {
    throw new Error("Missing/invalid size.");
  }

  const orientation = inputItem.orientation;

  if (!isAllowedOrientation(orientation)) {
    throw new Error("Missing/invalid orientation.");
  }

  const paperGsm = normalizeGsm(
    inputItem.paperGsm ?? 80,
  );

  const pagePrice = pricingRows.find(
    (item) =>
      item.product_id === product.id &&
      item.pages === pages,
  );

  if (!pagePrice) {
    throw new Error(
      `Pricing unavailable for ${pages} pages.`,
    );
  }

  return {
    id: product.id,
    name: product.name,
    price: pagePrice.price,
    quantity: Number(inputItem.quantity),
    image: product.image,
    pages,
    paper,
    paperGsm,
    size,
    orientation,
    customCoverId:
      typeof inputItem.customCoverId === "string"
        ? inputItem.customCoverId
        : null,
  };
}

const base = {
  id: "product-1",
  quantity: 1,
  pages: 200,
  paper: "plain",
  paperGsm: 80,
  size: "A4",
  orientation: "portrait",
};

describe("order-pricing", () => {
  it("resolves canonical 100-page price", () => {
    const result = normalizeOrderItem({
      ...base,
      pages: 100,
    });

    expect(result.price).toBe(849);
  });

  it("resolves canonical 150-page price", () => {
    const result = normalizeOrderItem({
      ...base,
      pages: 150,
    });

    expect(result.price).toBe(1049);
  });

  it("resolves canonical 200-page price", () => {
    const result = normalizeOrderItem({
      ...base,
      pages: 200,
    });

    expect(result.price).toBe(1249);
  });

  it("never trusts client-supplied price", () => {
    const result = normalizeOrderItem({
      ...base,
      price: 1,
    });

    expect(result.price).toBe(1249);
  });

  it("preserves physical configuration", () => {
    const result = normalizeOrderItem({
      ...base,
      paper: "ruled",
      paperGsm: 80,
      size: "A5",
      orientation: "landscape",
    });

    expect(result.paper).toBe("ruled");
    expect(result.paperGsm).toBe(80);
    expect(result.size).toBe("A5");
    expect(result.orientation).toBe("landscape");
  });

  it("rejects invalid pages", () => {
    expect(() =>
      normalizeOrderItem({
        ...base,
        pages: 120,
      }),
    ).toThrow();
  });

  it("rejects invalid paper", () => {
    expect(() =>
      normalizeOrderItem({
        ...base,
        paper: "invalid",
      }),
    ).toThrow();
  });

  it("rejects invalid size", () => {
    expect(() =>
      normalizeOrderItem({
        ...base,
        size: "A3",
      }),
    ).toThrow();
  });

  it("rejects invalid orientation", () => {
    expect(() =>
      normalizeOrderItem({
        ...base,
        orientation: "sideways",
      }),
    ).toThrow();
  });

  it("rejects invalid GSM", () => {
    expect(() =>
      normalizeOrderItem({
        ...base,
        paperGsm: 0,
      }),
    ).toThrow();
  });
});
