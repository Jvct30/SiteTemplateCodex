"use client";

import type { ReactNode } from "react";

import { InstagramIcon, ShopeeIcon, WhatsappIcon } from "@/components/ui/SocialIcons";
import { useStoreLinks } from "@/hooks/useStoreLinks";

function IconLink({
  href,
  label,
  children,
}: {
  href?: string;
  label: string;
  children: ReactNode;
}) {
  if (!href) {
    return (
      <span
        aria-label={label}
        className="rounded-full p-2 text-template-white/35"
      >
        {children}
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="rounded-full p-2 text-template-white/65 transition-colors hover:bg-template-white/10 hover:text-template-pink-300"
    >
      {children}
    </a>
  );
}

export function Footer() {
  const { links } = useStoreLinks();

  return (
    <footer className="relative z-10 mt-auto w-full border-t border-template-white/10 bg-template-bg/80 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 text-center sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl font-bold text-transparent bg-clip-text bg-template-gradient">
          Template Store
        </h2>
        <p className="text-sm text-template-white/55">
          Base genérica para loja virtual com catálogo, carrinho e atendimento.
        </p>
        <div className="flex items-center justify-center gap-2">
          <IconLink href={links?.instagram_url} label="Instagram">
            <InstagramIcon className="h-5 w-5" />
          </IconLink>
          <IconLink href={links?.shopee_url} label="Shopee">
            <ShopeeIcon className="h-5 w-5" />
          </IconLink>
          <IconLink href={links?.whatsapp_url} label="WhatsApp">
            <WhatsappIcon className="h-5 w-5" />
          </IconLink>
        </div>
        <div className="text-xs text-template-white/35">
          &copy; {new Date().getFullYear()} Template Store. Personalize para sua marca.
        </div>
      </div>
    </footer>
  );
}
