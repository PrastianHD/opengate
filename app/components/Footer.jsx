import Link from "next/link";

export default function Footer() {
  return (
    <footer className="warm-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-brand-row">
            <span className="footer-mark">
              <img src="/logo.svg" alt="" />
            </span>
            <strong>OpenGates</strong>
          </div>
          <p className="footer-tagline">
            Private AI gateway for resellers, buyers, and builders.
          </p>
          <p className="footer-meta">
            Built around{" "}
            <code>https://api.opengates.cloud/v1</code>
          </p>
        </div>

        <div className="footer-cols">
          <div className="footer-col">
            <h5>Product</h5>
            <Link href="/models">Models</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/docs">Documentation</Link>
          </div>
          <div className="footer-col">
            <h5>Resources</h5>
            <a href="/status">
              <span className="footer-status">
                <span className="status-dot" />
                Status
              </span>
            </a>
            <a
              href="https://github.com/PrastianHD/opengate"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://t.me/opengates_bot"
              target="_blank"
              rel="noreferrer"
            >
              Telegram
            </a>
          </div>
          <div className="footer-col">
            <h5>Legal</h5>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="/acceptable-use">Acceptable Use</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 OpenGates · API Gateway</span>
        <span>Made with ❤︎ for AI builders</span>
      </div>
    </footer>
  );
}
