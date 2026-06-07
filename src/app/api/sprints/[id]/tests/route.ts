import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const createTestSchema = z.object({
  code: z.string().min(1),
  type: z.enum([
    'SEGURANCA',
    'UNITARIO',
    'INTEGRACAO',
    'E2E',
    'USABILIDADE',
    'PERFORMANCE',
    'UI_UX',
    'ACESSIBILIDADE',
  ]),
  title: z.string().min(1),
  scenario: z.string(),
  expected: z.string(),
  assigneeId: z.string().nullable().optional(),
});

export const POST = async (request: Request, ctx: { params: Promise<{ id: string }> }) => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await ctx.params;
  const body = await request.json();
  const parsed = createTestSchema.safeParse(body);
  
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', issues: parsed.error.issues }, { status: 400 });
  }

  const test = await prisma.test.create({
    data: {
      ...parsed.data,
      sprintId: id,
      status: 'PENDENTE',
    },
    include: {
      assignee: { select: { id: true, name: true, handle: true } },
    },
  });

  return NextResponse.json(test);
};