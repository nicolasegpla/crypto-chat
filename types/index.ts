// types/index.ts

// Interfaz normalizada para usar en nuestra UI (Cards y Tablas)
export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  last_updated: string;
}

// Tipado básico para la respuesta de búsqueda de Coingecko
export interface CoingeckoSearchResult {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
}