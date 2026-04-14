import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files").filter((value) => value instanceof File);

    if (files.length < 2) {
      return NextResponse.json({ error: "Add at least two PDFs to merge them." }, { status: 400 });
    }

    const invalidFile = files.find((file) => file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"));

    if (invalidFile) {
      return NextResponse.json({ error: `${invalidFile.name} is not a valid PDF file.` }, { status: 400 });
    }

    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      let sourcePdf;

      try {
        sourcePdf = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
      } catch {
        return NextResponse.json(
          {
            error: `${file.name} could not be opened as a readable PDF.`
          },
          { status: 400 }
        );
      }

      const copiedPages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedBytes = await mergedPdf.save();

    return new Response(Buffer.from(mergedBytes), {
      headers: {
        "content-type": "application/pdf",
        "content-length": String(mergedBytes.length),
        "content-disposition": 'attachment; filename="free2all-merged.pdf"',
        "cache-control": "no-store"
      }
    });
  } catch {
    return NextResponse.json({ error: "The PDFs could not be merged right now. Please try again." }, { status: 500 });
  }
}
