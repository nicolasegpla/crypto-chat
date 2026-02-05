'use client';

import { useState, useRef, useEffect } from 'react';
import { useUIState, useActions } from 'ai/rsc';
import { AI } from './actions'; // Importamos el Provider que configuramos en el paso anterior

export default function ChatPage() {
  return (
    // Ya no envolvemos con <AI> aquí porque está en el layout
      <ChatInterface />
  );
}

function ChatInterface() {
  // Hooks del Vercel AI SDK
  const [messages, setMessages] = useUIState<typeof AI>();
  // Usamos <any> para saltar el error de inferencia de tipos del SDK
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { continueConversation } = useActions<any>();
  
  // Estado local para el input y carga
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Referencia para auto-scroll al final del chat
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Manejo del envío de mensajes
  const handleSubmit = async (e?: React.FormEvent, valueOverride?: string) => {
    if (e) e.preventDefault();
    
    const message = valueOverride || inputValue;
    if (!message.trim()) return;

    // Limpiamos input y activamos loading
    setInputValue('');
    setIsLoading(true);

    // 1. Optimistic UI: Agregamos inmediatamente el mensaje del usuario a la lista
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: Date.now().toString(),
        role: 'user',
        display: (
          <div className="flex justify-end mb-4">
            <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl rounded-tr-none max-w-[80%] shadow-md">
              {message}
            </div>
          </div>
        ),
      },
    ]);

    try {
      // 2. Llamamos al Server Action (la IA)
      const response = await continueConversation(message);
      
      // 3. Agregamos la respuesta de la IA (que puede ser texto o componentes)
      setMessages((currentMessages) => [
        ...currentMessages,
        response,
      ]);
    } catch (error) {
      console.error(error);
      alert('Error de conexión con el asistente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto bg-white dark:bg-black border-x border-gray-200 dark:border-zinc-800 shadow-xl">
      
      {/* HEADER */}
      <header className="p-4 border-b border-gray-100 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            Crypto Chat AI
          </h1>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Powered by Coingecko & Vercel AI SDK [cite: 2, 6]
        </p>
      </header>

      {/* ÁREA DE CHAT */}
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

      {/* INPUT AREA */}
      <div className="p-4 bg-white dark:bg-black border-t border-gray-100 dark:border-zinc-800">
        <form onSubmit={(e) => handleSubmit(e)} className="flex gap-2 relative">
          <input
            className="flex-1 p-4 pr-12 border border-gray-200 dark:border-zinc-700 rounded-2xl bg-gray-50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Escribe tu pregunta sobre criptos..."
            disabled={isLoading}
            autoFocus
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="absolute right-3 top-3 bottom-3 aspect-square bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-300 transition-all shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </form>
        <div className="text-center mt-2">
            <p className="text-[10px] text-gray-400">La IA puede cometer errores. Verifica los datos importantes.</p>
        </div>
      </div>
    </div>
  );
}