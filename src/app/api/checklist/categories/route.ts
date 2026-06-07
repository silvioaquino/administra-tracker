import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const createSchema = z.object({ category: z.string().min(1) });

// Como as categorias derivam dos itens, criar uma categoria gera um item
// inicial (placeholder) para que ela apareça na listagem.
export const POST = async (request: Request) => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', issues: parsed.error.issues }, { status: 400 });
  }

  const existing = await prisma.checklistItem.count({ where: { category: parsed.data.category } });
  if (existing > 0) {
    return NextResponse.json({ error: 'Categoria já existe' }, { status: 409 });
  }

  const item = await prisma.checklistItem.create({
    data: { category: parsed.data.category, label: 'Novo item — edite-me', order: 0 },
  });

  return NextResponse.json(item);
};

export const DELETE = async (request: Request) => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const category = new URL(request.url).searchParams.get('category');
  if (!category) return NextResponse.json({ error: 'Categoria não informada' }, { status: 400 });

  await prisma.checklistItem.deleteMany({ where: { category } });
  return NextResponse.json({ success: true });
};
