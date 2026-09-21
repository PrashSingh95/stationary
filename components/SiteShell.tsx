import type { ReactNode } from 'react';

import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { WhatsAppButton } from '@/components/WhatsAppButton';

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      {children}
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
