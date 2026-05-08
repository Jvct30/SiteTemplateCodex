import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Lunart | E-commerce Artesanal",
  description: "Artesanato com alma de estrela. Produtos únicos, peças customizadas e muito mais.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased relative`}
      >
        <QueryProvider>
          <AuthProvider>
            {/* Header placeholder will go here */}
            <main className="relative z-10 flex min-h-screen flex-col">
              {children}
            </main>
            {/* Footer placeholder will go here */}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
