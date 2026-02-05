import { ReactNode } from "react";

interface Message {
    id: string;
    role: 'user' | 'assistant';
    display: ReactNode;
}


interface ChatProps {
    handleSubmit: (argo: undefined, valueOverride?: string) => void;
    isLoading: boolean;
    messages: Message[];
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
}   

export const Chat = ({ handleSubmit, isLoading, messages, messagesEndRef }: ChatProps) => {
    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-70 mt-10">
            <div className="text-6xl">🪙</div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">¿Qué quieres saber hoy?</h2>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                Puedo darte el Top 10 del mercado o precios específicos en tiempo real.
              </p>
            </div>
            
            {/* Sugerencias Rápidas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
              <button 
                onClick={() => handleSubmit(undefined, "Muéstrame el Top 10 criptomonedas")}
                className="p-3 text-sm text-left border rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors flex items-center gap-2 group"
              >
                <span>🏆</span> Top 10 Market Cap
                <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </button>
              <button 
                onClick={() => handleSubmit(undefined, "Precio actual de Bitcoin")}
                className="p-3 text-sm text-left border rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors flex items-center gap-2 group"
              >
                <span>📈</span> Precio de Bitcoin
                <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </button>
              <button 
                onClick={() => handleSubmit(undefined, "Dame info de Ethereum")}
                className="p-3 text-sm text-left border rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors flex items-center gap-2 group"
              >
                <span>💎</span> Info de Ethereum
                <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </button>
            </div>
          </div>
        )}

        {/* Lista de Mensajes */}
        {messages.map((message) => (
          <div key={message.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {message.role === 'assistant' ? (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  AI
                </div>
                <div className="flex-1 overflow-hidden">
                  {/* Aquí se renderiza la respuesta (Texto o Componente React) */}
                  {message.display}
                </div>
              </div>
            ) : (
              // El mensaje de usuario ya se renderizó arriba en el state inicial
              message.display
            )}
          </div>
        ))}
        
        {/* Loading Indicator */}
        {isLoading && (
           <div className="flex items-center gap-2 text-gray-400 text-sm ml-11">
             <span className="animate-pulse">Consultando el oráculo cripto...</span>
           </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

    )
};