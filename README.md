# Crypto AI Chatbot 🪙 🤖

A Generative UI Chatbot built with **Next.js 16**, **Vercel AI SDK**, and **Google Gemini 3 Flash**. This assistant provides real-time cryptocurrency data by interacting with the CoinGecko API and rendering interactive React components directly in the chat stream.

## 🚀 Live Demo

https://cryptochat-seven.vercel.app/

---

## 🛠️ How to Run Locally

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm

### 1. Installation
Clone the repository and install dependencies:

```bash
git clone [https://github.com/nicolasegpla/crypto-chat.git](https://github.com/nicolasegpla/crypto-chat.git)
cd crypto-chat
pnpm install
```

## 🛠️ Environment Variables
Create a .env.local file in the root directory. You need to configure the Vercel AI Gateway credentials:


## .env.local
### Vercel AI Gateway Configuration
VERCEL_AI_GATEWAY_KEY=vck_tu_key_aqui
VERCEL_AI_GATEWAY_URL=[https://ai-gateway.vercel.sh/v1](https://ai-gateway.vercel.sh/v1)


## Run Development Server
Start the application in development mode:

```bash
pnpm run dev
```
Note: The dev script is configured to use --webpack to resolve specific dependency conflicts with Zod (see Architecture section).

---

## Architecture & Technical Decisions

### Tech Stack

- Framework: Next.js 16 (App Router) for Server Actions and React Server Components (RSC).
- AI SDK: ai/rsc from Vercel to stream UI components (Generative UI) instead of just text.
- Model: google/gemini-3-flash via Vercel AI Gateway. Chosen for its extremely low latency and cost-effectiveness compared to GPT-4.
- Validation: zod for strictly typed LLM tool calling.

### Key Decisions & "Gotchas"

During development, a dependency conflict was identified between zod (v3.24) and the AI SDK's schema generator when using Turbopack (Next.js 16 default).

- Solution: I explicitly configured the project to use Webpack for both dev and build processes.
- Implementation: Added a custom resolution alias in next.config.js to map zod/v3 imports correctly to the main zod package.

### Model Selection (Gemini 3 Flash)

Initially, the project used GPT-3.5/4. However, due to potential billing constraints on the provided AI Gateway key, I optimized the implementation to use Gemini 3 Flash. This model offers a larger context window and faster inference for real-time data fetching.

### Hydration & Extensions

Implemented suppressHydrationWarning in the root layout to prevent hydration mismatches caused by browser extensions (password managers, ad blockers) injecting attributes into the HTML.

---

# 🦎 CoinGecko Integration

The application consumes the CoinGecko public API to fetch live market data.

## Endpoints Used

### Top 10 Ranking: /coins/markets

- Parameters: vs_currency=usd, order=market_cap_desc, per_page=10.
- Used by the listTopCryptos tool.

### Search & Details:

- First, it searches for the coin ID via /search?query={name}.
- Then, it fetches details via /coins/{id}.
- Used by the showCryptoDetail tool.

## Data Normalization

To avoid passing massive JSON objects to the LLM (which consumes tokens and slows down the chat), I implemented a normalization layer in lib/coingecko.ts.

- Raw API responses are trimmed down to only essential fields: current_price, market_cap, price_change_24h, and image.
- This ensures the AI context stays lightweight and focused.

---

# ⚡ Performance: Avoiding Waterfalls

To ensure a snappy user experience:

### Generative UI Streaming:
The user doesn't wait for the full text response. The UI components (Charts/Tables) are streamed as soon as the tool call is resolved.

### Server Actions:
All data fetching logic resides on the server. The client receives fully rendered HTML components, reducing client-side JavaScript bundles.

### Skeleton Loading:
Custom <CryptoSkeleton /> components are yielded immediately while the external API call is processing, preventing layout shifts and providing instant visual feedback.

---

# Cómo use IA para programar

### 🧬 The Architect Gem: Configuration

To ensure the project met strict business requirements before a single line of code was written, I engineered a custom Gem acting as a **Senior Business Analyst**.

<details>
<summary>Click to view the System Prompt & Configuration</summary>

#### 🤖 Agent Profile
* **Name:** Crypto App Requirements Specialist
* **Role:** Senior Business Analyst & Software Architect.
* **Methodology:** Agile (Scrum/Kanban) with MoSCoW Prioritization.

#### 🧠 Capabilities & Context
* **Documentation RAG:** Connected to official docs via NotebookLM.
* **Dependency Awareness:** Analyzes `package.json` to ensure suggested solutions match installed versions.
* **Output Format:** User Stories with Gherkin Acceptance Criteria (Given/When/Then).

#### 📜 System Instructions (Excerpt)
> **Process:**
> 1. **Understanding:** Ask key questions about Business Goal, Roles, and MVP features.
> 2. **Structuring:** Divide project into Epics and User Stories.
> 3. **Prioritization:** Use MoSCoW method to propose execution order.
> 4. **Technical Output:** For each requirement generate:
>    * Clear Title & Description ("As a [user]...").
>    * Acceptance Criteria in **Gherkin**.
>    * Technical Notes (API/DB/Frontend suggestions).
>
> **Golden Rule:** Always suggest the "Happy Path" first, then edge cases. Prioritize Core over aesthetics.
> **Validation:** Before suggesting a technical solution, verify `package.json` dependencies to avoid version conflicts.

</details>




