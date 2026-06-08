'use client';

import { useState, useEffect, useMemo } from 'react';
import type { SprintStatus, TestStatus, TestType } from '@prisma/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronDown, ChevronRight, Edit, Plus } from 'lucide-react';
import { SprintsFilters, FilterOptions } from './SprintsFilters';
import { SprintsListView } from './SprintsListView';
import { TestsListView } from './TestsListView';
import { SprintEditDialog } from './SprintEditDialog';
import { TestEditDialog } from './TestEditDialog';
import { testStatusMeta, testStatusOrder, testTypeMeta } from '@/lib/labels';

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

  // Estado local para status dos testes (edição otimista)
  const [testStatuses, setTestStatuses] = useState<Record<string, TestStatus>>(() => {
    const initial: Record<string, TestStatus> = {};
    initialSprints.forEach(sprint => {
      sprint.tests.forEach(test => {
        initial[test.id] = test.status;
      });
    });
    return initial;
  });

  // Carregar usuários para atribuição
  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error('Erro ao carregar usuários:', err));
  }, []);

  // Função para atualizar status diretamente na tabela
  const updateTestStatus = async (testId: string, newStatus: TestStatus) => {
    const previousStatus = testStatuses[testId];
    
    setTestStatuses(prev => ({ ...prev, [testId]: newStatus }));
    setSprintsData(prev => prev.map(sprint => ({
      ...sprint,
      tests: sprint.tests.map(test => 
        test.id === testId ? { ...test, status: newStatus } : test
      )
    })));

    try {
      const response = await fetch(`/api/tests/${testId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) throw new Error();
      toast.success(`Status atualizado: ${testStatusMeta[newStatus].label}`);
    } catch (error) {
      setTestStatuses(prev => ({ ...prev, [testId]: previousStatus }));
      setSprintsData(prev => prev.map(sprint => ({
        ...sprint,
        tests: sprint.tests.map(test => 
          test.id === testId ? { ...test, status: previousStatus } : test
        )
      })));
      toast.error('Não foi possível atualizar o status');
    }
  };

  // Filtrar sprints baseado nos filtros
  const filteredData = useMemo(() => {
    let filteredSprints = [...sprintsData];

    if (filters.sprintStatus !== 'ALL') {
      filteredSprints = filteredSprints.filter(s => s.status === filters.sprintStatus);
    }

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filteredSprints = filteredSprints.filter(sprint => {
        const sprintMatches = 
          sprint.title.toLowerCase().includes(searchLower) ||
          sprint.number.toString().includes(searchLower);
        const testMatches = sprint.tests.some(test =>
          test.code.toLowerCase().includes(searchLower) ||
          test.title.toLowerCase().includes(searchLower) ||
          test.scenario.toLowerCase().includes(searchLower) ||
          test.expected.toLowerCase().includes(searchLower) ||
          (test.assignee?.name.toLowerCase().includes(searchLower)) ||
          (test.assignee?.handle.toLowerCase().includes(searchLower))
        );
        return sprintMatches || testMatches;
      });
    }

    if (filters.testStatus !== 'ALL' || filters.testType !== 'ALL' || filters.assignee !== 'ALL') {
      filteredSprints = filteredSprints.map(sprint => ({
        ...sprint,
        tests: sprint.tests.filter(test => {
          let matches = true;
          if (filters.testStatus !== 'ALL') matches = matches && test.status === filters.testStatus;
          if (filters.testType !== 'ALL') matches = matches && test.type === filters.testType;
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

    if (filters.testStatus !== 'ALL' || filters.testType !== 'ALL' || filters.assignee !== 'ALL') {
      filteredSprints = filteredSprints.filter(sprint => sprint.tests.length > 0);
    }

    return filteredSprints;
  }, [sprintsData, filters]);

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

  const getSprintStatusColor = (status: string) => {
    switch (status) {
      case 'NAO_INICIADO': return 'bg-gray-500 text-white';
      case 'EM_ANDAMENTO': return 'bg-blue-500 text-white';
      case 'CONCLUIDO': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const refreshData = async () => {
    const response = await fetch('/api/sprints');
    const data = await response.json();
    setSprintsData(data);
    const newStatuses: Record<string, TestStatus> = {};
    data.forEach((sprint: SprintDTO) => {
      sprint.tests.forEach((test: TestDTO) => {
        newStatuses[test.id] = test.status;
      });
    });
    setTestStatuses(newStatuses);
  };

  const handleViewSprint = (sprint: SprintDTO) => {
    setSelectedSprintForView(sprint);
    setExpandedSprints(new Set([sprint.id]));
  };

  // Componente de card para teste em mobile
  const TestMobileCard = ({ test, sprintId }: { test: TestDTO; sprintId: string }) => (
    <Card className="mb-3 p-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold">{test.code}</span>
            <Badge className={testTypeMeta[test.type]?.className || 'bg-gray-500 text-white'}>
              {testTypeMeta[test.type]?.emoji || '📝'} {test.type}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCurrentSprintId(sprintId);
              setSelectedTest(test);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
        
        <div>
          <p className="font-medium text-sm">{test.title}</p>
          <p className="text-xs text-muted-foreground mt-1">{test.scenario}</p>
        </div>
        
        <div>
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold">Esperado:</span> {test.expected}
          </p>
        </div>
        
        <div className="flex flex-col gap-2 pt-1">
          <div className="w-full">
            <Select
              value={testStatuses[test.id] || test.status}
              onValueChange={(value) => updateTestStatus(test.id, value as TestStatus)}
            >
              <SelectTrigger 
                className={`w-full border-none ${testStatusMeta[testStatuses[test.id] || test.status]?.className || 'bg-gray-500 text-white'}`}
              >
                <SelectValue>
                  <span className="flex items-center gap-2 text-xs">
                    {testStatusMeta[testStatuses[test.id] || test.status]?.emoji}
                    {testStatusMeta[testStatuses[test.id] || test.status]?.label}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {testStatusOrder.map((status) => (
                  <SelectItem key={status} value={status}>
                    <span className={testStatusMeta[status]?.className + ' px-2 py-1 rounded text-xs'}>
                      {testStatusMeta[status]?.emoji} {testStatusMeta[status]?.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Responsável com nome em preto */}
          <div className="text-xs pt-1 border-t border-border/50">
            {test.assignee ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-black dark:text-white">Responsável:</span>
                <span className="font-medium text-black dark:text-white">{test.assignee.name}</span>
                <span className="text-muted-foreground">(@{test.assignee.handle})</span>
              </div>
            ) : (
              <span className="text-muted-foreground">Não atribuído</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                  {expandedSprints.has(sprint.id) ? <ChevronDown className="h-5 w-5 shrink-0" /> : <ChevronRight className="h-5 w-5 shrink-0" />}
                  <CardTitle className="text-base sm:text-lg">
                    Sprint #{sprint.number}: {sprint.title}
                  </CardTitle>
                  <Badge className={getSprintStatusColor(sprint.status)}>
                    {sprint.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2 ml-6 sm:ml-0">
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Dias {sprint.dayStart} - {sprint.dayEnd}
                  </div>
                  {sprint.expectedBugs !== null && (
                    <Badge variant="outline" className="text-xs">Bugs: {sprint.expectedBugs}</Badge>
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
                  <>
                    {/* Versão Desktop - Tabela */}
                    <div className="hidden md:block rounded-md border">
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
                              <TableCell>
                                <Badge className={testTypeMeta[test.type]?.className || 'bg-gray-500 text-white'}>
                                  {testTypeMeta[test.type]?.emoji || '📝'} {test.type}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <p className="font-medium">{test.title}</p>
                                <p className="text-xs text-muted-foreground">{test.scenario}</p>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">{test.expected}</TableCell>
                              <TableCell>
                                <Select
                                  value={testStatuses[test.id] || test.status}
                                  onValueChange={(value) => updateTestStatus(test.id, value as TestStatus)}
                                >
                                  <SelectTrigger 
                                    className={`w-[140px] border-none ${testStatusMeta[testStatuses[test.id] || test.status]?.className || 'bg-gray-500 text-white'}`}
                                  >
                                    <SelectValue>
                                      <span className="flex items-center gap-2">
                                        {testStatusMeta[testStatuses[test.id] || test.status]?.emoji}
                                        {testStatusMeta[testStatuses[test.id] || test.status]?.label}
                                      </span>
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {testStatusOrder.map((status) => (
                                      <SelectItem key={status} value={status}>
                                        <span className={testStatusMeta[status]?.className + ' px-2 py-1 rounded w-full text-center'}>
                                          {testStatusMeta[status]?.emoji} {testStatusMeta[status]?.label}
                                        </span>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
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

                    {/* Versão Mobile - Cards */}
                    <div className="block md:hidden">
                      {sprint.tests.map((test) => (
                        <TestMobileCard key={test.id} test={test} sprintId={sprint.id} />
                      ))}
                    </div>
                  </>
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