'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, CheckSquare, Bug, LayoutDashboard, Lightbulb, ListChecks, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/sprints', label: 'Sprints & Testes', icon: ListChecks },
  { href: '/bugs', label: 'Bugs', icon: Bug },
  { href: '/melhorias', label: 'Melhorias', icon: Lightbulb },
  { href: '/checklist', label: 'Checklist', icon: CheckSquare },
];

export const MobileMenu = () => {
  const pathname = usePathname();

  return (
    <Popover>
      <PopoverTrigger
        render={<Button variant="ghost" size="icon" className="md:hidden w-12 h-12" />}
      >
        <Menu className="h-[30px] w-[30px]" />
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start" side="bottom" sideOffset={8}>
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-2 border-b p-4">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="size-5" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold">Central de Qualidade</p>
              <p className="text-xs text-muted-foreground">Administra.ai</p>
            </div>
          </div>
          <nav className="flex-1 space-y-1 p-2">
            {nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <Separator />
          <div className="p-4 text-xs text-muted-foreground">
            <p>90 dias · 11 sprints</p>
            <p>188 testes mapeados</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

