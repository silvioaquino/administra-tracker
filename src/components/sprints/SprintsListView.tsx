'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Eye } from 'lucide-react';
import { SprintDTO } from './SprintsView';

interface SprintsListViewProps {
  sprints: SprintDTO[];
  onEditSprint: (sprint: SprintDTO) => void;
  onViewSprint: (sprint: SprintDTO) => void;
}

export function SprintsListView({ sprints, onEditSprint, onViewSprint }: SprintsListViewProps) {
  const getSprintStatusColor = (status: string) => {
    switch (status) {
      case 'NAO_INICIADO':
        return 'bg-gray-500';
      case 'EM_ANDAMENTO':
        return 'bg-amber-500';
      case 'CONCLUIDO':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Sprints Encontradas ({sprints.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bugs Esperados</TableHead>
                <TableHead>Total de Testes</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sprints.map((sprint) => (
                <TableRow key={sprint.id}>
                  <TableCell className="font-mono font-medium">{sprint.number}</TableCell>
                  <TableCell>{sprint.title}</TableCell>
                  <TableCell className="text-sm">
                    Dia {sprint.dayStart} - Dia {sprint.dayEnd}
                  </TableCell>
                  <TableCell>
                    <Badge className={getSprintStatusColor(sprint.status)}>{sprint.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {sprint.expectedBugs !== null ? sprint.expectedBugs : 'Não definido'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{sprint.tests.length} testes</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewSprint(sprint)}
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditSprint(sprint)}
                        title="Editar sprint"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}