import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

import { requireAdminApi } from "@/app/lib/admin-auth";
import { createSupabaseAdminClient } from "@/app/lib/supabase";
import {
  normalizeProductProductionAssets,
  PRODUCT_PRODUCTION_SIDES,
  type ProductProductionAsset,
} from "@/app/lib/product-production-assets";
import {
  MINENOTE_TEMPLATE_VERSION,
} from "@/app/lib/minenote-production-template";

const BUCKET = "minenote-product-production";

type ProductRow = {
  id: string;
  name: string;
  image: string | null;
  active: boolean;
  pages: number | null;
  paper: string | null;
  size: string | null;
  theme: string | null;
  production_assets: unknown;
  production_template_version: string | null;
};

function physicalConfig(
  side: ProductProductionAsset["side"],
) {
  if (side === "front") {
    return {
      sheetId: "sheet1" as const,
      sheetSide: "front" as const,
    };
  }

  if (side === "insideFront") {
    return {
      sheetId: "sheet1" as const,
      sheetSide: "reverse" as const,
    };
  }

  if (side === "insideBack") {
    return {
      sheetId: "sheet2" as const,
      sheetSide: "front" as const,
    };
  }

  return {
    sheetId: "sheet2" as const,
    sheetSide: "reverse" as const,
  };
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function prettyValue(value: string | null | undefined) {
  if (!value) return "Standard";

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function svgBytes(svg: string) {
  return new TextEncoder().encode(svg);
}

function createInsideFrontSvg(product: ProductRow) {
  const name = escapeXml(product.name);

  return `
<svg xmlns="http://www.w3.org/2000/svg"
     width="2480"
     height="3508"
     viewBox="0 0 2480 3508">

  <rect width="2480" height="3508" fill="#f6f3ed"/>

  <rect x="120" y="120" width="2240" height="3268"
        rx="72"
        fill="#fbfaf7"
        stroke="#d8d2c7"
        stroke-width="6"/>

  <circle cx="1240" cy="410" r="105"
          fill="#202020"/>

  <text x="1240" y="438"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="48"
        font-weight="700"
        letter-spacing="2"
        fill="#ffffff">MN</text>

  <text x="1240" y="650"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="82"
        font-weight="700"
        letter-spacing="-2"
        fill="#171717">MineNote</text>

  <text x="1240" y="735"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="27"
        font-weight="600"
        letter-spacing="9"
        fill="#8b8378">CRAFT YOUR IDENTITY</text>

  <line x1="530" y1="850" x2="1950" y2="850"
        stroke="#cfc8bc"
        stroke-width="4"/>

  <text x="1240" y="1110"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="58"
        font-weight="700"
        fill="#202020">${name}</text>

  <text x="1240" y="1190"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="28"
        letter-spacing="5"
        fill="#9a9288">PERSONAL NOTEBOOK</text>

  <rect x="390" y="1430" width="1700" height="720"
        rx="42"
        fill="#f1eee8"
        stroke="#ddd7cd"
        stroke-width="3"/>

  <text x="500" y="1545"
        font-family="Arial, Helvetica, sans-serif"
        font-size="28"
        font-weight="700"
        letter-spacing="4"
        fill="#7c746a">THIS NOTEBOOK IS YOURS</text>

  <text x="500" y="1640"
        font-family="Arial, Helvetica, sans-serif"
        font-size="34"
        fill="#242424">Ideas. Plans. Sketches.</text>

  <text x="500" y="1710"
        font-family="Arial, Helvetica, sans-serif"
        font-size="34"
        fill="#242424">Every page becomes part of your story.</text>

  <line x1="500" y1="1810" x2="1980" y2="1810"
        stroke="#d2cbc0"
        stroke-width="3"/>

  <text x="500" y="1905"
        font-family="Arial, Helvetica, sans-serif"
        font-size="25"
        font-weight="700"
        letter-spacing="3"
        fill="#8a8278">FORMAT</text>

  <text x="500" y="1960"
        font-family="Arial, Helvetica, sans-serif"
        font-size="28"
        fill="#292929">${escapeXml(prettyValue(product.size))}</text>

  <text x="1050" y="1905"
        font-family="Arial, Helvetica, sans-serif"
        font-size="25"
        font-weight="700"
        letter-spacing="3"
        fill="#8a8278">PAPER</text>

  <text x="1050" y="1960"
        font-family="Arial, Helvetica, sans-serif"
        font-size="28"
        fill="#292929">${escapeXml(prettyValue(product.paper))}</text>

  <text x="1600" y="1905"
        font-family="Arial, Helvetica, sans-serif"
        font-size="25"
        font-weight="700"
        letter-spacing="3"
        fill="#8a8278">PAGES</text>

  <text x="1600" y="1960"
        font-family="Arial, Helvetica, sans-serif"
        font-size="28"
        fill="#292929">${product.pages ?? "Standard"}</text>

  <text x="1240" y="2520"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="31"
        font-style="italic"
        fill="#756d63">Write. Plan. Create. Become.</text>

  <line x1="800" y1="2640" x2="1680" y2="2640"
        stroke="#d0c9be"
        stroke-width="3"/>

  <text x="1240" y="2820"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="38"
        font-weight="700"
        fill="#202020">minenote.in</text>

  <text x="1240" y="2910"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="23"
        letter-spacing="3"
        fill="#8c847a">A BRAND BY AURACRAFT</text>

  <text x="1240" y="3170"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="21"
        fill="#aaa197">Crafted with care in India</text>
</svg>`;
}

function createInsideBackSvg(product: ProductRow) {
  const name = escapeXml(product.name);

  return `
<svg xmlns="http://www.w3.org/2000/svg"
     width="2480"
     height="3508"
     viewBox="0 0 2480 3508">

  <rect width="2480" height="3508" fill="#f6f3ed"/>

  <rect x="120" y="120" width="2240" height="3268"
        rx="72"
        fill="#fbfaf7"
        stroke="#d8d2c7"
        stroke-width="6"/>

  <text x="1240" y="510"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="78"
        font-weight="700"
        fill="#202020">MineNote</text>

  <text x="1240" y="595"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="27"
        font-weight="600"
        letter-spacing="9"
        fill="#8b8378">CRAFT YOUR IDENTITY</text>

  <line x1="530" y1="720" x2="1950" y2="720"
        stroke="#cfc8bc"
        stroke-width="4"/>

  <text x="1240" y="950"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="52"
        font-weight="700"
        fill="#202020">${name}</text>

  <text x="1240" y="1030"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="27"
        letter-spacing="5"
        fill="#9a9288">MADE FOR YOUR EVERYDAY IDEAS</text>

  <rect x="390" y="1270" width="1700" height="1050"
        rx="42"
        fill="#f1eee8"
        stroke="#ddd7cd"
        stroke-width="3"/>

  <text x="500" y="1400"
        font-family="Arial, Helvetica, sans-serif"
        font-size="27"
        font-weight="700"
        letter-spacing="4"
        fill="#7c746a">NOTEBOOK DETAILS</text>

  <text x="500" y="1510"
        font-family="Arial, Helvetica, sans-serif"
        font-size="25"
        font-weight="700"
        fill="#8a8278">PRODUCT</text>

  <text x="500" y="1570"
        font-family="Arial, Helvetica, sans-serif"
        font-size="31"
        fill="#242424">${name}</text>

  <text x="500" y="1690"
        font-family="Arial, Helvetica, sans-serif"
        font-size="25"
        font-weight="700"
        fill="#8a8278">FORMAT</text>

  <text x="500" y="1750"
        font-family="Arial, Helvetica, sans-serif"
        font-size="31"
        fill="#242424">${escapeXml(prettyValue(product.size))}</text>

  <text x="500" y="1870"
        font-family="Arial, Helvetica, sans-serif"
        font-size="25"
        font-weight="700"
        fill="#8a8278">PAPER</text>

  <text x="500" y="1930"
        font-family="Arial, Helvetica, sans-serif"
        font-size="31"
        fill="#242424">${escapeXml(prettyValue(product.paper))}</text>

  <text x="1300" y="1510"
        font-family="Arial, Helvetica, sans-serif"
        font-size="25"
        font-weight="700"
        fill="#8a8278">PAGES</text>

  <text x="1300" y="1570"
        font-family="Arial, Helvetica, sans-serif"
        font-size="31"
        fill="#242424">${product.pages ?? "Standard"}</text>

  <text x="1300" y="1690"
        font-family="Arial, Helvetica, sans-serif"
        font-size="25"
        font-weight="700"
        fill="#8a8278">CRAFTED BY</text>

  <text x="1300" y="1750"
        font-family="Arial, Helvetica, sans-serif"
        font-size="31"
        fill="#242424">MineNote</text>

  <text x="1300" y="1870"
        font-family="Arial, Helvetica, sans-serif"
        font-size="25"
        font-weight="700"
        fill="#8a8278">BRAND</text>

  <text x="1300" y="1930"
        font-family="Arial, Helvetica, sans-serif"
        font-size="31"
        fill="#242424">AuraCraft</text>

  <line x1="500" y1="2080" x2="1980" y2="2080"
        stroke="#d2cbc0"
        stroke-width="3"/>

  <text x="1240" y="2460"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="34"
        font-style="italic"
        fill="#756d63">Your thoughts deserve a place.</text>

  <text x="1240" y="2630"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="38"
        font-weight="700"
        fill="#202020">minenote.in</text>

  <text x="1240" y="2720"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="23"
        letter-spacing="3"
        fill="#8c847a">A BRAND BY AURACRAFT</text>

  <text x="1240" y="3050"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="21"
        fill="#aaa197">Crafted with care in India</text>
</svg>`;
}

async function downloadProductImage(imageUrl: string) {
  if (imageUrl.startsWith("/")) {
    const localPath = path.join(
      process.cwd(),
      "public",
      imageUrl.slice(1),
    );

    const bytes = await fs.readFile(localPath);

    const extension =
      path.extname(localPath).toLowerCase();

    const contentType =
      extension === ".jpg" || extension === ".jpeg"
        ? "image/jpeg"
        : extension === ".webp"
          ? "image/webp"
          : "image/png";

    return {
      bytes: new Uint8Array(bytes),
      contentType,
    };
  }

  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(
      `Unable to download product artwork (${response.status}).`,
    );
  }

  const contentType =
    response.headers.get("content-type") ||
    "image/png";

  if (!contentType.startsWith("image/")) {
    throw new Error(
      `Product artwork is not an image (${contentType}).`,
    );
  }

  return {
    bytes: new Uint8Array(await response.arrayBuffer()),
    contentType,
  };
}

async function uploadAsset(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  productId: string,
  side: ProductProductionAsset["side"],
  bytes: Uint8Array,
  mimeType: string,
) {
  const storagePath =
    `product/${productId}/${MINENOTE_TEMPLATE_VERSION}/${side}.svg`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, bytes, {
      contentType: mimeType,
      cacheControl: "31536000",
      upsert: true,
    });

  if (error) {
    throw new Error(
      `Unable to upload ${side}: ${error.message}`,
    );
  }

  return storagePath;
}

async function signAsset(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  storagePath: string,
) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 60 * 60);

  if (error || !data?.signedUrl) {
    throw new Error(
      `Unable to sign production asset: ${storagePath}`,
    );
  }

  return data.signedUrl;
}

function createFrontSvg(
  imageBytes: Uint8Array,
  mimeType: string,
) {
  let binary = "";

  for (let index = 0; index < imageBytes.length; index += 1) {
    binary += String.fromCharCode(imageBytes[index]);
  }

  const encoded = Buffer.from(binary, "binary").toString("base64");

  return `
<svg xmlns="http://www.w3.org/2000/svg"
     width="2480"
     height="3508"
     viewBox="0 0 2480 3508">
  <rect width="2480" height="3508" fill="#ffffff"/>
  <image
    href="data:${mimeType};base64,${encoded}"
    x="0"
    y="0"
    width="2480"
    height="3508"
    preserveAspectRatio="xMidYMid slice"/>
</svg>`;
}

function createBackSvg(
  imageBytes: Uint8Array,
  mimeType: string,
  product: ProductRow,
) {
  let binary = "";

  for (let index = 0; index < imageBytes.length; index += 1) {
    binary += String.fromCharCode(imageBytes[index]);
  }

  const encoded = Buffer.from(binary, "binary").toString("base64");

  return `
<svg xmlns="http://www.w3.org/2000/svg"
     width="2480"
     height="3508"
     viewBox="0 0 2480 3508">

  <!-- Same artwork as the front: intentionally reused for visual continuity. -->
  <image
    href="data:${mimeType};base64,${encoded}"
    x="0"
    y="0"
    width="2480"
    height="3508"
    preserveAspectRatio="xMidYMid slice"/>

  <!-- Premium translucent brand panel. -->
  <rect x="170" y="170" width="2140" height="3168"
        rx="72"
        fill="#111111"
        fill-opacity="0.22"
        stroke="#ffffff"
        stroke-opacity="0.55"
        stroke-width="5"/>

  <rect x="360" y="1370" width="1760" height="760"
        rx="48"
        fill="#111111"
        fill-opacity="0.72"/>

  <text x="1240" y="1530"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="82"
        font-weight="700"
        letter-spacing="1"
        fill="#ffffff">MineNote</text>

  <text x="1240" y="1625"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="25"
        font-weight="600"
        letter-spacing="8"
        fill="#eeeeee">CRAFT YOUR IDENTITY</text>

  <line x1="720" y1="1710" x2="1760" y2="1710"
        stroke="#ffffff"
        stroke-opacity="0.55"
        stroke-width="3"/>

  <text x="1240" y="1835"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="43"
        font-weight="700"
        fill="#ffffff">${escapeXml(product.name)}</text>

  <text x="1240" y="1925"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="26"
        fill="#eeeeee">PERSONAL NOTEBOOK</text>

  <text x="1240" y="2050"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="25"
        letter-spacing="3"
        fill="#dddddd">minenote.in</text>

  <text x="1240" y="3230"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="21"
        letter-spacing="3"
        fill="#ffffff"
        fill-opacity="0.9">A BRAND BY AURACRAFT</text>
</svg>`;
}

export async function prepareAllCatalogProduction() {
  const supabase = createSupabaseAdminClient();

  const {
    data: products,
    error: productsError,
  } = await supabase
    .from("products")
    .select(
      "id, name, image, active, pages, paper, size, theme, production_assets, production_template_version",
    )
    .eq("active", true)
    .order("created_at", {
      ascending: true,
    });

  if (productsError) {
    return NextResponse.json(
      { error: productsError.message },
      { status: 500 },
    );
  }

  const results: Array<{
    id: string;
    name: string;
    complete: boolean;
    created: boolean;
    error?: string;
  }> = [];

  for (const product of (products ?? []) as ProductRow[]) {
    try {
      if (!product.image?.trim()) {
        throw new Error(
          "Product has no catalog artwork image.",
        );
      }

      const existingAssets =
        normalizeProductProductionAssets(
          product.production_assets,
        );

      const existingBySide = new Map(
        existingAssets.map((asset) => [
          asset.side,
          asset,
        ]),
      );

      /*
       * Download the catalog artwork once.
       * It becomes the source for the front and the
       * product-specific back-cover composition.
       */
      const sourceImage = await downloadProductImage(
        product.image.trim(),
      );

      const nextAssets: ProductProductionAsset[] = [];

      for (const side of PRODUCT_PRODUCTION_SIDES) {
        const existing = existingBySide.get(side);

        /*
         * Never overwrite an already configured production asset.
         */
        if (existing?.storagePath) {
          nextAssets.push({
            ...existing,
            ...physicalConfig(side),
            templateVersion:
              MINENOTE_TEMPLATE_VERSION,
          });

          continue;
        }

        let svg: string;

        if (side === "front") {
          svg = createFrontSvg(
            sourceImage.bytes,
            sourceImage.contentType,
          );
        } else if (side === "insideFront") {
          svg = createInsideFrontSvg(product);
        } else if (side === "insideBack") {
          svg = createInsideBackSvg(product);
        } else {
          svg = createBackSvg(
            sourceImage.bytes,
            sourceImage.contentType,
            product,
          );
        }

        const storagePath = await uploadAsset(
          supabase,
          product.id,
          side,
          svgBytes(svg),
          "image/svg+xml",
        );

        const url = await signAsset(
          supabase,
          storagePath,
        );

        nextAssets.push({
          side,
          ...physicalConfig(side),
          url,
          storagePath,
          width: 2480,
          height: 3508,
          mimeType: "image/svg+xml",
          source:
            side === "front"
              ? "product_artwork"
              : "composed",
          templateVersion:
            MINENOTE_TEMPLATE_VERSION,
        });
      }

      const { error: updateError } = await supabase
        .from("products")
        .update({
          production_assets: nextAssets,
          production_template_version:
            MINENOTE_TEMPLATE_VERSION,
        })
        .eq("id", product.id);

      if (updateError) {
        throw new Error(
          `Unable to save production assets: ${updateError.message}`,
        );
      }

      results.push({
        id: product.id,
        name: product.name,
        complete: true,
        created: true,
      });
    } catch (error) {
      results.push({
        id: product.id,
        name: product.name,
        complete: false,
        created: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown production preparation error.",
      });
    }
  }

  const failed = results.filter(
    (result) => !result.complete,
  );

  return {
    ok: failed.length === 0,
    templateVersion: MINENOTE_TEMPLATE_VERSION,
    total: results.length,
    completed: results.length - failed.length,
    failed: failed.length,
    results,
  };
}

export async function POST() {
  const adminAuth = await requireAdminApi();

  if (adminAuth.error) {
    return NextResponse.json(
      { error: adminAuth.error },
      { status: adminAuth.status },
    );
  }

  return NextResponse.json(
    await prepareAllCatalogProduction(),
  );
}
