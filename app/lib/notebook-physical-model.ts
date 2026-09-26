export const NOTEBOOK_SHEETS = [
  {
    id: "sheet1",
    label: "Sheet 1",
    sides: ["front", "insideFront"],
  },
  {
    id: "sheet2",
    label: "Sheet 2",
    sides: ["insideBack", "back"],
  },
] as const;

export type NotebookSheetId =
  (typeof NOTEBOOK_SHEETS)[number]["id"];

export type NotebookPhysicalSide =
  | "front"
  | "insideFront"
  | "insideBack"
  | "back";

export type NotebookSheetSide =
  | "front"
  | "reverse";

export type NotebookSheet = {
  id: NotebookSheetId;
  label: string;
  front: NotebookPhysicalSide;
  reverse: NotebookPhysicalSide;
};

export const NOTEBOOK_PHYSICAL_SHEETS: readonly NotebookSheet[] = [
  {
    id: "sheet1",
    label: "Sheet 1",
    front: "front",
    reverse: "insideFront",
  },
  {
    id: "sheet2",
    label: "Sheet 2",
    front: "insideBack",
    reverse: "back",
  },
] as const;

export const NOTEBOOK_PHYSICAL_SIDES = [
  "front",
  "insideFront",
  "insideBack",
  "back",
] as const;

export function getNotebookSheetForSide(
  side: NotebookPhysicalSide,
): NotebookSheet {
  const sheet = NOTEBOOK_PHYSICAL_SHEETS.find(
    (candidate) =>
      candidate.front === side || candidate.reverse === side,
  );

  if (!sheet) {
    throw new Error(`Unknown notebook physical side: ${side}`);
  }

  return sheet;
}

export function getNotebookSheetSide(
  side: NotebookPhysicalSide,
): NotebookSheetSide {
  const sheet = getNotebookSheetForSide(side);

  return sheet.front === side ? "front" : "reverse";
}

export function getOppositePhysicalSide(
  side: NotebookPhysicalSide,
): NotebookPhysicalSide {
  const sheet = getNotebookSheetForSide(side);

  return sheet.front === side ? sheet.reverse : sheet.front;
}

export function getNotebookPrintSheets(): readonly NotebookSheet[] {
  return NOTEBOOK_PHYSICAL_SHEETS;
}

export function isNotebookPhysicalSide(
  value: unknown,
): value is NotebookPhysicalSide {
  return (
    typeof value === "string" &&
    (NOTEBOOK_PHYSICAL_SIDES as readonly string[]).includes(value)
  );
}

export type NotebookBindingEdge = "left" | "top";

export type NotebookDuplexMode =
  | "long-edge"
  | "short-edge";

export type NotebookPrintSide = {
  sheetId: NotebookSheetId;
  side: "front" | "reverse";
  physicalSide: NotebookPhysicalSide;
};

export type NotebookPrintSheet = {
  sheetId: NotebookSheetId;
  front: NotebookPrintSide;
  reverse: NotebookPrintSide;
  bindingEdge: NotebookBindingEdge;
  duplexMode: NotebookDuplexMode;
};

export const DEFAULT_NOTEBOOK_BINDING_EDGE: NotebookBindingEdge =
  "left";

export const DEFAULT_NOTEBOOK_DUPLEX_MODE: NotebookDuplexMode =
  "long-edge";

export const NOTEBOOK_PRINT_SHEETS: readonly NotebookPrintSheet[] =
  NOTEBOOK_PHYSICAL_SHEETS.map((sheet) => ({
    sheetId: sheet.id,
    front: {
      sheetId: sheet.id,
      side: "front",
      physicalSide: sheet.front,
    },
    reverse: {
      sheetId: sheet.id,
      side: "reverse",
      physicalSide: sheet.reverse,
    },
    bindingEdge: DEFAULT_NOTEBOOK_BINDING_EDGE,
    duplexMode: DEFAULT_NOTEBOOK_DUPLEX_MODE,
  }));

export function getNotebookPrintSheet(
  sheetId: NotebookSheetId,
): NotebookPrintSheet {
  const sheet = NOTEBOOK_PRINT_SHEETS.find(
    (candidate) => candidate.sheetId === sheetId,
  );

  if (!sheet) {
    throw new Error(`Unknown notebook print sheet: ${sheetId}`);
  }

  return sheet;
}

export function getNotebookPrintSide(
  physicalSide: NotebookPhysicalSide,
): NotebookPrintSide {
  const sheet = getNotebookSheetForSide(physicalSide);

  return physicalSide === sheet.front
    ? getNotebookPrintSheet(sheet.id).front
    : getNotebookPrintSheet(sheet.id).reverse;
}

export function getNotebookPrintSequence(): readonly NotebookPrintSide[] {
  return NOTEBOOK_PRINT_SHEETS.flatMap((sheet) => [
    sheet.front,
    sheet.reverse,
  ]);
}
