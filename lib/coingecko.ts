// lib/coingecko.ts
import { CryptoData, CoingeckoSearchResult } from '@/types';

// Define la forma de la data cruda que llega de la API
interface RawCoingeckoData {
  id: string;
  symbol: string;
  name: string;
  image?: string; // En /markets suele ser un string
  large?: string; // A veces viene como 'large' en otros endpoints
  small?: string; // A veces viene como 'small'
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  last_updated: string;
}

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

// Helper para normalizar la data cruda de Coingecko a nuestra interfaz limpia
const normalizeCryptoData = (data: RawCoingeckoData): CryptoData => {
  return {
    id: data.id,
    symbol: data.symbol.toUpperCase(),
    name: data.name,
    image: data.image || data.large || data.small || "", // Coingecko varía el campo según el endpoint
    current_price: data.current_price,
    market_cap: data.market_cap,
    market_cap_rank: data.market_cap_rank,
    price_change_percentage_24h: data.price_change_percentage_24h,
    last_updated: data.last_updated,
  };
};

/**
 * Tool 1: Obtener el Top 10 por Market Cap
 * Requerimiento: [cite: 14, 53]
 */
export async function getTop10Cryptos(): Promise<CryptoData[] | null> {
  try {
    const response = await fetch(
      `${COINGECKO_API_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false`,
      {
        method: 'GET',
        headers: {
          accept: 'application/json',
          // 'x-cg-demo-api-key': process.env.COINGECKO_API_KEY // Descomentar si tienes API Key
        },
        next: { revalidate: 60 }, // Cache por 60 segundos para performance
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching Top 10: ${response.statusText}`);
    }

    const data = await response.json();
    return data.map(normalizeCryptoData);
  } catch (error) {
    console.error('Failed to fetch top 10 cryptos:', error);
    return null;
  }
}

/**
 * Tool 2: Buscar una cripto específica
 * Requerimiento: [cite: 26, 56]
 * Estrategia: Search API -> Get ID -> Get Market Data
 */
export async function getCryptoByQuery(query: string): Promise<CryptoData | null> {
  try {
    const cleanQuery = query.toLowerCase().trim();

    // Paso 1: Buscar el ID correcto (ej: usuario escribe "btc", necesitamos "bitcoin")
    const searchResponse = await fetch(
      `${COINGECKO_API_URL}/search?query=${cleanQuery}`,
      { next: { revalidate: 3600 } } // Cacheamos la búsqueda (mapeo nombre->id) por 1 hora
    );

    if (!searchResponse.ok) return null;

    const searchData = await searchResponse.json();
    const coins = searchData.coins as CoingeckoSearchResult[];

    if (!coins || coins.length === 0) {
      return null; // No se encontró
    }

    // Tomamos el primer resultado como el más relevante
    // (Podríamos mejorar esto con lógica difusa, pero para el MVP esto cumple)
    const targetCoinId = coins[0].id;

    // Paso 2: Obtener los datos de mercado usando el ID encontrado
    const marketResponse = await fetch(
      `${COINGECKO_API_URL}/coins/markets?vs_currency=usd&ids=${targetCoinId}&order=market_cap_desc&sparkline=false`,
      { next: { revalidate: 60 } }
    );

    if (!marketResponse.ok) return null;

    const marketData = await marketResponse.json();

    if (!marketData || marketData.length === 0) return null;

    return normalizeCryptoData(marketData[0]);

  } catch (error) {
    console.error(`Error searching for ${query}:`, error);
    return null;
  }
}