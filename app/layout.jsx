import "./globals.css";
import { Inter, JetBrains_Mono } from "next/font/google";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import ParticleCanvas from "./components/ParticleCanvas";
import CursorGlow from "./components/CursorGlow";

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
  title: "OpenGates | API Gateway",
  description: "Owner, reseller and buyer API management panel",
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
        <main className="site-shell landing-v2">
          <ParticleCanvas />
          <CursorGlow />
          <Nav />
          {children}
          <Footer />
        </main>
      </body>
    </html>
  );
}
