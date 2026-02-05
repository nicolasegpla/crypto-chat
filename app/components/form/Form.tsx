import React, { FormEvent } from "react";

interface FormProps {
    handleSubmit: (e?: FormEvent<HTMLFormElement>, valueOverride?: string) => void;
    isLoading: boolean;
    inputValue: string;
    setInputValue: React.Dispatch<React.SetStateAction<string>>;
}   

export const Form = ({ handleSubmit, isLoading, inputValue, setInputValue }: FormProps) => {
    return (
        <div className="p-4 bg-transparent dark:bg-black border-none border-gray-100 dark:border-zinc-800">
        <form onSubmit={(e) => handleSubmit(e)} className="flex gap-2 relative">
          <input
            className="flex-1 p-4 pr-12 border border-gray-200 dark:border-zinc-700 rounded-2xl bg-gray-50 dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm"
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
    )
}