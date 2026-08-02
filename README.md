# OpenGate

> Private AI Gateway Studio — sell, control, and route AI access from one branded gateway.

OpenGate is an OpenAI-compatible gateway for resellers, buyers, and builders. It provides managed API keys, usage visibility, quota controls, and drop-in compatibility with the OpenAI SDK across 12+ leading models.

This repository contains the **public landing site** built with Next.js 15, React 19, and custom CSS.

---

## Stack

- **Framework** — [Next.js 15](https://nextjs.org/) (App Router) + [React 19](https://react.dev/)
- **Styling** — Custom CSS with design tokens (no Tailwind / no UI library)
- **Fonts** — [Inter](https://rsms.me/inter/) + [JetBrains Mono](https://www.jetbrains.com/lp/mono/) via `next/font/google`
- **Animation** — Native Canvas API for particle network, IntersectionObserver for counters, pure CSS for transitions

## Pages

| Route | Description |
|---|---|
| `/` | Hero with animated typing terminal, integration logos, animated metrics, ops feature strip |
| `/docs` | Quickstart with copy-to-clipboard code blocks (cURL / Python / Node.js) |
| `/models` | 12 models with filter chips (tier, provider) and toggle between **Card** and **Table** view |
| `/pricing` | 3-tier pricing + interactive calculator (slider tokens × model price = monthly estimate) |

## Features

### Visual
- **Sunset / Crimson + Mustard** editorial palette — warm beige background, ink text, crimson accent for headings, mustard gradient for CTAs
- **Animated brand mark** — 8s conic gradient spin
- **Mouse-reactive particles** — repel/attract on cursor proximity, brighter connection lines near pointer
- **3D tilt cards** — perspective rotation on feature & code cards (disabled on pricing/models for readability)
- **Cursor glow** — soft radial blur trailing the cursor (desktop only)

### UX
- **Animated typing terminal** at hero — loops `POST → sending → streaming response`
- **Copy-to-clipboard** on every code block with checkmark feedback
- **Interactive pricing calculator** — model dropdown, dual sliders (input/output tokens), real-time breakdown
- **Filter + sort** on models page (by tier, provider; sort by input price or speed)
- **Card / Table view toggle** for fast model evaluation
- **Counter animations** triggered by viewport intersection (one-shot)
- **Mobile-first** with two breakpoints (900px tablet, 540px phone), touch-friendly (44px slider thumbs, hover-disabled on touch devices)

### Trust signals
- Live latency widget in metrics strip (2.3M req/day · 99.9% uptime · 247ms latency)
- Drop-in integration logos (Cursor, Continue, Cline, Roo Code, OpenCode, LangChain, LlamaIndex)
- Status link with pulsing online indicator in footer

## Project structure

```
opengate/
├── app/
│   ├── components/
│   │   ├── AnimatedTerminal.jsx    Typing terminal with streaming response
│   │   ├── CopyButton.jsx          Clipboard copy with toast feedback
│   │   ├── CountUp.jsx             IntersectionObserver-driven number counter
│   │   ├── CursorGlow.jsx          Trailing radial-blur cursor effect
│   │   ├── Footer.jsx              Brand + 3-col links + status
│   │   ├── HoverCard.jsx           3D perspective tilt wrapper
│   │   ├── IntegrationLogos.jsx    Grayscale → color logo strip
│   │   ├── MetricsStrip.jsx        Animated counter metrics
│   │   ├── ModelsView.jsx          Card / Table toggle, filters, sort
│   │   ├── Nav.jsx                 Sticky glass nav with mobile drawer
│   │   ├── ParticleCanvas.jsx      Mouse-reactive canvas particles
│   │   └── PricingCalculator.jsx   Interactive cost estimator
│   ├── docs/page.jsx
│   ├── models/page.jsx
│   ├── pricing/page.jsx
│   ├── globals.css                 All styles + tokens + responsive rules
│   ├── layout.jsx                  Root + fonts + viewport
│   └── page.jsx                    Homepage
├── public/
│   ├── logo.svg
│   └── telegram.svg
├── next.config.js
├── jsconfig.json
└── package.json
```

## Getting started

```bash
# install dependencies
npm install

# run dev server (port 3000 or auto-fallback to 3002)
npm run dev

# build for production
npm run build

# run production build
npm start
```

Open http://localhost:3000.

## Customisation

### Brand colors
All colors live in `app/globals.css` under `:root`. Swap the palette by editing the CSS custom properties:

```css
--accent: #c1272d;        /* crimson — heading accent */
--primary: #d4901e;       /* mustard — primary CTA */
--gradient-cta: linear-gradient(135deg, #d4901e 0%, #e8a838 60%, #efbb5e 100%);
--success: #5a8a3a;       /* status indicators */
```

### Models
Edit `app/components/ModelsView.jsx` and `app/components/PricingCalculator.jsx` (`calcModels` array). Both files share the same shape — keep them in sync.

### Brand
Replace `public/logo.svg` and update strings in `app/components/Nav.jsx`, `app/components/Footer.jsx`, and `app/layout.jsx` metadata.

## License

Proprietary — OpenGate © 2026.
