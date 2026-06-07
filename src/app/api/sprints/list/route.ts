import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const GET = async () => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const sprints = await prisma.sprint.findMany({
    orderBy: { number: 'asc' },
    select: { id: true, number: true, title: true },
  });

  return NextResponse.json(sprints);
};
