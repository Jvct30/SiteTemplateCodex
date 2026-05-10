import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { Toaster } from "react-hot-toast";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AmbientField } from "@/components/layout/AmbientField";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "SiteTemplateCodex",
  description:
    "Template full stack para lojas virtuais com catálogo, carrinho e painel administrativo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth" data-scroll-behavior="smooth">
      <body
        className={`${inter.variable} ${outfit.variable} relative min-h-screen overflow-x-hidden font-sans antialiased`}
      >
        <QueryProvider>
          <AuthProvider>
            <Toaster 
              position="bottom-right" 
              toastOptions={{ 
                style: { 
                  background: '#1a1230', 
                  color: '#faf5ff', 
                  border: '1px solid rgba(196, 181, 253, 0.15)' 
                } 
              }} 
            />
            <AmbientField />
            <Header />
            <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
