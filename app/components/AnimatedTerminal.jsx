"use client";

import { useEffect, useRef, useState } from "react";

const FRAMES = [
  {
    request: [
      { type: "method", text: "POST" },
      { type: "space" },
      { type: "url", text: "https://api.opengate.com/v1/chat/completions" },
      { type: "br" },
      { type: "br" },
      { type: "header", text: "Authorization:" },
      { type: "space" },
      { type: "value", text: "Bearer ogt-xxxxxxxxxxxxxxxx" },
      { type: "br" },
      { type: "header", text: "Content-Type:" },
      { type: "space" },
      { type: "value", text: "application/json" },
      { type: "br" },
      { type: "br" },
      { type: "text", text: "{" },
      { type: "br" },
      { type: "text", text: "  " },
      { type: "key", text: '"model"' },
      { type: "text", text: ": " },
      { type: "string", text: '"claude-opus-4.7"' },
      { type: "text", text: "," },
      { type: "br" },
      { type: "text", text: "  " },
      { type: "key", text: '"messages"' },
      { type: "text", text: ": [" },
      { type: "br" },
      { type: "text", text: "    { " },
      { type: "key", text: '"role"' },
      { type: "text", text: ": " },
      { type: "string", text: '"user"' },
      { type: "text", text: ", " },
      { type: "key", text: '"content"' },
      { type: "text", text: ": " },
      { type: "string", text: '"Hello!"' },
      { type: "text", text: " }" },
      { type: "br" },
      { type: "text", text: "  ]" },
      { type: "br" },
      { type: "text", text: "}" },
    ],
    response: "Hello! How can I help you today?",
  },
  {
    request: [
      { type: "method", text: "POST" },
      { type: "space" },
      { type: "url", text: "https://api.opengate.com/v1/chat/completions" },
      { type: "br" },
      { type: "br" },
      { type: "header", text: "Authorization:" },
      { type: "space" },
      { type: "value", text: "Bearer ogt-xxxxxxxxxxxxxxxx" },
      { type: "br" },
      { type: "br" },
      { type: "text", text: "{" },
      { type: "br" },
      { type: "text", text: "  " },
      { type: "key", text: '"model"' },
      { type: "text", text: ": " },
      { type: "string", text: '"gpt-5.5"' },
      { type: "text", text: "," },
      { type: "br" },
      { type: "text", text: "  " },
      { type: "key", text: '"stream"' },
      { type: "text", text: ": " },
      { type: "string", text: "true" },
      { type: "br" },
      { type: "text", text: "}" },
    ],
    response: "Streaming response, token by token...",
  },
];

function Token({ part }) {
  if (part.type === "br") return "\n";
  if (part.type === "space") return " ";
  const className = `code-${part.type}`;
  if (["method", "url", "header", "value", "key", "string"].includes(part.type)) {
    return <span className={className}>{part.text}</span>;
  }
  return part.text;
}

export default function AnimatedTerminal() {
  const [frameIdx, setFrameIdx] = useState(0);
  const [phase, setPhase] = useState("typing");
  const [typedCount, setTypedCount] = useState(0);
  const [responseText, setResponseText] = useState("");
  const timerRef = useRef(null);

  const frame = FRAMES[frameIdx];

  useEffect(() => {
    clearTimeout(timerRef.current);
    const totalChars = frame.request.reduce(
      (sum, p) => sum + (p.text?.length || (p.type === "br" ? 1 : p.type === "space" ? 1 : 0)),
      0
    );

    if (phase === "typing") {
      if (typedCount < totalChars) {
        const speed = 14 + Math.random() * 14;
        timerRef.current = setTimeout(() => setTypedCount((c) => c + 1), speed);
      } else {
        timerRef.current = setTimeout(() => setPhase("sending"), 350);
      }
    } else if (phase === "sending") {
      timerRef.current = setTimeout(() => setPhase("response"), 600);
    } else if (phase === "response") {
      if (responseText.length < frame.response.length) {
        const speed = 35 + Math.random() * 30;
        timerRef.current = setTimeout(() => {
          setResponseText(frame.response.slice(0, responseText.length + 1));
        }, speed);
      } else {
        timerRef.current = setTimeout(() => setPhase("done"), 1800);
      }
    } else if (phase === "done") {
      timerRef.current = setTimeout(() => {
        setTypedCount(0);
        setResponseText("");
        setPhase("typing");
        setFrameIdx((i) => (i + 1) % FRAMES.length);
      }, 200);
    }

    return () => clearTimeout(timerRef.current);
  }, [phase, typedCount, responseText, frame, frameIdx]);

  let charsLeft = typedCount;
  const visibleParts = [];
  for (const part of frame.request) {
    if (charsLeft <= 0) break;
    const partLen = part.text?.length || (part.type === "br" ? 1 : part.type === "space" ? 1 : 0);
    if (charsLeft >= partLen) {
      visibleParts.push(part);
      charsLeft -= partLen;
    } else {
      visibleParts.push({ ...part, text: part.text?.slice(0, charsLeft) });
      charsLeft = 0;
    }
  }

  return (
    <div className="terminal-showcase">
      <div className="terminal-header">
        <div className="terminal-dots" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <p>Gateway Request</p>
        <div className="terminal-live">
          <span></span>
          {phase === "sending" ? "Sending" : phase === "response" ? "Streaming" : "Live"}
        </div>
      </div>
      <div className="terminal-body">
        <pre>
          <code>
            {visibleParts.map((p, i) => (
              <Token key={i} part={p} />
            ))}
            {phase === "typing" && <span className="terminal-cursor">▌</span>}
          </code>
        </pre>

        {(phase === "sending" || phase === "response" || phase === "done") && (
          <div className="terminal-response">
            <div className="terminal-response-head">
              <span className="response-status">200 OK</span>
              <span className="response-time">
                {phase === "sending" ? "..." : `${247 + (frameIdx * 31)}ms`}
              </span>
            </div>
            <div className="terminal-response-body">
              {phase === "sending" ? (
                <span className="response-loading">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              ) : (
                <>
                  <span className="code-string">"{responseText}</span>
                  {phase === "response" && <span className="terminal-cursor">▌</span>}
                  {(phase === "response" || phase === "done") &&
                    responseText.length === frame.response.length && (
                      <span className="code-string">"</span>
                    )}
                </>
              )}
            </div>
          </div>
        )}

        <div className="terminal-chips">
          <span>✓ OpenAI Compatible</span>
          <span>✓ Drop-in Ready</span>
          <span>✓ {`<300ms`} latency</span>
        </div>
      </div>
    </div>
  );
}
