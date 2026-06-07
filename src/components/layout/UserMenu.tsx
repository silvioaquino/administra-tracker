'use client';

import { signOut } from 'next-auth/react';
import { LogOut, ChevronDown } from 'lucide-react';
import type { Role } from '@prisma/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { roleMeta } from '@/lib/labels';

type Props = {
  name: string;
  handle: string;
  role: Role;
};

export const UserMenu = ({ name, handle, role }: Props) => {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/login' });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <Popover>
      <PopoverTrigger
        render={<Button variant="ghost" className="flex h-auto items-center gap-2 px-2 py-1.5" />}
      >
        <Avatar className="size-8">
          <AvatarFallback className="bg-primary text-xs text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="hidden text-left leading-tight sm:block">
          <p className="text-sm font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">{handle}</p>
        </div>
        <ChevronDown className="size-3 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="end">
        <div className="p-3">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">{name}</p>
            <Badge variant="secondary" className={roleMeta[role].className}>
              {roleMeta[role].emoji} {roleMeta[role].label}
            </Badge>
          </div>
        </div>
        <Separator />
        <div className="p-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive hover:text-destructive" 
            onClick={handleLogout}
          >
            <LogOut className="mr-2 size-4" />
            Sair
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};