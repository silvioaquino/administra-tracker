'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit } from 'lucide-react';
import { TestDTO } from './SprintsView';

interface TestsListViewProps {
  tests: Array<TestDTO & { sprintNumber: number; sprintTitle: string; sprintId: string }>;
  onEditTest: (test: TestDTO, sprintId: string) => void;
}

export function TestsListView({ tests, onEditTest }: TestsListViewProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return 'bg-gray-500';
      case 'EXECUTANDO':
        return 'bg-blue-500';
      case 'PASSOU':
        return 'bg-green-500';
      case 'FALHOU':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTypeBadgeVariant = (type: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (type) {
      case 'SEGURANCA':
        return 'destructive';
      case 'E2E':
      case 'INTEGRACAO':
        return 'secondary';
      case 'PERFORMANCE':
      case 'USABILIDADE':
      case 'UI_UX':
      case 'ACESSIBILIDADE':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Testes Encontrados ({tests.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sprint</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Cenário</TableHead>
                <TableHead>Resultado Esperado</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tests.map((test) => (
                <TableRow key={test.id}>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">Sprint #{test.sprintNumber}</div>
                      <div className="text-xs text-muted-foreground">{test.sprintTitle}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{test.code}</TableCell>
                  <TableCell>
                    <Badge variant={getTypeBadgeVariant(test.type)}>{test.type}</Badge>
                  </TableCell>
                  <TableCell className="max-w-md truncate" title={test.title}>
                    {test.title}
                  </TableCell>
                  <TableCell className="max-w-md truncate" title={test.scenario}>
                    {test.scenario}
                  </TableCell>
                  <TableCell className="max-w-md truncate" title={test.expected}>
                    {test.expected}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(test.status)}>{test.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {test.assignee ? (
                      <div className="text-sm">
                        <div className="font-medium">{test.assignee.name}</div>
                        <div className="text-xs text-muted-foreground">@{test.assignee.handle}</div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Não atribuído</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditTest(test, test.sprintId)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
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