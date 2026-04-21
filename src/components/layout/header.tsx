'use client';

import { MobileNavContent } from './sidebar';
import { List, X } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="border-border bg-card flex h-14 items-center border-b px-4 md:hidden">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-muted-foreground"
        >
          {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
        </Button>
        <span className="ml-3 text-sm font-semibold">HeadControl</span>
      </header>
      {mobileMenuOpen && <MobileNavContent />}
    </>
  );
}
