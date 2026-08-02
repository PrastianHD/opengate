import "./globals.css";
import { Inter, JetBrains_Mono } from "next/font/google";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import ParticleCanvas from "./components/ParticleCanvas";
import CursorGlow from "./components/CursorGlow";
import AppProviders from "./components/AppProviders";
import { JsonLd } from "./components/JsonLd";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://opengate.host"),
  title: {
    default: "OpenGate — AI API Gateway for Resellers",
    template: "%s | OpenGate",
  },
  description:
    "OpenGate is an OpenAI-compatible AI API gateway for resellers, buyers, and builders. Sell and route AI access with managed API keys, usage dashboards, quota controls, and per-key limits.",
  keywords: [
    "AI API gateway",
    "OpenAI-compatible API",
    "AI API reseller",
    "LLM API routing",
    "managed API keys",
    "AI usage dashboard",
  ],
  applicationName: "OpenGate",
  category: "technology",
  openGraph: {
    siteName: "OpenGate",
    title: "OpenGate — AI API Gateway for Resellers",
    description:
      "Sell, control, and route AI access from one branded, OpenAI-compatible gateway.",
    url: "/",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "OpenGate — AI API Gateway for Resellers",
    description:
      "Sell, control, and route AI access from one branded, OpenAI-compatible gateway.",
  },
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#f5f1e8",
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "OpenGate",
            url: "https://opengate.host",
            logo: "https://opengate.host/logo.svg",
            description:
              "OpenAI-compatible AI API gateway for resellers, buyers, and builders.",
            sameAs: ["https://t.me/opengate_bot"],
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "sales",
              url: "https://t.me/opengate_bot",
              availableLanguage: "English",
            },
          }}
        />
        <AppProviders>
          <div className="site-shell landing-v2">
            <ParticleCanvas />
            <CursorGlow />
            <Nav />
            <main id="main-content">{children}</main>
            <Footer />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
