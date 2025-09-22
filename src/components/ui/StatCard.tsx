// components/ui/StatCard.tsx
import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    icon: LucideIcon;
    value: string | number;
    label: string;
    iconColorClass?: string;
}

export function StatCard({ icon: Icon, value, label, iconColorClass }: StatCardProps) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    <Icon className={`w-8 h-8 ${iconColorClass || 'text-primary'}`} />
                    <div>
                        <p className="text-2xl font-bold text-foreground">{value}</p>
                        <p className="text-sm text-muted-foreground">{label}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
