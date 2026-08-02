// Benchmark 4 models x 5 prompts via 9Router
const ROUTER = "http://localhost:20128";
const KEY = "sk-95d682f695a131c0-zez1b4-77670ead";

const MODELS = [
  "oc/deepseek-v4-flash-free",
  "oc/mimo-v2.5-free",
  "oc/nemotron-3-ultra-free",
  "openrouter/google/gemma-4-31b-it:free",
];

const PROMPTS = [
  "What is the capital of Indonesia? Answer in one sentence.",
  "Write a Python function to check if a number is prime.",
  "Explain quantum computing in simple terms.",
  "Translate 'Good morning, how are you today?' to Japanese.",
  "Write a haiku about programming.",
];

async function test(model, prompt) {
  const start = performance.now();
  try {
    const res = await fetch(`${ROUTER}/v1/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], max_tokens: 150 }),
      signal: AbortSignal.timeout(30000),
    });
    const raw = await res.text();
    const json = JSON.parse(raw.replace(/data: \[DONE\]\s*$/, "").trim());
    const ms = Math.round(performance.now() - start);

    if (json.error) {
      const msg = (json.error.message || "").slice(0, 80);
      return { ok: false, ms, error: msg };
    }

    const msg = json.choices?.[0]?.message;
    const content = msg?.content || msg?.reasoning_content || "[empty]";
    const usage = json.usage || {};
    return {
      ok: true, ms,
      in: usage.prompt_tokens || "?",
      out: usage.completion_tokens || "?",
      text: content.replace(/\n/g, " ").slice(0, 100),
    };
  } catch (e) {
    return { ok: false, ms: Math.round(performance.now() - start), error: e.message?.slice(0, 60) };
  }
}

console.log("=== BENCHMARK START ===\n");

const results = {};

for (const model of MODELS) {
  const short = model.split("/").pop();
  console.log(`━━━ ${short} ━━━`);
  results[short] = { times: [], errors: 0 };

  for (const [i, prompt] of PROMPTS.entries()) {
    const r = await test(model, prompt);
    if (r.ok) {
      console.log(`  Q${i + 1} ✅ ${r.ms}ms (${r.in}in/${r.out}out) → ${r.text}`);
      results[short].times.push(r.ms);
    } else {
      console.log(`  Q${i + 1} ❌ ${r.ms}ms: ${r.error}`);
      results[short].errors++;
    }
  }
  console.log("");
}

// Summary
console.log("━━━ SUMMARY ━━━");
for (const [model, data] of Object.entries(results)) {
  const avg = data.times.length ? Math.round(data.times.reduce((a, b) => a + b, 0) / data.times.length) : 0;
  const min = data.times.length ? Math.min(...data.times) : 0;
  const max = data.times.length ? Math.max(...data.times) : 0;
  const pass = 5 - data.errors;
  console.log(`  ${model}: ${pass}/5 pass | avg ${avg}ms | ${min}-${max}ms | ${data.errors} errors`);
}
console.log("\n=== BENCHMARK END ===");
