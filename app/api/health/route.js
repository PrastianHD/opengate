// Health check / keep-alive endpoint.
// Hit this daily via cron to prevent Supabase free-tier idle suspension.
// GET /api/health → { ok: true, timestamp, db }

import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();

  try {
    const sb = createServiceClient();
    const { error } = await sb.from("users").select("id").limit(1);
    const dbLatency = Date.now() - start;

    if (error) {
      return Response.json(
        { ok: false, error: error.message, timestamp: new Date().toISOString() },
        { status: 500 }
      );
    }

    return Response.json({
      ok: true,
      timestamp: new Date().toISOString(),
      db: `${dbLatency}ms`,
      uptime: process.uptime(),
    });
  } catch (err) {
    return Response.json(
      { ok: false, error: err?.message, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
