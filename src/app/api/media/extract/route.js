import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { extractMedia, validateUrlPayload } from "@/lib/media";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();
    const { url } = validateUrlPayload(body);
    const result = await extractMedia({ url, mode: body.mode || "video" });

    return NextResponse.json(result, {
      headers: {
        "cache-control": "no-store"
      }
    });
  } catch (error) {
    const message =
      error instanceof ZodError ? error.issues[0]?.message || "Invalid request." : error.message || "Unknown error.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
