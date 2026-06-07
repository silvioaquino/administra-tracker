import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  status: z.enum(['PENDENTE', 'EM_ANALISE', 'IMPLEMENTADO']),
});

const updateSchema = z.object({
  code: z.string().min(1),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  priority: z.enum(['ALTA', 'MEDIA', 'BAIXA']),
  status: z.enum(['PENDENTE', 'EM_ANALISE', 'IMPLEMENTADO']),
  sprintId: z.string().nullable().optional(),
  assigneeId: z.string().nullable().optional(),
});

const resolveSprintRef = async (sprintId?: string | null): Promise<string | null> => {
  if (!sprintId) return null;
  const sprint = await prisma.sprint.findUnique({ where: { id: sprintId }, select: { number: true } });
  return sprint ? `S${sprint.number}` : null;
};

export const PATCH = async (request: Request, ctx: { params: Promise<{ id: string }> }) => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await ctx.params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', issues: parsed.error.issues }, { status: 400 });
  }

  const improvement = await prisma.improvement.update({ where: { id }, data: parsed.data });
  return NextResponse.json(improvement);
};

export const PUT = async (request: Request, ctx: { params: Promise<{ id: string }> }) => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await ctx.params;
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', issues: parsed.error.issues }, { status: 400 });
  }

  const { sprintId, ...rest } = parsed.data;
  const sprintRef = await resolveSprintRef(sprintId);

  const improvement = await prisma.improvement.update({
    where: { id },
    data: { ...rest, sprintRef },
    include: { assignee: { select: { id: true, name: true, handle: true } } },
  });

  return NextResponse.json(improvement);
};

export const DELETE = async (request: Request, ctx: { params: Promise<{ id: string }> }) => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await ctx.params;
  await prisma.improvement.delete({ where: { id } });
  return NextResponse.json({ success: true });
};
