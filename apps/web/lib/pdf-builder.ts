import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb } from "pdf-lib";
import { readFile } from "fs/promises";
import path from "path";

let fontCache: Uint8Array | null = null;

async function loadCyrillicFont() {
  if (!fontCache) {
    const fontPath = path.join(
      process.cwd(),
      "public/fonts/NotoSans-Regular.ttf",
    );
    fontCache = await readFile(fontPath);
  }
  return fontCache;
}

export async function createPdfDocument() {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const fontBytes = await loadCyrillicFont();
  const font = await pdf.embedFont(fontBytes);
  return { pdf, font };
}

export type PdfDrawer = {
  page: ReturnType<PDFDocument["addPage"]>;
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>;
  y: number;
  draw: (text: string, size?: number, x?: number) => void;
  newPage: () => void;
};

export async function createPdfDrawer(): Promise<{
  pdf: PDFDocument;
  drawer: PdfDrawer;
}> {
  const { pdf, font } = await createPdfDocument();
  let page = pdf.addPage([595, 842]);
  let y = 800;

  const drawer: PdfDrawer = {
    page,
    font,
    y,
    draw(text: string, size = 11, x = 50) {
      if (y < 60) {
        drawer.newPage();
      }
      page.drawText(text, {
        x,
        y,
        size,
        font,
        color: rgb(0.1, 0.1, 0.1),
      });
      y -= size + 8;
      drawer.y = y;
    },
    newPage() {
      page = pdf.addPage([595, 842]);
      y = 800;
      drawer.page = page;
      drawer.y = y;
    },
  };

  return { pdf, drawer };
}

export async function pdfToResponse(
  pdf: PDFDocument,
  filename: string,
): Promise<Response> {
  const bytes = await pdf.save();
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
