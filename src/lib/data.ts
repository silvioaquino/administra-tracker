import { prisma } from '@/lib/prisma';
import type {
  Bug,
  BugStatus,
  ChecklistItem,
  Improvement,
  Metric,
  Priority,
  Sprint,
  Test,
  TestStatus,
  TestType,
  User,
} from '@prisma/client';

// Wrapper resiliente: se o banco não estiver configurado/acessível,
// devolve o fallback em vez de derrubar a página.
const safe = async <T>(fn: () => Promise<T>, fallback: T): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    console.error('[data] Falha ao consultar o banco:', (error as Error).message);
    return fallback;
  }
};

export type TestWithAssignee = Test & { assignee: User | null };
export type SprintWithTests = Sprint & { tests: TestWithAssignee[] };
export type BugWithRelations = Bug & { assignee: User | null; sprint: Sprint | null };
export type ImprovementWithAssignee = Improvement & { assignee: User | null };

export const getMetrics = (): Promise<Metric[]> =>
  safe(() => prisma.metric.findMany({ orderBy: { order: 'asc' } }), []);

export const getSprintsWithTests = (): Promise<SprintWithTests[]> =>
  safe(
    () =>
      prisma.sprint.findMany({
        orderBy: { number: 'asc' },
        include: { tests: { include: { assignee: true }, orderBy: { code: 'asc' } } },
      }),
    [],
  );

export const getBugs = (): Promise<BugWithRelations[]> =>
  safe(
    () =>
      prisma.bug.findMany({
        orderBy: [{ priority: 'asc' }, { code: 'asc' }],
        include: { assignee: true, sprint: true },
      }),
    [],
  );

export const getImprovements = (): Promise<ImprovementWithAssignee[]> =>
  safe(
    () => prisma.improvement.findMany({ orderBy: { code: 'asc' }, include: { assignee: true } }),
    [],
  );

export const getChecklist = (): Promise<ChecklistItem[]> =>
  safe(
    () => prisma.checklistItem.findMany({ orderBy: [{ category: 'asc' }, { order: 'asc' }] }),
    [],
  );

export const getTeam = (): Promise<User[]> =>
  safe(() => prisma.user.findMany({ orderBy: { role: 'asc' } }), []);

export type DashboardStats = {
  tests: { total: number; byStatus: Record<TestStatus, number>; byType: Record<TestType, number>; passRate: number };
  bugs: { total: number; abertos: number; criticos: number; byPriority: Record<Priority, number>; byStatus: Record<BugStatus, number> };
  improvements: { total: number; implementados: number };
  checklist: { total: number; done: number };
  sprintProgress: { number: number; title: string; total: number; passou: number; falhou: number; pendente: number }[];
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const empty: DashboardStats = {
    tests: {
      total: 0,
      byStatus: { PENDENTE: 0, EXECUTANDO: 0, PASSOU: 0, FALHOU: 0 },
      byType: { SEGURANCA: 0, UNITARIO: 0, INTEGRACAO: 0, E2E: 0, USABILIDADE: 0, PERFORMANCE: 0, UI_UX: 0, ACESSIBILIDADE: 0 },
      passRate: 0,
    },
    bugs: {
      total: 0,
      abertos: 0,
      criticos: 0,
      byPriority: { ALTA: 0, MEDIA: 0, BAIXA: 0 },
      byStatus: { PENDENTE: 0, CORRIGINDO: 0, DEPLOYADO: 0, FECHADO: 0 },
    },
    improvements: { total: 0, implementados: 0 },
    checklist: { total: 0, done: 0 },
    sprintProgress: [],
  };

  return safe(async () => {
    const [sprints, bugs, improvements, checklist] = await Promise.all([
      prisma.sprint.findMany({ orderBy: { number: 'asc' }, include: { tests: true } }),
      prisma.bug.findMany(),
      prisma.improvement.findMany(),
      prisma.checklistItem.findMany(),
    ]);

    const stats = structuredClone(empty);

    for (const sprint of sprints) {
      let passou = 0;
      let falhou = 0;
      let pendente = 0;
      for (const t of sprint.tests) {
        stats.tests.total++;
        stats.tests.byStatus[t.status]++;
        stats.tests.byType[t.type]++;
        if (t.status === 'PASSOU') passou++;
        else if (t.status === 'FALHOU') falhou++;
        else pendente++;
      }
      stats.sprintProgress.push({
        number: sprint.number,
        title: sprint.title,
        total: sprint.tests.length,
        passou,
        falhou,
        pendente,
      });
    }
    stats.tests.passRate = stats.tests.total ? Math.round((stats.tests.byStatus.PASSOU / stats.tests.total) * 100) : 0;

    for (const b of bugs) {
      stats.bugs.total++;
      stats.bugs.byPriority[b.priority]++;
      stats.bugs.byStatus[b.status]++;
      if (b.status !== 'FECHADO') {
        stats.bugs.abertos++;
        if (b.priority === 'ALTA') stats.bugs.criticos++;
      }
    }

    stats.improvements.total = improvements.length;
    stats.improvements.implementados = improvements.filter((i) => i.status === 'IMPLEMENTADO').length;

    stats.checklist.total = checklist.length;
    stats.checklist.done = checklist.filter((c) => c.done).length;

    return stats;
  }, empty);
};
