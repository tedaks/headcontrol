"use client";

import { Sidebar } from "./sidebar";
import { List, X } from "@phosphor-icons/react";
import { useState } from "react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="md:hidden flex h-14 items-center border-b border-border px-4 bg-card">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-muted-foreground"
        >
          {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
        </button>
        <span className="ml-3 text-sm font-semibold">HeadControl</span>
      </header>
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-card">
          <Sidebar />
        </div>
      )}
    </>
  );
}
