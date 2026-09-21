import { MessageCircle } from 'lucide-react';

import { makeWhatsAppUrl } from '@/data/products';

export function WhatsAppButton() {
  return (
    <a
      aria-label="Contact PaperNest on WhatsApp"
      className="fixed bottom-5 right-5 z-50 grid size-14 place-items-center rounded-full bg-emerald-500 text-white shadow-2xl shadow-emerald-900/25 transition hover:scale-105"
      href={makeWhatsAppUrl()}
      target="_blank"
      rel="noreferrer"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-30" />
      <MessageCircle className="relative size-6" />
    </a>
  );
}
