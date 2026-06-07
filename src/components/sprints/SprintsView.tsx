'use client';

import { useState, useEffect, useMemo } from 'react';
import type { SprintStatus, TestStatus, TestType } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronDown, ChevronRight, Edit, Plus } from 'lucide-react';
import { SprintsFilters, FilterOptions } from './SprintsFilters';
import { SprintsListView } from './SprintsListView';
import { TestsListView } from './TestsListView';
import { SprintEditDialog } from './SprintEditDialog';
import { TestEditDialog } from './TestEditDialog';

export type TestDTO = {
  id: string;
  code: string;
  type: TestType;
  title: string;
  scenario: string;
  expected: string;
  status: TestStatus;
  assignee: { id?: string; name: string; handle: string } | null;
  sprintId?: string;
};

export type SprintDTO = {
  id: string;
  number: number;
  title: string;
  dayStart: number;
  dayEnd: number;
  status: SprintStatus;
  expectedBugs: string | null;
  tests: TestDTO[];
};

interface SprintsViewProps {
  sprints: SprintDTO[];
}

export function SprintsView({ sprints: initialSprints }: SprintsViewProps) {
  const [expandedSprints, setExpandedSprints] = useState<Set<string>>(new Set());
  const [selectedSprint, setSelectedSprint] = useState<SprintDTO | null>(null);
  const [selectedTest, setSelectedTest] = useState<TestDTO | null>(null);
  const [currentSprintId, setCurrentSprintId] = useState<string>('');
  const [users, setUsers] = useState<Array<{ id: string; name: string; handle: string }>>([]);
  const [sprintsData, setSprintsData] = useState<SprintDTO[]>(initialSprints);
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    sprintStatus: 'ALL',
    testStatus: 'ALL',
    testType: 'ALL',
    assignee: 'ALL',
    showOnly: 'ALL',
  });
  const [, setSelectedSprintForView] = useState<SprintDTO | null>(null);

  // Carregar usuários para atribuição
  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error('Erro ao carregar usuários:', err));
  }, []);

  // Filtrar sprints baseado nos filtros
  const filteredData = useMemo(() => {
    let filteredSprints = [...sprintsData];

    // Filtro de status da sprint
    if (filters.sprintStatus !== 'ALL') {
      filteredSprints = filteredSprints.filter(s => s.status === filters.sprintStatus);
    }

    // Filtro de busca textual
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filteredSprints = filteredSprints.filter(sprint => {
        // Busca em campos da sprint
        const sprintMatches = 
          sprint.title.toLowerCase().includes(searchLower) ||
          sprint.number.toString().includes(searchLower);
        
        // Busca em testes
        const testMatches = sprint.tests.some(test =>
          test.code.toLowerCase().includes(searchLower) ||
          test.title.toLowerCase().includes(searchLower) ||
          test.scenario.toLowerCase().includes(searchLower) ||
          test.expected.toLowerCase().includes(searchLower)
        );
        
        return sprintMatches || testMatches;
      });
    }

    // Filtros relacionados a testes
    if (filters.testStatus !== 'ALL' || filters.testType !== 'ALL' || filters.assignee !== 'ALL') {
      filteredSprints = filteredSprints.map(sprint => ({
        ...sprint,
        tests: sprint.tests.filter(test => {
          let matches = true;
          
          if (filters.testStatus !== 'ALL') {
            matches = matches && test.status === filters.testStatus;
          }
          
          if (filters.testType !== 'ALL') {
            matches = matches && test.type === filters.testType;
          }
          
          if (filters.assignee !== 'ALL') {
            if (filters.assignee === 'UNASSIGNED') {
              matches = matches && !test.assignee;
            } else {
              matches = matches && test.assignee?.id === filters.assignee;
            }
          }
          
          return matches;
        }),
      }));
    }

    // Remover sprints que ficaram sem testes (se houver filtros de teste ativos)
    if (filters.testStatus !== 'ALL' || filters.testType !== 'ALL' || filters.assignee !== 'ALL') {
      filteredSprints = filteredSprints.filter(sprint => sprint.tests.length > 0);
    }

    return filteredSprints;
  }, [sprintsData, filters]);

  // Preparar lista de todos os testes para visualização em lista
  const allTests = useMemo(() => {
    const tests: Array<TestDTO & { sprintNumber: number; sprintTitle: string; sprintId: string }> = [];
    filteredData.forEach(sprint => {
      sprint.tests.forEach(test => {
        tests.push({
          ...test,
          sprintNumber: sprint.number,
          sprintTitle: sprint.title,
          sprintId: sprint.id,
        });
      });
    });
    return tests;
  }, [filteredData]);

  const toggleSprint = (sprintId: string) => {
    const newExpanded = new Set(expandedSprints);
    if (newExpanded.has(sprintId)) {
      newExpanded.delete(sprintId);
    } else {
      newExpanded.add(sprintId);
    }
    setExpandedSprints(newExpanded);
  };

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

  const refreshData = async () => {
    const response = await fetch('/api/sprints');
    const data = await response.json();
    setSprintsData(data);
  };

  const handleViewSprint = (sprint: SprintDTO) => {
    setSelectedSprintForView(sprint);
    setExpandedSprints(new Set([sprint.id]));
  };

  // Renderização baseada no tipo de visualização
  const renderContent = () => {
    if (filters.showOnly === 'SPRINTS_ONLY') {
      return (
        <SprintsListView
          sprints={filteredData}
          onEditSprint={(sprint) => setSelectedSprint(sprint)}
          onViewSprint={handleViewSprint}
        />
      );
    }

    if (filters.showOnly === 'TESTS_ONLY') {
      return (
        <TestsListView
          tests={allTests}
          onEditTest={(test, sprintId) => {
            setCurrentSprintId(sprintId);
            setSelectedTest(test);
          }}
        />
      );
    }

    // Visualização padrão (cards expandíveis)
    if (filteredData.length === 0) {
      return (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhum resultado encontrado com os filtros aplicados.
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {filteredData.map((sprint) => (
          <Card key={sprint.id} className="overflow-hidden">
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => toggleSprint(sprint.id)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {expandedSprints.has(sprint.id) ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  <CardTitle className="text-lg">
                    Sprint #{sprint.number}: {sprint.title}
                  </CardTitle>
                  <Badge className={getSprintStatusColor(sprint.status)}>
                    {sprint.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    Dias {sprint.dayStart} - {sprint.dayEnd}
                  </div>
                  {sprint.expectedBugs !== null && (
                    <Badge variant="outline">Bugs esperados: {sprint.expectedBugs}</Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSprint(sprint);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {expandedSprints.has(sprint.id) && (
              <CardContent className="pt-4">
                <div className="mb-4 flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => {
                      setCurrentSprintId(sprint.id);
                      setSelectedTest(null);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Novo Teste
                  </Button>
                </div>
                {sprint.tests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum teste encontrado para esta sprint.
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
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
                        {sprint.tests.map((test) => (
                          <TableRow key={test.id}>
                            <TableCell className="font-mono text-sm">{test.code}</TableCell>
                            <TableCell>{test.type}</TableCell>
                            <TableCell>{test.title}</TableCell>
                            <TableCell className="max-w-md truncate">{test.scenario}</TableCell>
                            <TableCell className="max-w-md truncate">{test.expected}</TableCell>
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
                                onClick={() => {
                                  setCurrentSprintId(sprint.id);
                                  setSelectedTest(test);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    );
  };

  return (
    <>
      <SprintsFilters
        filters={filters}
        onFiltersChange={setFilters}
        users={users}
      />

      {renderContent()}

      <SprintEditDialog
        sprint={selectedSprint}
        open={!!selectedSprint}
        onOpenChange={(open) => !open && setSelectedSprint(null)}
        onSave={refreshData}
      />

      <TestEditDialog
        test={selectedTest}
        sprintId={currentSprintId}
        users={users}
        open={!!(selectedTest || currentSprintId)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTest(null);
            setCurrentSprintId('');
          }
        }}
        onSave={refreshData}
      />
    </>
  );
}