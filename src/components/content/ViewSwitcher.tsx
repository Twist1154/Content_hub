
// src/components/content/ViewSwitcher.tsx
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, List } from 'lucide-react';
import type { ViewMode } from '@/lib/types';

interface ViewSwitcherProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export function ViewSwitcher({ viewMode, setViewMode }: ViewSwitcherProps) {
  return (
    <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
      <TabsList className="grid grid-cols-2">
        <TabsTrigger value="grid">
            <LayoutGrid className="w-4 h-4" />
        </TabsTrigger>
        <TabsTrigger value="list">
            <List className="w-4 h-4" />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
