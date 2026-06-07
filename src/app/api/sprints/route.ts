import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSprintsWithTests } from '@/lib/data';

export const GET = async () => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const sprints = await getSprintsWithTests();

  // DTO seguro (não expõe passwordHash) e no mesmo formato do SSR.
  const dto = sprints.map((s) => ({
    id: s.id,
    number: s.number,
    title: s.title,
    dayStart: s.dayStart,
    dayEnd: s.dayEnd,
    status: s.status,
    expectedBugs: s.expectedBugs,
    tests: s.tests.map((t) => ({
      id: t.id,
      code: t.code,
      type: t.type,
      title: t.title,
      scenario: t.scenario,
      expected: t.expected,
      status: t.status,
      assignee: t.assignee ? { id: t.assignee.id, name: t.assignee.name, handle: t.assignee.handle } : null,
    })),
  }));

  return NextResponse.json(dto);
};