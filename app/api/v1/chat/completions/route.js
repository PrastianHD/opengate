import { handleChatCompletions } from "@/lib/gateway/handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    return await handleChatCompletions(request);
  } catch (err) {
    console.error("[/v1/chat/completions] unhandled:", err);
    return new Response(
      JSON.stringify({
        error: {
          message: err?.message || "Unhandled gateway error",
          type: "internal_error",
          code: "internal_error",
          stack: process.env.NODE_ENV !== "production" ? err?.stack : undefined,
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
