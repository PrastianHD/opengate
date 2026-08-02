import CopyButton from "../components/CopyButton";
import { JsonLd } from "../components/JsonLd";

export const metadata = {
  title: "Documentation",
  description:
    "OpenGate API documentation. Drop any OpenAI-compatible client into our gateway by changing the base URL. Quickstart guides for cURL, Python, and Node.js SDKs.",
  alternates: {
    canonical: "/docs",
  },
};

// ── Code Snippets ──────────────────────────────────────────

const CURL_BASIC = `curl https://api.opengate.host/v1/chat/completions \\
  -H "Authorization: Bearer ogt-xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "deepseek-v4-flash",
    "messages": [{"role": "user", "content": "Hello"}]
  }'`;

const CURL_STREAM = `curl https://api.opengate.host/v1/chat/completions \\
  -H "Authorization: Bearer ogt-xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "deepseek-v4-flash",
    "messages": [{"role": "user", "content": "Tell me a joke"}],
    "stream": true
  }'`;

const PYTHON_SNIPPET = `from openai import OpenAI

client = OpenAI(
    base_url="https://api.opengate.host/v1",
    api_key="ogt-xxx"
)

response = client.chat.completions.create(
    model="deepseek-v4-flash",
    messages=[{"role": "user", "content": "Hello"}]
)
print(response.choices[0].message.content)`;

const PYTHON_STREAM = `from openai import OpenAI

client = OpenAI(
    base_url="https://api.opengate.host/v1",
    api_key="ogt-xxx"
)

stream = client.chat.completions.create(
    model="deepseek-v4-flash",
    messages=[{"role": "user", "content": "Tell me a joke"}],
    stream=True
)
for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")`;

const NODE_SNIPPET = `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.opengate.host/v1",
  apiKey: "ogt-xxx"
});

const res = await client.chat.completions.create({
  model: "deepseek-v4-flash",
  messages: [{ role: "user", content: "Hello" }]
});
console.log(res.choices[0].message.content);`;

const NODE_STREAM = `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.opengate.host/v1",
  apiKey: "ogt-xxx"
});

const stream = await client.chat.completions.create({
  model: "deepseek-v4-flash",
  messages: [{ role: "user", content: "Tell me a joke" }],
  stream: true
});
for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || "");
}`;

const PYTHON_MULTIMODEL = `from openai import OpenAI

client = OpenAI(
    base_url="https://api.opengate.host/v1",
    api_key="ogt-xxx"
)

# Switch models with a single string change
models = ["deepseek-v4-flash", "glm-5.1", "minimax-2.7"]
for model in models:
    res = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": f"Say hi using {model}"}]
    )
    print(f"{model}: {res.choices[0].message.content}")`;

const CURL_LIST_MODELS = `curl https://api.opengate.host/v1/models \\
  -H "Authorization: Bearer ogt-xxx"`;

const CURL_TOOL_CALL = `curl https://api.opengate.host/v1/chat/completions \\
  -H "Authorization: Bearer ogt-xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "claude-opus-4.7",
    "messages": [{"role": "user", "content": "What is the weather in Jakarta?"}],
    "tools": [{
      "type": "function",
      "function": {
        "name": "get_weather",
        "description": "Get weather for a city",
        "parameters": {
          "type": "object",
          "properties": {
            "city": {"type": "string"}
          },
          "required": ["city"]
        }
      }
    }]
  }'`;

// ── Page Component ─────────────────────────────────────────

export default function DocsPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Documentation",
          url: "https://opengate.host/docs",
          description:
            "OpenAI-compatible REST API. Drop your existing client in by changing the base URL.",
          inLanguage: "en",
        }}
      />
      <div className="section-heading">
        <p className="eyebrow">◆ Documentation</p>
        <h2>Get started in minutes</h2>
        <p>
          OpenAI-compatible REST API. Drop your existing client in by changing
          the base URL. Works with any tool that speaks OpenAI protocol.
        </p>
      </div>

      <section className="docs-section">
        <div className="docs-grid">
          {/* ── Sidebar ── */}
          <aside className="docs-sidebar">
            <h4>Getting Started</h4>
            <a href="#quickstart">Quickstart</a>
            <a href="#auth">Authentication</a>
            <a href="#base-url">Base URL</a>
            <a href="#models-available">Available Models</a>

            <h4>Chat Completions</h4>
            <a href="#basic-request">Basic Request</a>
            <a href="#streaming">Streaming</a>
            <a href="#tool-calling">Tool Calling</a>
            <a href="#model-switching">Model Switching</a>

            <h4>Reference</h4>
            <a href="#endpoints">Endpoints</a>
            <a href="#parameters">Parameters</a>
            <a href="#response-format">Response Format</a>
            <a href="#errors">Error Handling</a>
            <a href="#rate-limits">Rate Limits</a>
            <a href="#billing">Billing</a>

            <h4>SDKs</h4>
            <a href="#sdk-python">Python</a>
            <a href="#sdk-node">Node.js</a>
            <a href="#sdk-curl">cURL</a>
          </aside>

          {/* ── Content ── */}
          <div className="docs-content">

            {/* Quickstart */}
            <div className="docs-block" id="quickstart">
              <h3>Quickstart</h3>
              <p>
                1. Get your API key from the{" "}
                <a href="https://t.me/opengate_bot" target="_blank" rel="noreferrer">
                  Telegram bot
                </a>{" "}
                → <code>/buat-key</code>
              </p>
              <p>
                2. Set the base URL and start making requests:
              </p>
              <div className="code-block-wrap">
                <CopyButton text={CURL_BASIC} />
                <pre className="code-block">{CURL_BASIC}</pre>
              </div>
            </div>

            {/* Authentication */}
            <div className="docs-block" id="auth">
              <h3>Authentication</h3>
              <p>
                All requests require a Bearer token in the{" "}
                <code>Authorization</code> header. Your API key starts with{" "}
                <code>ogt-</code>.
              </p>
              <div className="code-block-wrap">
                <CopyButton text="Authorization: Bearer ogt-xxxxxxxxxxxxxxxx" />
                <div className="code-block">
                  <span className="code-header">Authorization:</span>{" "}
                  <span className="code-value">
                    Bearer ogt-xxxxxxxxxxxxxxxx
                  </span>
                </div>
              </div>
              <p className="docs-note">
                ⚠️ Keep your key secret. Do not expose it in client-side code or
                public repos.
              </p>
            </div>

            {/* Base URL */}
            <div className="docs-block" id="base-url">
              <h3>Base URL</h3>
              <p>Set this as the base URL in any OpenAI-compatible client:</p>
              <div className="code-block-wrap">
                <CopyButton text="https://api.opengate.host/v1" />
                <div className="code-block">
                  <span className="code-url">
                    https://api.opengate.host/v1
                  </span>
                </div>
              </div>
            </div>

            {/* Available Models */}
            <div className="docs-block" id="models-available">
              <h3>Available Models</h3>
              <p>
                Pass the model name as a string. Switch models by changing one
                parameter — no SDK swap needed.
              </p>
              <div className="models-mini-table">
                <div className="model-mini-row header">
                  <span>Model</span>
                  <span>Tier</span>
                  <span>Input $/M</span>
                  <span>Output $/M</span>
                </div>
                <div className="model-mini-row">
                  <span><code>deepseek-v4-flash</code></span>
                  <span className="badge-fast">fast</span>
                  <span>$0.17</span>
                  <span>$0.34</span>
                </div>
                <div className="model-mini-row">
                  <span><code>deepseek-v4-pro</code></span>
                  <span className="badge-flagship">flagship</span>
                  <span>$0.66</span>
                  <span>$2.63</span>
                </div>
                <div className="model-mini-row">
                  <span><code>glm-5.1</code></span>
                  <span className="badge-flagship">flagship</span>
                  <span>$0.60</span>
                  <span>$2.40</span>
                </div>
                <div className="model-mini-row">
                  <span><code>glm-5</code></span>
                  <span className="badge-standard">standard</span>
                  <span>$0.36</span>
                  <span>$1.44</span>
                </div>
                <div className="model-mini-row">
                  <span><code>minimax-2.7</code></span>
                  <span className="badge-flagship">flagship</span>
                  <span>$1.44</span>
                  <span>$5.76</span>
                </div>
                <div className="model-mini-row">
                  <span><code>minimax-2.5</code></span>
                  <span className="badge-standard">standard</span>
                  <span>$0.72</span>
                  <span>$2.88</span>
                </div>
                <div className="model-mini-row">
                  <span><code>claude-opus-4.7</code></span>
                  <span className="badge-flagship">flagship</span>
                  <span>$18.00</span>
                  <span>$90.00</span>
                </div>
                <div className="model-mini-row">
                  <span><code>claude-sonnet-4.6</code></span>
                  <span className="badge-flagship">flagship</span>
                  <span>$3.60</span>
                  <span>$18.00</span>
                </div>
                <div className="model-mini-row">
                  <span><code>claude-haiku-4.5</code></span>
                  <span className="badge-fast">fast</span>
                  <span>$0.96</span>
                  <span>$4.80</span>
                </div>
                <div className="model-mini-row">
                  <span><code>gpt-5.5</code></span>
                  <span className="badge-flagship">flagship</span>
                  <span>$9.60</span>
                  <span>$38.40</span>
                </div>
                <div className="model-mini-row">
                  <span><code>gpt-5.4</code></span>
                  <span className="badge-flagship">flagship</span>
                  <span>$5.40</span>
                  <span>$21.60</span>
                </div>
                <div className="model-mini-row">
                  <span><code>gpt-5.3-codex</code></span>
                  <span className="badge-flagship">flagship</span>
                  <span>$6.00</span>
                  <span>$24.00</span>
                </div>
                <div className="model-mini-row">
                  <span><code>mimo-v2.5</code></span>
                  <span className="badge-fast">fast</span>
                  <span>$0.10</span>
                  <span>$0.20</span>
                </div>
              </div>
              <p>
                Full list with filters:{" "}
                <a href="/models">/models</a>
              </p>
            </div>

            {/* Basic Request */}
            <div className="docs-block" id="basic-request">
              <h3>Basic Request</h3>
              <p>
                Send a chat completion request. The response is fully
                OpenAI-compatible.
              </p>
              <div className="code-block-wrap">
                <CopyButton text={CURL_BASIC} />
                <pre className="code-block">{CURL_BASIC}</pre>
              </div>
            </div>

            {/* Streaming */}
            <div className="docs-block" id="streaming">
              <h3>Streaming</h3>
              <p>
                Set <code>"stream": true</code> to receive tokens as they are
                generated. Works with SSE (Server-Sent Events).
              </p>
              <div className="code-block-wrap">
                <CopyButton text={CURL_STREAM} />
                <pre className="code-block">{CURL_STREAM}</pre>
              </div>
            </div>

            {/* Tool Calling */}
            <div className="docs-block" id="tool-calling">
              <h3>Tool Calling</h3>
              <p>
                Supported on models marked with tools capability (Claude, GLM,
                GPT). Define functions and let the model decide when to call
                them.
              </p>
              <div className="code-block-wrap">
                <CopyButton text={CURL_TOOL_CALL} />
                <pre className="code-block">{CURL_TOOL_CALL}</pre>
              </div>
            </div>

            {/* Model Switching */}
            <div className="docs-block" id="model-switching">
              <h3>Model Switching</h3>
              <p>
                Switch between models by changing the <code>model</code> string.
                Same SDK, same code — just a different model name.
              </p>
              <div className="code-block-wrap">
                <CopyButton text={PYTHON_MULTIMODEL} />
                <pre className="code-block">{PYTHON_MULTIMODEL}</pre>
              </div>
            </div>

            {/* Endpoints */}
            <div className="docs-block" id="endpoints">
              <h3>Endpoints</h3>
              <p>Available routes — fully OpenAI-compatible:</p>
              <div className="endpoint-row">
                <span className="method post">POST</span>
                <span>/v1/chat/completions</span>
              </div>
              <div className="endpoint-row">
                <span className="method post">POST</span>
                <span>/v1/images/generations</span>
              </div>
              <div className="endpoint-row">
                <span className="method post">POST</span>
                <span>/v1/responses</span>
              </div>
              <div className="endpoint-row">
                <span className="method get">GET</span>
                <span>/v1/models</span>
              </div>
            </div>

            {/* Parameters */}
            <div className="docs-block" id="parameters">
              <h3>Request Parameters</h3>
              <p>
                Standard OpenAI parameters you can pass in the request body:
              </p>
              <div className="params-table">
                <div className="param-row header">
                  <span>Parameter</span>
                  <span>Type</span>
                  <span>Description</span>
                </div>
                <div className="param-row">
                  <span><code>model</code></span>
                  <span>string</span>
                  <span>Model ID (required). See available models above.</span>
                </div>
                <div className="param-row">
                  <span><code>messages</code></span>
                  <span>array</span>
                  <span>Conversation messages (required).</span>
                </div>
                <div className="param-row">
                  <span><code>stream</code></span>
                  <span>boolean</span>
                  <span>Enable streaming responses. Default: false.</span>
                </div>
                <div className="param-row">
                  <span><code>max_tokens</code></span>
                  <span>integer</span>
                  <span>Maximum tokens to generate.</span>
                </div>
                <div className="param-row">
                  <span><code>temperature</code></span>
                  <span>float</span>
                  <span>Sampling temperature (0-2). Default: 1.</span>
                </div>
                <div className="param-row">
                  <span><code>top_p</code></span>
                  <span>float</span>
                  <span>Nucleus sampling (0-1). Default: 1.</span>
                </div>
                <div className="param-row">
                  <span><code>tools</code></span>
                  <span>array</span>
                  <span>Function tools for tool calling.</span>
                </div>
              </div>
            </div>

            {/* Response Format */}
            <div className="docs-block" id="response-format">
              <h3>Response Format</h3>
              <p>
                Responses follow the OpenAI chat completion format:
              </p>
              <div className="code-block-wrap">
                <CopyButton text={`{
  "id": "gen-xxx",
  "object": "chat.completion",
  "model": "deepseek-v4-flash",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "Hello! How can I help you?"
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 20,
    "completion_tokens": 8,
    "total_tokens": 28
  }
}`} />
                <pre className="code-block">{`{
  "id": "gen-xxx",
  "object": "chat.completion",
  "model": "deepseek-v4-flash",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "Hello! How can I help you?"
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 20,
    "completion_tokens": 8,
    "total_tokens": 28
  }
}`}</pre>
              </div>
            </div>

            {/* Errors */}
            <div className="docs-block" id="errors">
              <h3>Error Handling</h3>
              <p>
                Errors return standard HTTP status codes with an OpenAI-compatible
                error body:
              </p>
              <div className="endpoint-row">
                <span className="method get" style={{ background: "rgba(193,39,45,0.14)", color: "#c1272d" }}>401</span>
                <span>Invalid or missing API key</span>
              </div>
              <div className="endpoint-row">
                <span className="method get" style={{ background: "rgba(193,39,45,0.14)", color: "#c1272d" }}>402</span>
                <span>Insufficient balance — top up via Telegram bot</span>
              </div>
              <div className="endpoint-row">
                <span className="method get" style={{ background: "rgba(232,168,56,0.18)", color: "#b3811e" }}>429</span>
                <span>Rate limit exceeded — wait and retry</span>
              </div>
              <div className="endpoint-row">
                <span className="method get" style={{ background: "rgba(193,39,45,0.14)", color: "#c1272d" }}>503</span>
                <span>Model or provider temporarily unavailable</span>
              </div>
              <div className="code-block-wrap">
                <CopyButton text={`{
  "error": {
    "message": "Rate limit 200/min exceeded",
    "type": "rpm_exceeded",
    "code": "rpm_exceeded"
  }
}`} />
                <pre className="code-block">{`{
  "error": {
    "message": "Rate limit 200/min exceeded",
    "type": "rpm_exceeded",
    "code": "rpm_exceeded"
  }
}`}</pre>
              </div>
            </div>

            {/* Rate Limits */}
            <div className="docs-block" id="rate-limits">
              <h3>Rate Limits</h3>
              <p>
                Default: <strong>200 requests per minute</strong> per API key.
                Check the response headers for your current limits:
              </p>
              <div className="code-block-wrap">
                <CopyButton text="X-RateLimit-Limit: 200\nX-RateLimit-Remaining: 195\nX-RateLimit-Reset: 1723000000" />
                <div className="code-block">
                  <span className="code-header">X-RateLimit-Limit:</span>{" "}
                  <span className="code-value">200</span>
                  <br />
                  <span className="code-header">X-RateLimit-Remaining:</span>{" "}
                  <span className="code-value">195</span>
                  <br />
                  <span className="code-header">X-RateLimit-Reset:</span>{" "}
                  <span className="code-value">1723000000</span>
                </div>
              </div>
            </div>

            {/* Billing */}
            <div className="docs-block" id="billing">
              <h3>Billing</h3>
              <p>
                Usage is metered per token. Each model has different input and
                output pricing. Check your balance anytime via the Telegram bot{" "}
                <code>/cek</code>.
              </p>
              <p>
                Response headers include billing info:
              </p>
              <div className="code-block-wrap">
                <CopyButton text="X-OpenGate-Model: deepseek-v4-flash\nX-OpenGate-Cost-MicroCents: 5628" />
                <div className="code-block">
                  <span className="code-header">X-OpenGate-Model:</span>{" "}
                  <span className="code-value">deepseek-v4-flash</span>
                  <br />
                  <span className="code-header">X-OpenGate-Cost-MicroCents:</span>{" "}
                  <span className="code-value">5628</span>
                </div>
              </div>
              <p>
                1 USD = 1,000,000 micro-cents. Top up via Telegram bot →{" "}
                <code>/topup</code>.
              </p>
            </div>

            {/* Python SDK */}
            <div className="docs-block" id="sdk-python">
              <h3>Python</h3>
              <p>Use the official OpenAI SDK with a custom base URL:</p>
              <div className="code-block-wrap">
                <CopyButton text={PYTHON_SNIPPET} />
                <pre className="code-block">{PYTHON_SNIPPET}</pre>
              </div>
              <p>With streaming:</p>
              <div className="code-block-wrap">
                <CopyButton text={PYTHON_STREAM} />
                <pre className="code-block">{PYTHON_STREAM}</pre>
              </div>
            </div>

            {/* Node.js SDK */}
            <div className="docs-block" id="sdk-node">
              <h3>Node.js</h3>
              <p>Same drop-in approach with the JavaScript SDK:</p>
              <div className="code-block-wrap">
                <CopyButton text={NODE_SNIPPET} />
                <pre className="code-block">{NODE_SNIPPET}</pre>
              </div>
              <p>With streaming:</p>
              <div className="code-block-wrap">
                <CopyButton text={NODE_STREAM} />
                <pre className="code-block">{NODE_STREAM}</pre>
              </div>
            </div>

            {/* cURL */}
            <div className="docs-block" id="sdk-curl">
              <h3>cURL</h3>
              <p>Send requests directly from your terminal:</p>
              <div className="code-block-wrap">
                <CopyButton text={CURL_BASIC} />
                <pre className="code-block">{CURL_BASIC}</pre>
              </div>
              <p>List available models:</p>
              <div className="code-block-wrap">
                <CopyButton text={CURL_LIST_MODELS} />
                <pre className="code-block">{CURL_LIST_MODELS}</pre>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
