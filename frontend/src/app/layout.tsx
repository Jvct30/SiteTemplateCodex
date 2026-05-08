import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { Toaster } from "react-hot-toast";
import { Toaster } from "react-hot-toast";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StarField } from "@/components/layout/StarField";

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
            <StarField />
            <Header />
            <main className="relative z-10 flex flex-col flex-1 container mx-auto px-4 py-8">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
