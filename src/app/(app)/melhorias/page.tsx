import { ImprovementsView, type ImprovementDTO } from '@/components/improvements/ImprovementsView';
import { getImprovements } from '@/lib/data';

export const dynamic = 'force-dynamic';

const MelhoriasPage = async () => {
  const improvements = await getImprovements();

  const dto: ImprovementDTO[] = improvements.map((i) => ({
    id: i.id,
    code: i.code,
    title: i.title,
    description: i.description ?? undefined,
    priority: i.priority,
    status: i.status,
    sprintRef: i.sprintRef,
    assignee: i.assignee ? { id: i.assignee.id, handle: i.assignee.handle, name: i.assignee.name } : null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Melhorias</h1>
        <p className="text-sm text-muted-foreground">Backlog de melhorias sugeridas</p>
      </div>
      {dto.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma melhoria. Configure o banco e rode o seed.</p>
      ) : (
        <ImprovementsView improvements={dto} />
      )}
    </div>
  );
};

export default MelhoriasPage;
