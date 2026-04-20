"use client";

import { MobileNavContent } from "./sidebar";
import { List, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="md:hidden flex h-14 items-center border-b border-border px-4 bg-card">
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
