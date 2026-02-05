'use server';

import { createAI, getMutableAIState, streamUI } from 'ai/rsc';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import { ReactNode } from 'react';
import { getTop10Cryptos, getCryptoByQuery } from '@/lib/coingecko';
import { CryptoCard, Top10Table, CryptoSkeleton } from '@/app/components/crypto/crypto-ui';

// --- CONFIGURACIÓN DEL PROVEEDOR ---
// Priorizamos la Key directa si existe para evitar errores del Gateway
const useDirectOpenAI = !!process.env.OPENAI_API_KEY;

const openaiProvider = createOpenAI({
  apiKey: useDirectOpenAI 
    ? process.env.OPENAI_API_KEY 
    : process.env.VERCEL_AI_GATEWAY_KEY,
  baseURL: useDirectOpenAI 
    ? undefined 
    : process.env.VERCEL_AI_GATEWAY_URL,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const model = openaiProvider('google/gemini-3-flash') as any;

// --- TIPOS ---
export interface ServerMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClientMessage {
  id: string;
  role: 'user' | 'assistant';
  display: ReactNode;
}

// --- SYSTEM PROMPT ACTUALIZADO (Nuevos nombres de tools) ---
const SYSTEM_PROMPT = `
Eres un asistente experto en Criptomonedas.
Tu objetivo es dar información veraz usando SIEMPRE las herramientas disponibles.

REGLAS DE ORO:
1. NO inventes precios. Usa SIEMPRE las tools para datos financieros.
2. Si piden "Top 10" o ranking, usa la herramienta "listTopCryptos". (IMPORTANTE: Pasa siempre currency="usd").
3. Si piden detalles de una moneda específica, usa la herramienta "showCryptoDetail".
`;

export async function continueConversation(input: string): Promise<ClientMessage> {
  const history = getMutableAIState();

  try {
    const result = await streamUI({
      model: model,
      system: SYSTEM_PROMPT,
      messages: [...history.get(), { role: 'user', content: input }],
      text: ({ content, done }) => {
        if (!content) return null; // Evita el error "undefinedundefined"
        
        if (done) {
          history.done((messages: ServerMessage[]) => [
            ...messages,
            { role: 'assistant', content },
          ]);
        }
        return <div className="p-2 text-gray-800 dark:text-gray-200">{content}</div>;
      },
      tools: {
        // --- RENOMBRAMIENTO ESTRATÉGICO PARA ROMPER LA CACHÉ ---
        
        // Tool 1: Antes 'getTop10Cryptos' -> Ahora 'listTopCryptos'
        // ... dentro de tools: { ...
        listTopCryptos: {
          description: 'Obtener el ranking de las 10 mejores criptomonedas.',
          parameters: z.object({
            // El parámetro debe ser obligatorio para que el esquema no sea "None"
            currency: z.string().describe('La moneda base, por ejemplo "usd"'),
          }) as any,
          generate: async function* ({ currency }) {
            yield <CryptoSkeleton />; 
            try {
              const data = await getTop10Cryptos();
              if (!data || data.length === 0) return <div className="text-red-500">Error de API.</div>;
              return <Top10Table data={data} />;
            } catch (e) {
              return <div className="text-red-500">Error obteniendo top 10.</div>;
            }
          },
        },
        // ...
        
        // Tool 2: Antes 'getCryptoByQuery' -> Ahora 'showCryptoDetail'
        showCryptoDetail: {
          description: 'Buscar precio y detalles de una moneda específica.',
          parameters: z.object({
            query: z.string().describe('Nombre o símbolo (ej: bitcoin)'),
          }) as any,
          generate: async function* ({ query }) {
            yield <CryptoSkeleton />;
            try {
              const data = await getCryptoByQuery(query);
              if (!data) return <div className="bg-orange-100 p-2 rounded text-orange-800">No encontré {query}</div>;
              return <CryptoCard data={data} />;
            } catch (e) {
              return <div className="text-red-500">Error buscando moneda.</div>;
            }
          },
        },
      },
    });

    return {
      id: Date.now().toString(),
      role: 'assistant',
      display: result.value,
    };

  } catch (error) {
    console.error("Error crítico en streamUI:", error);
    return {
      id: Date.now().toString(),
      role: 'assistant',
      display: <div className="text-red-500 p-4 border border-red-200 bg-red-50 rounded">
        Ocurrió un error de conexión con la IA. Por favor intenta de nuevo.
      </div>,
    };
  }
}

export const AI = createAI<ServerMessage[], ClientMessage[]>({
  actions: { continueConversation },
  initialAIState: [],
  initialUIState: [],
});