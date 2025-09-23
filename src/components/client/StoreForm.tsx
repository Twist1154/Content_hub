// components/client/StoreForm.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { Store, Building, MapPin } from 'lucide-react';
import { addStore } from '@/app/actions/data-actions';
import type { StoreData } from '@/app/actions/data-actions';
import { FormField } from '@/components/ui/form-field';

interface StoreFormProps {
    userId: string;
    onSuccess?: () => void;
}

export function StoreForm({ userId, onSuccess }: StoreFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        brand_company: '',
        address: ''
    });
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const storeData: StoreData = { ...formData };
            const result = await addStore(storeData, userId);

            if (!result.success) {
                throw new Error(result.error);
            }

            toast({
                title: 'Store Added!',
                description: 'Your new store has been saved successfully.'
            });

            if (onSuccess) {
                onSuccess();
            }

        } catch (err: any) {
            toast({
                variant: 'destructive',
                title: 'Failed to Add Store',
                description: err.message || 'An unexpected error occurred.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: keyof StoreData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 border-t border-border pt-6">
            <FormField label="Store Name" icon={Store}>
                <Input
                    placeholder="e.g., Main Street Branch"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                    className="pl-10"
                />
            </FormField>
             <FormField label="Brand/Company" icon={Building}>
                <Input
                    placeholder="e.g., Hapo Group"
                    value={formData.brand_company}
                    onChange={(e) => handleChange('brand_company', e.target.value)}
                    required
                    className="pl-10"
                />
            </FormField>
             <FormField label="Store Address" icon={MapPin}>
                <Input
                    placeholder="123 Main St, Anytown, USA"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    required
                    className="pl-10"
                />
            </FormField>
            <Button
                type="submit"
                className="w-full"
                disabled={loading || !formData.name || !formData.brand_company || !formData.address}
            >
                {loading ? <LoadingSpinner size="sm" text="Saving..." /> : 'Add Store'}
            </Button>
        </form>
    );
}
