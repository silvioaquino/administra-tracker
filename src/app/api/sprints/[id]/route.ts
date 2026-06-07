import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const sprintSchema = z.object({
  number: z.number().int().min(0),
  title: z.string().min(1),
  dayStart: z.number().int().min(0),
  dayEnd: z.number().int().min(0),
  status: z.enum(['NAO_INICIADO', 'EM_ANDAMENTO', 'CONCLUIDO']),
  expectedBugs: z.string().nullable(),
});

export const PUT = async (request: Request, ctx: { params: Promise<{ id: string }> }) => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await ctx.params;
  const body = await request.json();
  const parsed = sprintSchema.safeParse(body);
  
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', issues: parsed.error.issues }, { status: 400 });
  }

  const sprint = await prisma.sprint.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(sprint);
};

export const DELETE = async (request: Request, ctx: { params: Promise<{ id: string }> }) => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await ctx.params;
  
  // Deletar testes associados primeiro
  await prisma.test.deleteMany({ where: { sprintId: id } });
  await prisma.sprint.delete({ where: { id } });
  
  return NextResponse.json({ success: true });
};