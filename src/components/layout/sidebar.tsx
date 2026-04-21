'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { House, Users, Desktop, Key, ShieldCheck, FileCode, SignOut } from '@phosphor-icons/react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: House },
  { href: '/nodes', label: 'Nodes', icon: Desktop },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/preauthkeys', label: 'Pre-Auth Keys', icon: Key },
  { href: '/apikeys', label: 'API Keys', icon: ShieldCheck },
  { href: '/policy', label: 'Policy', icon: FileCode },
];

function NavContent() {
  const pathname = usePathname();

  return (
    <>
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-none px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon size={18} weight={isActive ? 'fill' : 'regular'} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <Separator />
      <div className="p-2">
        <form action="/api/logout" method="POST">
          <Button
            type="submit"
            variant="ghost"
            className="text-muted-foreground hover:bg-accent hover:text-accent-foreground flex w-full items-center justify-start gap-3 rounded-none px-3 py-2 text-sm"
          >
            <SignOut size={18} />
            Sign Out
          </Button>
        </form>
      </div>
    </>
  );
}

export function Sidebar() {
  return (
    <aside className="border-border bg-card hidden md:flex md:w-56 md:flex-col md:border-r">
      <div className="flex h-14 items-center px-4">
        <span className="text-sm font-semibold">HeadControl</span>
      </div>
      <Separator />
      <NavContent />
    </aside>
  );
}

/** Mobile version of the nav — rendered as a standalone block, not nested in <aside>. */
export function MobileNavContent() {
  return (
    <div className="bg-card p-2 md:hidden">
      <div className="flex items-center px-3 py-2">
        <span className="text-sm font-semibold">HeadControl</span>
      </div>
      <Separator />
      <NavContent />
    </div>
  );
}
