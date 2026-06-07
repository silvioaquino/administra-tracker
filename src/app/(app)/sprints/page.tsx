import { SprintsView, type SprintDTO } from '@/components/sprints/SprintsView';
import { getSprintsWithTests } from '@/lib/data';

export const dynamic = 'force-dynamic';

const SprintsPage = async () => {
  const sprints = await getSprintsWithTests();

  // Garantir que os testes tenham o campo assignee com id
  const dto: SprintDTO[] = sprints.map((s) => ({
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

  const totalTests = dto.reduce((acc, s) => acc + s.tests.length, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sprints &amp; Testes</h1>
        <p className="text-sm text-muted-foreground">
          {dto.length} sprints · {totalTests} testes
        </p>
      </div>
      {dto.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma sprint encontrada. Configure o banco e rode o seed.</p>
      ) : (
        <SprintsView sprints={dto} />
      )}
    </div>
  );
};

export default SprintsPage;