
// src/components/content/GroupingSwitcher.tsx
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Building, Store } from 'lucide-react';
import type { GroupingMode } from '@/lib/types';

interface GroupingSwitcherProps {
    groupingMode: GroupingMode;
    setGroupingMode: (mode: GroupingMode) => void;
}

export function GroupingSwitcher({ groupingMode, setGroupingMode }: GroupingSwitcherProps) {
    return (
        <Tabs value={groupingMode} onValueChange={(value) => setGroupingMode(value as GroupingMode)}>
            <TabsList className="grid grid-cols-2">
                <TabsTrigger value="company" className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    <span>Company</span>
                </TabsTrigger>
                <TabsTrigger value="store" className="flex items-center gap-2">
                    <Store className="w-4 h-4" />
                    <span>Store</span>
                </TabsTrigger>
            </TabsList>
        </Tabs>
    );
}
