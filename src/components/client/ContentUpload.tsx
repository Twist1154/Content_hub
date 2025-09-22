
'use client';

import {useCallback, useEffect, useState} from 'react';
import {useDropzone} from 'react-dropzone';
import {createClient} from '@/lib/supabase/client';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import { Tooltip } from '@/components/ui/tooltip';
import {Card, CardContent, CardHeader} from '@/components/ui/card';
import {File, Upload} from 'lucide-react';
import type {ContentData} from '@/app/actions/data-actions';
import {insertContent} from '@/app/actions/data-actions';
import {LoadingSpinner} from '@/components/ui/loading-spinner';
import {cn} from '@/lib/utils';
import type { ContentItem } from '@/lib/types';
import { notifyAdminsOfContentUpload } from '@/app/actions/notification-actions';

// The store type is part of ContentItem, but let's define a simple one for props
interface StoreType {
    id: string;
    name: string;
    brand_company: string;
}

interface ContentUploadProps {
    userId: string;
    stores: StoreType[];
    onSuccess?: () => void;
}

export function ContentUpload({userId, stores, onSuccess}: ContentUploadProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        start_date: '',
        end_date: '',
        recurrence_type: 'none' as 'none' | 'daily' | 'weekly' | 'monthly' | 'custom',
        recurrence_days: [] as string[],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>(stores && stores.length > 0 ? [stores[0].id] : []);

    useEffect(() => {
        if (stores && stores.length > 0 && selectedStoreIds.length === 0) {
            setSelectedStoreIds([stores[0].id]);
        }
    }, [stores, selectedStoreIds]);

    const supabase = createClient();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles(prev => [...prev, ...acceptedFiles]);
    }, []);

    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
            'video/*': ['.mp4', '.mov', '.avi'],
            'audio/*': ['.mp3', '.wav', '.aac'],
        },
        multiple: true,
    });

    const getFileType = (file: File): 'image' | 'video' | 'audio' => {
        if (file.type.startsWith('image/')) return 'image';
        if (file.type.startsWith('video/')) return 'video';
        return 'audio';
    };

    const uploadFile = async (file: File) => {
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const filePath = `public/${userId}/${fileName}`;

        const {error: uploadError} = await supabase.storage
            .from('files')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const {data: {publicUrl}} = supabase.storage
            .from('files')
            .getPublicUrl(filePath);

        return publicUrl;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (files.length === 0) {
            setError('Please select at least one file');
            return;
        }
        if (!selectedStoreIds || selectedStoreIds.length === 0) {
            setError('Please select at least one store');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const uploadedItems: { title: string, storeId: string }[] = [];
            for (const file of files) {
                const fileUrl = await uploadFile(file);

                for (const storeId of selectedStoreIds) {
                    const contentData: ContentData = {
                        store_id: storeId,
                        user_id: userId,
                        title: formData.title || file.name,
                        type: getFileType(file),
                        file_url: fileUrl,
                        file_size: file.size,
                        start_date: formData.start_date || null,
                        end_date: formData.end_date || null,
                        recurrence_type: formData.recurrence_type,
                        recurrence_days: formData.recurrence_days.length > 0 ? formData.recurrence_days : null,
                    };

                    const result = await insertContent(contentData);
                    if (!result.success) {
                        throw new Error(result.error);
                    }
                     uploadedItems.push({ title: contentData.title, storeId: storeId });
                }
            }

            // After all uploads are successful, trigger the notification
            if (uploadedItems.length > 0) {
                await notifyAdminsOfContentUpload({
                    userId: userId,
                    items: uploadedItems,
                });
            }

            setFiles([]);
            setFormData({
                title: '',
                start_date: '',
                end_date: '',
                recurrence_type: 'none',
                recurrence_days: [],
            });

            if (onSuccess) onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRecurrenceDayToggle = (day: string) => {
        setFormData(prev => ({
            ...prev,
            recurrence_days: prev.recurrence_days.includes(day)
                ? prev.recurrence_days.filter(d => d !== day)
                : [...prev.recurrence_days, day]
        }));
    };

    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader/>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div
                        {...getRootProps()}
                        className={cn(
                            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                            isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                        )}
                    >
                        <input {...getInputProps()} />
                        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground"/>
                        {isDragActive ? (
                            <p className="text-primary">Drop the files here...</p>
                        ) : (
                            <div>
                                <p className="mb-2 text-foreground">Drag & drop files here, or click to select</p>
                                <p className="text-sm text-muted-foreground">Images, videos, and audio files supported</p>
                            </div>
                        )}
                    </div>

                    {files.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="font-medium text-foreground">Selected Files:</h4>
                            {files.map((file, index) => (
                                <div key={index}
                                     className="flex items-center gap-2 p-2 bg-muted/50 rounded border border-border">
                                    <File className="w-4 h-4 text-muted-foreground"/>
                                    <span className="text-sm text-foreground">{file.name}</span>
                                    <span
                                        className="text-xs text-muted-foreground">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <Input
                        placeholder="Content Title (optional)"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                    />

                    <div>
                        <label className="block text-sm font-medium mb-2 text-muted-foreground">Stores</label>
                        {(stores?.length ?? 0) === 0 ? (
                            <div className="text-sm text-destructive mb-2">No stores found for your account. Please create a store before uploading content.</div>
                        ) : null}
                        <Tooltip content={stores?.length === 0 ? "No stores available" : "Select one or more stores this content belongs to (Ctrl/Cmd+Click)"}>
                             <select
                                multiple
                                className={cn('flex h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50')}
                                value={selectedStoreIds}
                                onChange={(e) => {
                                    const values = Array.from((e.target as HTMLSelectElement).selectedOptions).map(o => o.value);
                                    setSelectedStoreIds(values);
                                }}
                                disabled={stores?.length === 0}
                            >
                                {(stores ?? []).map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </Tooltip>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-muted-foreground">Start Date</label>
                            <Input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData(prev => ({...prev, start_date: e.target.value}))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-muted-foreground">End Date</label>
                            <Input
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => setFormData(prev => ({...prev, end_date: e.target.value}))}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-muted-foreground">Recurrence</label>
                        <Tooltip content="Set how often this content should be displayed">
                            <select
                                className={cn('flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1')}
                                value={formData.recurrence_type}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    recurrence_type: e.target.value as any,
                                    recurrence_days: []
                                }))}
                            >
                                <option value="none">No Recurrence</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="custom">Custom Days</option>
                            </select>
                        </Tooltip>
                    </div>

                    {formData.recurrence_type === 'custom' && (
                        <div>
                            <label className="block text-sm font-medium mb-2 text-muted-foreground">Select Days</label>
                             <Tooltip content="Choose specific days of the week for content display">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {weekDays.map(day => (
                                        <label key={day} className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.recurrence_days.includes(day)}
                                                onChange={() => handleRecurrenceDayToggle(day)}
                                                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                            />
                                            <span className="text-sm text-foreground">{day}</span>
                                        </label>
                                    ))}
                                </div>
                            </Tooltip>
                        </div>
                    )}

                    {error && (
                        <div className="text-sm text-destructive">{error}</div>
                    )}

                    <Tooltip
                        content={
                            (stores?.length ?? 0) === 0
                                ? "No stores available"
                                : (selectedStoreIds?.length ?? 0) === 0
                                    ? "Please select at least one store"
                                    : files.length === 0
                                        ? "Please select files to upload"
                                        : "Upload your selected content"
                        }>
                        <Button
                            type="submit"
                            className="w-full disabled:opacity-70"
                            disabled={loading || files.length === 0 || (stores?.length ?? 0) === 0 || (selectedStoreIds?.length ?? 0) === 0}
                            variant="default"
                            size="lg"
                        >
                            {loading ? <LoadingSpinner text="Uploading..."/> : (
                                <>
                                    <Upload className="w-4 h-4 mr-2"/>
                                    Upload Content
                                </>
                            )}
                        </Button>
                    </Tooltip>
                </form>
            </CardContent>
        </Card>
    );
}
