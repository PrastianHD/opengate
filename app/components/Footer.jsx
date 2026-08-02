import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="warm-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-brand-row">
            <span className="footer-mark">
              <Image src="/logo.svg" alt="" width={32} height={32} />
            </span>
            <strong>OpenGate</strong>
          </div>
          <p className="footer-tagline">
            Private AI gateway for resellers, buyers, and builders.
          </p>
          <p className="footer-meta">
            Built around{" "}
            <code>https://api.opengate.host/v1</code>
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
                <span className="status-dot" aria-hidden="true" />
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
              href="https://t.me/opengate_bot"
              target="_blank"
              rel="noreferrer"
            >
              Telegram
            </a>
          </div>
          <div className="footer-col">
            <h5>Legal</h5>
            <span className="text-zinc-500 text-sm">Coming soon</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 OpenGate · API Gateway</span>
        <span>Made with ❤︎ for AI builders</span>
      </div>
    </footer>
  );
}
