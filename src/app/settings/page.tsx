
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Bell, Eye, Download, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/Switch';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { BackButton } from '@/components/ui/BackButton';
import { Breadcrumb } from '@/components/ui/Breadcrumb';

// A component for each settings section
const SettingsSection = ({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            {children}
        </CardContent>
    </Card>
);

// A component for a setting with a toggle switch
const ToggleSetting = ({ title, description, defaultChecked = false, id }: { title: string, description: string, defaultChecked?: boolean, id: string }) => (
    <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="space-y-0.5">
            <Label htmlFor={id} className="text-base">{title}</Label>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Switch
            id={id}
            defaultChecked={defaultChecked}
        />
    </div>
);


// A component for a setting with a dropdown select
const SelectSetting = ({ label, children, placeholder }: { label: string, children: React.ReactNode, placeholder: string }) => (
    <div>
        <Label className="block text-sm font-medium text-foreground mb-2">{label}</Label>
        <Select>
            <SelectTrigger>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {children}
            </SelectContent>
        </Select>
    </div>
);

export default async function SettingsPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/auth/client/signin');
    }

    if (!user.profile) {
        // Handle case where profile is unexpectedly null
        redirect('/auth/client/signin');
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="mb-6">
                        <BackButton href="/dashboard" label="Back to Dashboard" />
                        <Breadcrumb
                            items={[
                                { label: 'Dashboard', href: '/dashboard' },
                                { label: 'Settings', current: true }
                            ]}
                            className="mt-2"
                        />
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
                        <p className="text-muted-foreground">Customize your dashboard experience and preferences</p>
                    </div>

                    <SettingsSection icon={Bell} title="Notifications">
                        <ToggleSetting
                            id="email-notifications"
                            title="Email Notifications"
                            description="Receive updates about your content and campaigns."
                            defaultChecked
                        />
                        <ToggleSetting
                            id="campaign-reminders"
                            title="Campaign Reminders"
                            description="Get notified when campaigns are about to start or end."
                            defaultChecked
                        />
                        <ToggleSetting
                            id="weekly-reports"
                            title="Weekly Reports"
                            description="Receive weekly summaries of your content performance."
                        />
                    </SettingsSection>

                    <SettingsSection icon={Eye} title="Display Preferences">
                        <SelectSetting label="Default View Mode" placeholder="Select a default view">
                            <SelectItem value="grid">Grid View</SelectItem>
                            <SelectItem value="list">List View</SelectItem>
                        </SelectSetting>
                        <SelectSetting label="Items Per Page" placeholder="Select items per page">
                             <SelectItem value="12">12 items</SelectItem>
                             <SelectItem value="24">24 items</SelectItem>
                             <SelectItem value="48">48 items</SelectItem>
                        </SelectSetting>
                        <ToggleSetting
                            id="show-file-sizes"
                            title="Show File Sizes"
                            description="Display file sizes in content listings."
                            defaultChecked
                        />
                    </SettingsSection>

                    <SettingsSection icon={Download} title="Data Management">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button variant="outline" className="flex-1">
                                <Download className="w-4 h-4 mr-2" />
                                Export All Data
                            </Button>
                            <Button variant="outline" className="flex-1">
                                <Download className="w-4 h-4 mr-2" />
                                Download Content List
                            </Button>
                        </div>
                        <div className="pt-4 border-t border-border">
                            <Button variant="destructive" className="w-full">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Clear All Content
                            </Button>
                            <p className="text-xs text-muted-foreground mt-2 text-center">
                                This will permanently delete all your uploaded content. This action cannot be undone.
                            </p>
                        </div>
                    </SettingsSection>

                    <div className="flex justify-end pt-4 border-t border-border">
                        <Button>
                            Save Settings
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
