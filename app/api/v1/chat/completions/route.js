import { handleChatCompletions } from "@/lib/gateway/handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  return handleChatCompletions(request);
}
