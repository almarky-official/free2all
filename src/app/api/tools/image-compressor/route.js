import { NextResponse } from "next/server";
import { z } from "zod";

const metricsSchema = z.object({
  name: z.string().min(1),
  originalSize: z.number().positive(),
  compressedSize: z.number().positive(),
  quality: z.number().min(1).max(100)
});

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const payload = metricsSchema.parse(await request.json());
    const reduction = Math.max(0, Math.round(((payload.originalSize - payload.compressedSize) / payload.originalSize) * 100));

    return NextResponse.json({
      message: `${payload.name} optimized with ${reduction}% estimated size reduction at ${payload.quality}% quality.`
    });
  } catch {
    return NextResponse.json({ error: "Invalid compression metrics." }, { status: 400 });
  }
}
