import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AI } from "./actions"; // <--- IMPORTANTE: Asegúrate de importar esto

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Crypto Chat AI",
  description: "Prueba Técnica Frontend",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={inter.className}>
        {/* EL ABRAZO: Todo lo que esté dentro de AI tendrá acceso al chat */}
        <AI>
          {children}
        </AI>
      </body>
    </html>
  );
}