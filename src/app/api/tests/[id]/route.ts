import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Schema para PATCH (apenas status)
const patchSchema = z.object({
  status: z.enum(['PENDENTE', 'EXECUTANDO', 'PASSOU', 'FALHOU']),
});

const testSchema = z.object({
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
  status: z.enum(['PENDENTE', 'EXECUTANDO', 'PASSOU', 'FALHOU']),
  assigneeId: z.string().nullable().optional(),
});

// PATCH para atualizar apenas o status
export const PATCH = async (request: Request, ctx: { params: Promise<{ id: string }> }) => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await ctx.params;
  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', issues: parsed.error.issues }, { status: 400 });
  }

  const test = await prisma.test.update({
    where: { id },
    data: {
      status: parsed.data.status,
      executedAt: parsed.data.status === 'PASSOU' || parsed.data.status === 'FALHOU' ? new Date() : null,
    },
  });

  return NextResponse.json(test);
};

// PUT para atualização completa
export const PUT = async (request: Request, ctx: { params: Promise<{ id: string }> }) => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await ctx.params;
  const body = await request.json();
  const parsed = testSchema.safeParse(body);
  
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', issues: parsed.error.issues }, { status: 400 });
  }

  const test = await prisma.test.update({
    where: { id },
    data: {
      ...parsed.data,
      executedAt: parsed.data.status === 'PASSOU' || parsed.data.status === 'FALHOU' ? new Date() : null,
    },
  });

  return NextResponse.json(test);
};

// DELETE para remover teste
export const DELETE = async (request: Request, ctx: { params: Promise<{ id: string }> }) => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await ctx.params;
  await prisma.test.delete({ where: { id } });
  return NextResponse.json({ success: true });
};