export const Header = () => {
    return (
        <header className="p-4 border-none border-gray-100 dark:border-zinc-800 bg-transparent dark:bg-black/80 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            Crypto Chat AI
          </h1>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Powered by Coingecko & Vercel AI SDK.
        </p>
      </header>
    )
};