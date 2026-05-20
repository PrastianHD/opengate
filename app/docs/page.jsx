import CopyButton from "../components/CopyButton";

export const metadata = {
  title: "Docs | OpenGates",
  description: "API documentation for OpenGates gateway",
};

const PYTHON_SNIPPET = `from openai import OpenAI

client = OpenAI(
    base_url="https://api.opengates.cloud/v1",
    api_key="ogt-xxx"
)

response = client.chat.completions.create(
    model="claude-opus-4.7",
    messages=[{"role": "user", "content": "Hello"}]
)`;

const NODE_SNIPPET = `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.opengates.cloud/v1",
  apiKey: "ogt-xxx"
});

const res = await client.chat.completions.create({
  model: "gpt-5.5",
  messages: [{ role: "user", content: "Hi" }]
});`;

const CURL_SNIPPET = `curl https://api.opengates.cloud/v1/chat/completions \\
  -H "Authorization: Bearer ogt-xxx" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"claude-opus-4.7","messages":[{"role":"user","content":"Hi"}]}'`;

export default function DocsPage() {
  return (
    <>
      <div className="section-heading">
        <p className="eyebrow">◆ Documentation</p>
        <h2>Get started in minutes</h2>
        <p>
          OpenAI-compatible REST API. Drop your existing client in by changing
          the base URL.
        </p>
      </div>

      <section className="docs-section">
        <div className="docs-grid">
          <aside className="docs-sidebar">
            <h4>Getting Started</h4>
            <a href="#auth">Authentication</a>
            <a href="#base-url">Base URL</a>
            <h4>Endpoints</h4>
            <a href="#chat">Chat Completions</a>
            <a href="#images">Image Generation</a>
            <a href="#models-list">List Models</a>
            <h4>SDKs</h4>
            <a href="#python">Python</a>
            <a href="#node">Node.js</a>
            <a href="#curl">cURL</a>
          </aside>

          <div className="docs-content">
            <div className="docs-block" id="auth">
              <h3>Authentication</h3>
              <p>
                All requests must include a Bearer token in the Authorization
                header. Get your API key from the Telegram bot.
              </p>
              <div className="code-block-wrap">
                <CopyButton text="Bearer ogt-xxxxxxxxxxxxxxxx" />
                <div className="code-block">
                  <span className="code-header">Authorization:</span>{" "}
                  <span className="code-value">Bearer ogt-xxxxxxxxxxxxxxxx</span>
                </div>
              </div>
            </div>

            <div className="docs-block" id="base-url">
              <h3>Base URL</h3>
              <p>Set this as the base URL in any OpenAI-compatible client:</p>
              <div className="code-block-wrap">
                <CopyButton text="https://api.opengates.cloud/v1" />
                <div className="code-block">
                  <span className="code-url">https://api.opengates.cloud/v1</span>
                </div>
              </div>
            </div>

            <div className="docs-block" id="chat">
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

            <div className="docs-block" id="curl">
              <h3>cURL Example</h3>
              <p>Send a chat completion request from your terminal:</p>
              <div className="code-block-wrap">
                <CopyButton text={CURL_SNIPPET} />
                <pre className="code-block">{CURL_SNIPPET}</pre>
              </div>
            </div>

            <div className="docs-block" id="python">
              <h3>Python</h3>
              <p>Use the official OpenAI SDK with a custom base URL:</p>
              <div className="code-block-wrap">
                <CopyButton text={PYTHON_SNIPPET} />
                <pre className="code-block">{PYTHON_SNIPPET}</pre>
              </div>
            </div>

            <div className="docs-block" id="node">
              <h3>Node.js</h3>
              <p>Same drop-in approach with the JavaScript SDK:</p>
              <div className="code-block-wrap">
                <CopyButton text={NODE_SNIPPET} />
                <pre className="code-block">{NODE_SNIPPET}</pre>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
