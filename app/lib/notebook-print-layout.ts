import {
  getNotebookPrintSequence,
  getNotebookPrintSide,
  getNotebookPrintSheet,
  type NotebookBindingEdge,
  type NotebookDuplexMode,
  type NotebookPhysicalSide,
  type NotebookPrintSheet,
} from "@/app/lib/notebook-physical-model";

export type NotebookPrintLayout = {
  paperSize: "A4" | "A5";
  orientation: "portrait" | "landscape";
  bindingEdge: NotebookBindingEdge;
  duplexMode: NotebookDuplexMode;
  sheets: readonly NotebookPrintSheet[];
};

export type NotebookPrintAsset = {
  physicalSide: NotebookPhysicalSide;
  url: string;
};

export function createNotebookPrintLayout(options?: {
  paperSize?: "A4" | "A5";
  orientation?: "portrait" | "landscape";
  bindingEdge?: NotebookBindingEdge;
  duplexMode?: NotebookDuplexMode;
}): NotebookPrintLayout {
  const paperSize = options?.paperSize ?? "A4";
  const orientation = options?.orientation ?? "portrait";
  const bindingEdge = options?.bindingEdge ?? "left";
  const duplexMode = options?.duplexMode ?? "long-edge";

  return {
    paperSize,
    orientation,
    bindingEdge,
    duplexMode,
    sheets: [
      getNotebookPrintSheet("sheet1"),
      getNotebookPrintSheet("sheet2"),
    ].map((sheet) => ({
      ...sheet,
      bindingEdge,
      duplexMode,
    })),
  };
}

export function resolveNotebookPrintAsset(
  assets: readonly NotebookPrintAsset[],
  physicalSide: NotebookPhysicalSide,
): NotebookPrintAsset | null {
  return (
    assets.find(
      (asset) => asset.physicalSide === physicalSide,
    ) ?? null
  );
}

export function buildNotebookPrintPairs(
  assets: readonly NotebookPrintAsset[],
) {
  return createNotebookPrintLayout().sheets.map((sheet) => ({
    sheetId: sheet.sheetId,
    front: {
      specification: sheet.front,
      asset: resolveNotebookPrintAsset(
        assets,
        sheet.front.physicalSide,
      ),
    },
    reverse: {
      specification: sheet.reverse,
      asset: resolveNotebookPrintAsset(
        assets,
        sheet.reverse.physicalSide,
      ),
    },
    bindingEdge: sheet.bindingEdge,
    duplexMode: sheet.duplexMode,
  }));
}

export function getNotebookPrintOrder(): readonly NotebookPhysicalSide[] {
  return getNotebookPrintSequence().map(
    (side) => side.physicalSide,
  );
}

export function getNotebookPrintSideForAsset(
  physicalSide: NotebookPhysicalSide,
) {
  return getNotebookPrintSide(physicalSide);
}
