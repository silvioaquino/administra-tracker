import { BugsView, type BugDTO } from '@/components/bugs/BugsView';
import { getBugs } from '@/lib/data';

export const dynamic = 'force-dynamic';

const BugsPage = async () => {
  const bugs = await getBugs();

  const dto: BugDTO[] = bugs.map((b) => ({
    id: b.id,
    code: b.code,
    title: b.title,
    description: b.description ?? undefined,
    day: b.day,
    sprintRef: b.sprintRef,
    sprintId: b.sprintId,
    priority: b.priority,
    status: b.status,
    assignee: b.assignee ? { id: b.assignee.id, handle: b.assignee.handle } : null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bugs</h1>
        <p className="text-sm text-muted-foreground">{dto.length} bugs mapeados no cronograma</p>
      </div>
      {dto.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum bug. Configure o banco e rode o seed.</p>
      ) : (
        <BugsView bugs={dto} />
      )}
    </div>
  );
};

export default BugsPage;
