'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckSquare, Bug, LayoutDashboard, Lightbulb, ListChecks, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/sprints', label: 'Sprints & Testes', icon: ListChecks },
  { href: '/bugs', label: 'Bugs', icon: Bug },
  { href: '/melhorias', label: 'Melhorias', icon: Lightbulb },
  { href: '/checklist', label: 'Checklist', icon: CheckSquare },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r bg-card md:flex">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ShieldCheck className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">Central de Qualidade</p>
          <p className="text-xs text-muted-foreground">Administra.ai</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
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
      <div className="border-t p-4 text-xs text-muted-foreground">
        <p>90 dias · 11 sprints</p>
        <p>188 testes mapeados</p>
      </div>
    </aside>
  );
};
