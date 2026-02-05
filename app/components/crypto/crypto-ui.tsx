'use client';

import { CryptoData } from '@/types';

// Componente para mostrar una sola criptomoneda (Tool: getCryptoByQuery)
export const CryptoCard = ({ data }: { data: CryptoData }) => {
  const isPositive = data.price_change_percentage_24h >= 0;

  return (
    <div className="p-4 border rounded-xl shadow-sm bg-white dark:bg-zinc-900 w-full max-w-sm my-2 animate-in fade-in slide-in-from-bottom-3">
      <div className="flex items-center gap-4 mb-4">
        {/* Manejo seguro de imagen con fallback */}
        {data.image ? (
          <img src={data.image} alt={data.name} className="w-12 h-12 rounded-full" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl">💰</div>
        )}
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{data.name}</h3>
          <span className="text-sm text-gray-500 uppercase">{data.symbol}</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <span className="text-sm text-gray-500">Precio Actual</span>
          <span className="text-xl font-mono font-semibold text-gray-900 dark:text-gray-100">
            ${data.current_price.toLocaleString('en-US')}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">24h Cambio</span>
          <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '▲' : '▼'} {data.price_change_percentage_24h.toFixed(2)}%
          </span>
        </div>
        
        <div className="pt-2 mt-2 border-t border-gray-100 dark:border-zinc-800 text-xs text-gray-400 text-right">
           Fuente: Coingecko • Cap: ${(data.market_cap / 1e9).toFixed(2)}B
        </div>
      </div>
    </div>
  );
};

// Componente para mostrar la tabla del Top 10 (Tool: getTop10Cryptos)
export const Top10Table = ({ data }: { data: CryptoData[] }) => {
  return (
    <div className="overflow-x-auto border rounded-xl shadow-sm bg-white dark:bg-zinc-900 my-2 animate-in fade-in slide-in-from-bottom-3">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 dark:bg-zinc-800 uppercase text-xs font-semibold text-gray-600 dark:text-gray-300">
          <tr>
            <th className="px-4 py-3">#</th>
            <th className="px-4 py-3">Moneda</th>
            <th className="px-4 py-3 text-right">Precio</th>
            <th className="px-4 py-3 text-right">24h %</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
          {data.map((coin) => (
            <tr key={coin.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
              <td className="px-4 py-3 font-mono text-gray-500">{coin.market_cap_rank}</td>
              <td className="px-4 py-3 flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100">
                <img src={coin.image} alt={coin.symbol} className="w-5 h-5 rounded-full" />
                {coin.name} 
                <span className="text-gray-400 uppercase text-xs hidden sm:inline">{coin.symbol}</span>
              </td>
              <td className="px-4 py-3 text-right font-mono text-gray-700 dark:text-gray-300">
                ${coin.current_price.toLocaleString('en-US')}
              </td>
              <td className={`px-4 py-3 text-right font-medium ${coin.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {coin.price_change_percentage_24h.toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Skeleton Loader para cuando la IA está "pensando/buscando"
export const CryptoSkeleton = () => (
  <div className="animate-pulse flex space-x-4 p-4 border rounded-xl bg-gray-50 dark:bg-zinc-900/50 w-64 my-2">
    <div className="rounded-full bg-gray-200 dark:bg-zinc-800 h-10 w-10"></div>
    <div className="flex-1 space-y-2 py-1">
      <div className="h-2 bg-gray-200 dark:bg-zinc-800 rounded w-3/4"></div>
      <div className="h-2 bg-gray-200 dark:bg-zinc-800 rounded w-1/2"></div>
    </div>
  </div>
);