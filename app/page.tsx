'use client';

import { useState, useRef, useEffect } from 'react';
import { useUIState, useActions } from 'ai/rsc';
import { AI } from './actions'; // Importamos el Provider que configuramos en el paso anterior
import { Header } from './components/ui/Header';
import { Chat } from './components/chat/Chat';
import { Form } from './components/form/Form';

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
    <div className="flex flex-col h-screen max-w-3xl mx-auto bg-orange-200 dark:bg-black border-none border-gray-200 dark:border-zinc-800 shadow-xl gradient">
      
      {/* HEADER */}
      <Header />

      {/* ÁREA DE CHAT */}
      <Chat 
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        messages={messages}
        messagesEndRef={messagesEndRef}
      />

      {/* INPUT AREA */}
      
      <Form 
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        inputValue={inputValue}
        setInputValue={setInputValue}
      />
    </div>
  );
}