'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export type FilterOptions = {
  searchTerm: string;
  sprintStatus: string;
  testStatus: string;
  testType: string;
  assignee: string;
  showOnly: 'ALL' | 'SPRINTS_ONLY' | 'TESTS_ONLY';
};

interface SprintsFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  users: Array<{ id: string; name: string; handle: string }>;
}

export function SprintsFilters({ filters, onFiltersChange, users }: SprintsFiltersProps) {
  const clearFilters = () => {
    onFiltersChange({
      searchTerm: '',
      sprintStatus: 'ALL',
      testStatus: 'ALL',
      testType: 'ALL',
      assignee: 'ALL',
      showOnly: 'ALL',
    });
  };

  const hasActiveFilters = () => {
    return filters.searchTerm !== '' ||
      filters.sprintStatus !== 'ALL' ||
      filters.testStatus !== 'ALL' ||
      filters.testType !== 'ALL' ||
      filters.assignee !== 'ALL' ||
      filters.showOnly !== 'ALL';
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Busca geral */}
          <div className="space-y-2">
            <Label>Busca</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar sprints ou testes..."
                value={filters.searchTerm}
                onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>

          {/* Tipo de visualização */}
          <div className="space-y-2">
            <Label>Visualizar</Label>
            <Select
              value={filters.showOnly}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, showOnly: value as FilterOptions['showOnly'] })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos (Sprints + Testes)</SelectItem>
                <SelectItem value="SPRINTS_ONLY">Apenas Sprints</SelectItem>
                <SelectItem value="TESTS_ONLY">Apenas Testes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro de Status da Sprint */}
          <div className="space-y-2">
            <Label>Status da Sprint</Label>
            <Select
              value={filters.sprintStatus}
              onValueChange={(value) => onFiltersChange({ ...filters, sprintStatus: value ?? 'ALL' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="NAO_INICIADO">Não iniciado</SelectItem>
                <SelectItem value="EM_ANDAMENTO">Em andamento</SelectItem>
                <SelectItem value="CONCLUIDO">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro de Status do Teste */}
          <div className="space-y-2">
            <Label>Status do Teste</Label>
            <Select
              value={filters.testStatus}
              onValueChange={(value) => onFiltersChange({ ...filters, testStatus: value ?? 'ALL' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="PENDENTE">Pendente</SelectItem>
                <SelectItem value="EXECUTANDO">Executando</SelectItem>
                <SelectItem value="PASSOU">Passou</SelectItem>
                <SelectItem value="FALHOU">Falhou</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro de Tipo de Teste */}
          <div className="space-y-2">
            <Label>Tipo de Teste</Label>
            <Select
              value={filters.testType}
              onValueChange={(value) => onFiltersChange({ ...filters, testType: value ?? 'ALL' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="SEGURANCA">Segurança</SelectItem>
                <SelectItem value="UNITARIO">Unitário</SelectItem>
                <SelectItem value="INTEGRACAO">Integração</SelectItem>
                <SelectItem value="E2E">E2E</SelectItem>
                <SelectItem value="USABILIDADE">Usabilidade</SelectItem>
                <SelectItem value="PERFORMANCE">Performance</SelectItem>
                <SelectItem value="UI_UX">UI/UX</SelectItem>
                <SelectItem value="ACESSIBILIDADE">Acessibilidade</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro de Responsável */}
          <div className="space-y-2">
            <Label>Responsável</Label>
            <Select
              value={filters.assignee}
              onValueChange={(value) => onFiltersChange({ ...filters, assignee: value ?? 'ALL' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="UNASSIGNED">Não atribuído</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} (@{user.handle})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Botão limpar filtros */}
          {hasActiveFilters() && (
            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                <X className="h-4 w-4 mr-2" />
                Limpar filtros
              </Button>
            </div>
          )}
        </div>

        {/* Resumo dos filtros ativos */}
        {hasActiveFilters() && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
            <span className="text-sm text-muted-foreground">Filtros ativos:</span>
            {filters.showOnly !== 'ALL' && (
              <Badge variant="secondary">
                {filters.showOnly === 'SPRINTS_ONLY' ? 'Apenas Sprints' : 'Apenas Testes'}
              </Badge>
            )}
            {filters.sprintStatus !== 'ALL' && (
              <Badge variant="secondary">Sprint: {filters.sprintStatus}</Badge>
            )}
            {filters.testStatus !== 'ALL' && (
              <Badge variant="secondary">Teste: {filters.testStatus}</Badge>
            )}
            {filters.testType !== 'ALL' && (
              <Badge variant="secondary">Tipo: {filters.testType}</Badge>
            )}
            {filters.assignee !== 'ALL' && filters.assignee !== 'UNASSIGNED' && (
              <Badge variant="secondary">
                Responsável: {users.find(u => u.id === filters.assignee)?.name}
              </Badge>
            )}
            {filters.assignee === 'UNASSIGNED' && (
              <Badge variant="secondary">Não atribuído</Badge>
            )}
            {filters.searchTerm && (
              <Badge variant="secondary">Busca: {filters.searchTerm}</Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}