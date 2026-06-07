import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const createSchema = z.object({
  category: z.string().min(1),
  label: z.string().min(1),
});

export const POST = async (request: Request) => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', issues: parsed.error.issues }, { status: 400 });
  }

  const count = await prisma.checklistItem.count({ where: { category: parsed.data.category } });
  const item = await prisma.checklistItem.create({
    data: { category: parsed.data.category, label: parsed.data.label, order: count },
  });

  return NextResponse.json(item);
};
