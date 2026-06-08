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
        {/* Grid responsiva - todos na mesma linha no mobile e desktop */}
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          {/* Busca geral */}
          <div className="space-y-1 md:space-y-2">
            <Label className="text-xs md:text-sm">Busca</Label>
            <div className="relative">
              <Search className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={filters.searchTerm}
                onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value })}
                className="pl-7 md:pl-9 text-xs md:text-sm h-8 md:h-10"
              />
            </div>
          </div>

          {/* Tipo de Teste */}
          <div className="space-y-1 md:space-y-2">
            <Label className="text-xs md:text-sm">Tipo</Label>
            <Select
              value={filters.testType}
              onValueChange={(value) => onFiltersChange({ ...filters, testType: value ?? 'ALL' })}
            >
              <SelectTrigger className="h-8 md:h-10 text-xs md:text-sm">
                <SelectValue placeholder="Todos" />
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
          <div className="space-y-1 md:space-y-2">
            <Label className="text-xs md:text-sm">Responsavel</Label>
            <Select
              value={filters.assignee}
              onValueChange={(value) => onFiltersChange({ ...filters, assignee: value ?? 'ALL' })}
            >
              <SelectTrigger className="h-8 md:h-10 text-xs md:text-sm">
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
        </div>

        {/* Botão limpar filtros abaixo dos filtros */}
        {hasActiveFilters() && (
          <div className="mt-3 md:mt-4">
            <Button variant="outline" onClick={clearFilters} size="sm" className="w-full md:w-auto text-xs md:text-sm">
              <X className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              Limpar filtros
            </Button>
          </div>
        )}

        {/* Resumo dos filtros ativos */}
        {hasActiveFilters() && (
          <div className="flex flex-wrap gap-1 md:gap-2 mt-3 md:mt-4 pt-3 md:pt-4 border-t">
            <span className="text-xs md:text-sm text-muted-foreground">Filtros ativos:</span>
            {filters.showOnly !== 'ALL' && (
              <Badge variant="secondary" className="text-xs">
                {filters.showOnly === 'SPRINTS_ONLY' ? 'Apenas Sprints' : 'Apenas Testes'}
              </Badge>
            )}
            {filters.sprintStatus !== 'ALL' && (
              <Badge variant="secondary" className="text-xs">Sprint: {filters.sprintStatus}</Badge>
            )}
            {filters.testStatus !== 'ALL' && (
              <Badge variant="secondary" className="text-xs">Teste: {filters.testStatus}</Badge>
            )}
            {filters.testType !== 'ALL' && (
              <Badge variant="secondary" className="text-xs">Tipo: {filters.testType}</Badge>
            )}
            {filters.assignee !== 'ALL' && filters.assignee !== 'UNASSIGNED' && (
              <Badge variant="secondary" className="text-xs">
                Resp.: {users.find(u => u.id === filters.assignee)?.name?.split(' ')[0]}
              </Badge>
            )}
            {filters.assignee === 'UNASSIGNED' && (
              <Badge variant="secondary" className="text-xs">Não atribuído</Badge>
            )}
            {filters.searchTerm && (
              <Badge variant="secondary" className="text-xs">Busca: {filters.searchTerm}</Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}