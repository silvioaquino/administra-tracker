import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const createBugSchema = z.object({
  code: z.string().min(1),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  day: z.string().nullable().optional(),
  sprintId: z.string().nullable().optional(),
  priority: z.enum(['ALTA', 'MEDIA', 'BAIXA']),
  status: z.enum(['PENDENTE', 'CORRIGINDO', 'DEPLOYADO', 'FECHADO']),
  assigneeId: z.string().nullable().optional(),
});

export const POST = async (request: Request) => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const parsed = createBugSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', issues: parsed.error.issues }, { status: 400 });
  }

  const { sprintId, ...rest } = parsed.data;

  // Deriva sprintRef (ex: "S3") a partir da sprint selecionada.
  let sprintRef: string | null = null;
  if (sprintId) {
    const sprint = await prisma.sprint.findUnique({ where: { id: sprintId }, select: { number: true } });
    if (sprint) sprintRef = `S${sprint.number}`;
  }

  const bug = await prisma.bug.create({
    data: { ...rest, sprintId: sprintId ?? null, sprintRef },
    include: { assignee: { select: { id: true, name: true, handle: true } } },
  });

  return NextResponse.json(bug);
};
