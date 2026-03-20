# Crypto Chat AI

A **Generative UI Chatbot** built with Next.js 16, Vercel AI SDK, and Google Gemini 3 Flash. Provides real-time cryptocurrency data by integrating with the CoinGecko API and streaming interactive React components directly in the chat.

**Live Demo:** https://cryptochat-seven.vercel.app/

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| AI SDK | Vercel AI SDK v4 (`ai/rsc`) |
| LLM | Google Gemini 3 Flash (via Vercel AI Gateway) |
| Data | CoinGecko Public API |
| Validation | Zod v3 |
| Styling | Tailwind CSS v4 |
| Package Manager | pnpm |

---

## Features

- **Generative UI Streaming** — streams React components (not just text) directly in the chat
- **Real-time crypto data** — prices, market cap, 24h change sourced live from CoinGecko
- **Hallucination prevention** — the LLM is strictly prohibited from generating price values; all financial data comes directly from the API
- **Skeleton loading** — visual feedback while API calls are in progress
- **Optimistic UI** — user messages appear instantly before the server responds
- **Quick action buttons** — preset suggestions for Top 10, Bitcoin, Ethereum, Pepe
- **Auto-scroll** — chat scrolls to the latest message automatically

---

## Project Structure

```
my-app-cryto/
├── app/
│   ├── actions.tsx              # Server Actions + AI SDK (tools, streamUI)
│   ├── page.tsx                 # Main chat page (ChatInterface component)
│   ├── layout.tsx               # Root layout with AI provider wrapper
│   ├── globals.css              # Tailwind imports + gradient background
│   └── components/
│       ├── chat/Chat.tsx        # Message list + quick action buttons
│       ├── crypto/crypto-ui.tsx # CryptoCard, Top10Table, CryptoSkeleton
│       ├── form/Form.tsx        # Input field + submit button
│       └── ui/Header.tsx        # Top navigation bar
├── lib/
│   ├── coingecko.ts             # CoinGecko API integration + normalization
│   └── utils.ts                 # Utility helpers
├── types/
│   └── index.ts                 # CryptoData, CoingeckoSearchResult interfaces
├── next.config.js               # Webpack alias workaround for Zod + AI SDK
├── tsconfig.json
├── postcss.config.mjs
├── eslint.config.mjs
└── pnpm-workspace.yaml
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
git clone https://github.com/nicolasegpla/crypto-chat.git
cd crypto-chat
pnpm install
```

### Environment Variables

Create a `.env.local` file at the project root:

```env
# Vercel AI Gateway
API_KEY_VERCEL=your_vercel_ai_gateway_key
AI_GATEWAY_URL=https://ai-gateway.vercel.sh/v1

# Optional: direct OpenAI API key (overrides the gateway)
OPENAI_API_KEY=
```

### Run Development Server

```bash
pnpm run dev
```

> **Note:** The dev script forces `--webpack` to avoid a known dependency conflict between Zod v3.24 and the AI SDK's schema generator under Turbopack (see [Architecture](#architecture--technical-decisions)).

### Build for Production

```bash
pnpm run build
pnpm start
```

---

## Architecture & Technical Decisions

### Data Flow

```
User input
  → Form.tsx (client)
  → continueConversation() (Server Action)
  → LLM decides tool to call
  → Tool fetches from CoinGecko API
  → Data normalized to CryptoData
  → React component (CryptoCard / Top10Table) streamed to client
  → Rendered in Chat.tsx
```

### AI Tools

| Tool | Description |
|------|-------------|
| `listTopCryptos` | Fetches top 10 cryptocurrencies by market cap |
| `showCryptoDetail` | Searches for and returns details on a specific coin |

Both tools return React components via `streamUI`, not plain text.

### Hallucination Prevention

A critical concern in financial applications. The solution:

1. **Zero-generation policy** — the system prompt explicitly prohibits the LLM from writing prices or market data.
2. **Tool-only rendering** — the LLM's only job is to decide which tool to call.
3. **Deterministic output** — prices rendered in the UI come directly from CoinGecko's JSON response, injected into React components. The LLM never reads or rewrites the numbers.

### CoinGecko API Integration

**Base URL:** `https://api.coingecko.com/api/v3`

| Endpoint | Use |
|----------|-----|
| `/coins/markets` | Top 10 by market cap (`vs_currency=usd`, `order=market_cap_desc`, `per_page=10`) |
| `/search?query={name}` | Find a coin's ID by name or symbol |
| `/coins/{id}` | Detailed market data for a specific coin |

**Caching:** Market data is cached for 60 seconds; search mappings for 3600 seconds (Next.js `fetch` cache).

**Normalization:** Raw API responses are trimmed to only `current_price`, `market_cap`, `price_change_24h`, and `image` before being passed to the AI context, reducing token consumption and improving latency.

### Webpack Workaround

Next.js 16 defaults to Turbopack, but Turbopack has a dependency resolution conflict between `zod` v3.24 and the AI SDK's schema generator (`zod/v3` import path).

**Fix applied in `next.config.js`:**
```js
webpack: (config) => {
  config.resolve.alias['zod/v3'] = require.resolve('zod');
  return config;
}
```

Both `dev` and `build` scripts explicitly pass `--webpack`.

### Model: Google Gemini 3 Flash

Chosen over GPT-3.5/4 for:
- Lower cost per token
- Higher inference speed (important for streaming UI)
- Larger context window

Accessed via **Vercel AI Gateway**, which provides a unified OpenAI-compatible endpoint.

### Hydration Warning Suppression

`suppressHydrationWarning={true}` is set on the root `<html>` element to prevent hydration mismatches caused by browser extensions (password managers, ad blockers) injecting extra HTML attributes.

---

## Component Reference

### `app/actions.tsx`
Server-side AI orchestration. Defines the `continueConversation` Server Action and the `AI` provider used by `useUIState` / `useActions` hooks.

### `app/page.tsx` — `ChatInterface`
Main chat page. Manages message state, optimistic updates, loading state, and auto-scroll.

### `app/components/chat/Chat.tsx`
Renders the message history. Shows an empty state with quick-action suggestion buttons. Displays a loading indicator while the server is responding.

### `app/components/crypto/crypto-ui.tsx`
- **`CryptoCard`** — single coin detail: price, 24h change badge, market cap, rank
- **`Top10Table`** — ranked table of top 10 coins with price and 24h %
- **`CryptoSkeleton`** — pulsing placeholder shown during API calls

### `app/components/form/Form.tsx`
Text input and submit button. Disabled during loading. Includes a disclaimer about AI accuracy.

### `app/components/ui/Header.tsx`
Sticky header with animated pulse indicator and gradient title.

### `lib/coingecko.ts`
All CoinGecko API calls. Handles search → ID resolution → market data fetching, normalization, and caching.

---

## AI-Driven Development Methodology

This project was built using **AI-Augmented Engineering**. The developer acted as the principal architect, orchestrating a custom AI agent (Google Gemini Gem configured as a "Next.js 16 Architect") for boilerplate generation and debugging, while retaining human oversight for business logic and deployment decisions.

**Breakdown:**
- **~60% AI-generated:** TypeScript interfaces, Tailwind layouts, Zod schemas, component scaffolding
- **~40% human-engineered:** Component decoupling and ref architecture, hallucination prevention design, dependency conflict resolution, deployment configuration

**Custom Gem configuration used:**
- Role: Senior Business Analyst & Software Architect
- Methodology: Agile with MoSCoW prioritization
- Output format: User Stories with Gherkin acceptance criteria (Given/When/Then)
- Constraint: Strict TypeScript, Server Actions preference, mandatory Zod validation
- Dependency awareness: Solutions validated against `package.json` before suggestion

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start dev server (Webpack) |
| `pnpm run build` | Production build (Webpack) |
| `pnpm start` | Start production server |
| `pnpm run lint` | Run ESLint |

---

## License

MIT
