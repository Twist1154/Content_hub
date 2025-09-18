
// app/privacy/page.tsx

import { BackButton } from '@/components/ui/back-button';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Mail, Database, Users, Lock, FileText } from 'lucide-react';

const PolicySection = ({ icon: Icon, title, children, iconColorClass = 'text-primary' }: { icon: React.ElementType, title: string, children: React.ReactNode, iconColorClass?: string }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${iconColorClass}`} />
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground prose-p:my-2 prose-ul:my-2 prose-strong:text-foreground">
            {children}
        </CardContent>
    </Card>
);

const InfoBox = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'success' | 'destructive' }) => {
    const variants = {
        default: 'bg-primary/10 border-primary/20 text-primary',
        success: 'bg-chart-2/10 border-chart-2/20 text-chart-2',
        destructive: 'bg-destructive/10 border-destructive/20 text-destructive',
    };
    return (
        <div className={`rounded-lg border p-4 not-prose ${variants[variant]}`}>
            {children}
        </div>
    );
};

const DataListItem = ({
                      title,
                      description,
                      items,
                      borderColorClass = 'border-primary' }: { title: string, description: string, items: string[], borderColorClass?: string }) => (
    <div className={`border-l-4 ${borderColorClass} pl-4`}>
        <h4 className="font-semibold text-foreground mb-2">{title}</h4>
        <p className="text-muted-foreground mb-2">{description}</p>
        <ul className="list-disc list-inside space-y-1">
            {items.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
    </div>
);

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto max-w-4xl py-8 px-4">
                <div className="mb-6">
                    <BackButton href="/" label="Back to home" />
                    <Breadcrumb
                        items={[
                            { label: 'Privacy Policy', current: true }
                        ]}
                        className="mt-2"
                    />
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
                    <p className="text-muted-foreground">HapoHub</p>
                    <p className="text-sm text-muted-foreground mt-2">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                <div className="space-y-6">
                    <PolicySection
                        icon={Shield}
                        title="Introduction"
                    >
                            <p>
                                At HapoHub, we are committed to protecting your privacy and ensuring the security of your personal information.
                                This Privacy Policy explains how we collect, use, store, and protect your data when you use the HapoHub
                                (the &quot;Service&quot;). By using our Service, you agree to the collection and use of information in accordance with this policy.
                            </p>
                    </PolicySection>

                    <PolicySection
                        icon={Users}
                        title="Data Controller"
                        iconColorClass="text-chart-2"
                    >
                        <p><strong>HapoHub</strong> is the data controller responsible for your personal data collected through the HapoHub Service.</p>
                        <InfoBox>
                            <div className="text-primary">
                                    <strong className="font-semibold">Contact Information:</strong><br />
                                    For privacy-related inquiries, please contact us at: <strong>support@hapohub.example</strong>
                            </div>
                        </InfoBox>
                    </PolicySection>

                    <PolicySection
                        icon={Database}
                        title="Data We Collect"
                        iconColorClass="text-chart-3"
                    >
                            <p className="mb-4">We collect the following types of information:</p>
                        <div className="space-y-4 not-prose">
                            <DataListItem
                                title="1. Authentication Data"
                                description="When you sign in, we receive:"
                                items={[
                                    'Name (as provided by your identity provider)',
                                    'Email address',
                                    'Profile picture (if available)',
                                    'Account ID (for authentication purposes)'
                                ]}
                            />
                            <DataListItem
                                title="2. Business Information"
                                description="Information you provide about your business:"
                                items={[
                                    'Company name and brand information',
                                    'Store/location details including names and addresses'
                                ]}
                                borderColorClass="border-chart-2"
                            />
                            <DataListItem
                                title="3. Content and Metadata"
                                description="Content you upload to our platform:"
                                items={['Images, videos, and other files',
                                    'Content titles and descriptions',
                                    'File metadata (size, type, upload timestamps)',
                                ]}
                                borderColorClass="border-chart-4"
                            />
                            <DataListItem
                                title="4. Technical Information"
                                description="Automatically collected technical data:"
                                items={[
                                    'User session information and authentication tokens',
                                    'User role assignments (client or admin)',
                                    'Account creation and last activity timestamps',
                                    'System logs for security and performance monitoring'
                                ]}
                                borderColorClass="border-chart-1"
                            />
                                </div>
                    </PolicySection>

                    <PolicySection
                        icon={FileText}
                        title="How We Use Your Data"
                        iconColorClass="text-chart-5"
                    >
                        <p>We use your personal data for the following specific purposes:</p>
                        <div className="space-y-4 my-4 not-prose">
                            <div className="bg-muted/50 rounded-lg p-4">
                                <h4 className="font-semibold text-foreground mb-2">Authentication and Account Management</h4>
                                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                        <li>To authenticate users and manage secure sessions</li>
                                        <li>To assign and manage user roles (client or admin) within the system</li>
                                        <li>To provide personalized access to your content and dashboard</li>
                                    </ul>
                                </div>
                            <div className="bg-muted/50 rounded-lg p-4">
                                <h4 className="font-semibold text-foreground mb-2">Content Management and Organization</h4>
                                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                        <li>To associate uploaded content with the correct client and store locations</li>
                                        <li>To enable our administrators to organize and manage content effectively</li>
                                        <li>To provide content upload and sharing functionality</li>
                                    </ul>
                                </div>
                            <div className="bg-muted/50 rounded-lg p-4">
                                <h4 className="font-semibold text-foreground mb-2">Service Delivery and Support</h4>
                                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                        <li>To provide technical support and troubleshoot issues</li>
                                        <li>To maintain and improve the security and performance of our platform</li>
                                        <li>To communicate important service updates and changes</li>
                                    </ul>
                                </div>
                            </div>
                        <InfoBox variant="success">
                             <h4 className="font-semibold mb-2">Important Commitment:</h4>
                            <p><strong>We do not sell your personal data to third parties or use it for targeted advertising.</strong> Your data is used exclusively to provide and improve our services.</p>
                        </InfoBox>
                    </PolicySection>


                        <PolicySection
                            icon={Users}
                            title="Your Rights & Data Deletion"
                            iconColorClass="text-destructive"
                        >
                         <p>You have the following rights regarding your personal data:</p>
                        <div className="space-y-4 my-4 not-prose">
                            <DataListItem
                                title="Right to Access"
                                    description="You can access your data at any time."
                                items={['You can access and review your personal data through your account dashboard at any time.']}
                            />
                            <DataListItem
                                title="Right to Rectification"
                                    description="You can correct your data."
                                items={[
                                    'You can update and correct your business information and profile details through your account settings.'
                                ]}
                                borderColorClass="border-chart-2"
                            />
                            <DataListItem
                                title="Right to Data Portability"
                                    description="You can download your data."
                                items={[
                                    'You can download your uploaded content at any time.'
                                ]}
                                borderColorClass="border-chart-4"
                            />
                                <div className="border-l-4 border-destructive pl-4">
                                <h4 className="font-semibold text-foreground mb-2">Right to Deletion</h4>
                                <p className="text-muted-foreground mb-2">You have the right to request deletion of your account and all associated data.</p>
                                <InfoBox variant="destructive">
                                    <h5 className="font-semibold mb-2">How to Request Data Deletion:</h5>
                                    <ol className="list-decimal list-inside space-y-1">
                                            <li>Send an email to <strong>support@hapohub.example</strong></li>
                                            <li>Include your registered email address and account details</li>
                                            <li>Specify &quot;Data Deletion Request&quot; in the subject line</li>
                                            <li>We will process your request within 30 days and confirm completion</li>
                                        </ol>
                                    <p className="text-sm mt-2"><strong>Note:</strong> Data deletion is permanent and cannot be undone. All your uploaded content,
                                        business information, and account data will be permanently removed from our systems.</p>
                                </InfoBox>
                                </div>
                        </div>
                    </PolicySection>

                    <PolicySection
                        icon={Lock}
                        title="Security Measures"
                        iconColorClass="text-yellow-500">
                        <p>We implement comprehensive security measures to protect your data:</p>
                        <div className="grid md:grid-cols-2 gap-4 not-prose mt-4">
                            <div className="bg-muted/50 rounded-lg p-4">
                                <h4 className="font-semibold text-foreground mb-2">Access Control</h4>
                                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                        <li>Role-based access control (RBAC)</li>
                                        <li>Secure authentication (password, magic link, OAuth)</li>
                                        <li>Session management and automatic timeouts</li>
                                    </ul>
                                </div>
                            <div className="bg-muted/50 rounded-lg p-4">
                                <h4 className="font-semibold text-foreground mb-2">Database Security</h4>
                                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                        <li>Row Level Security (RLS) policies</li>
                                        <li>Encrypted data transmission (HTTPS/TLS)</li>
                                        <li>Regular security audits and monitoring</li>
                                    </ul>
                                </div>
                            <div className="bg-muted/50 rounded-lg p-4">
                                <h4 className="font-semibold text-foreground mb-2">File Storage Security</h4>
                                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                        <li>Secure file upload and storage with access policies</li>
                                        <li>User-specific access permissions</li>
                                        <li>Automated backup and recovery systems</li>
                                    </ul>
                                </div>
                            <div className="bg-muted/50 rounded-lg p-4">
                                <h4 className="font-semibold text-foreground mb-2">Monitoring & Compliance</h4>
                                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                        <li>Continuous security monitoring</li>
                                        <li>Regular vulnerability assessments</li>
                                        <li>Compliance with industry standards</li>
                                    </ul>
                                </div>
                            </div>
                    </PolicySection>

                    <PolicySection
                        icon={FileText}
                        title="Data Retention"
                        iconColorClass="text-muted-foreground">
                        <p>We retain your personal data only as long as necessary:</p>
                            <ul className="list-disc list-inside ">
                                <li><strong>Account Data:</strong> Retained while your account is active and for 90 days after account deletion for backup purposes.</li>
                                <li><strong>Uploaded Files:</strong> Retained while your account is active or until you delete them.</li>
                                <li><strong>System Logs:</strong> Retained for 12 months for security and performance monitoring purposes.</li>
                            <li><strong>Business Information:</strong> Retained while your account is active to maintain service functionality.</li>
                            </ul>
                    </PolicySection>

                    <PolicySection
                        icon={Shield}
                        title="Changes to This Privacy Policy"
                        iconColorClass="text-chart-3"
                    >
                        <p>
                                We may update this Privacy Policy from time to time to reflect changes in our practices or for legal,
                                operational, or regulatory reasons. We will notify you of any material changes by posting the new Privacy Policy
                                on this page and updating the &quot;Last Updated&quot; date. We encourage you to review this Privacy Policy periodically
                                to stay informed about how we protect your information.
                            </p>
                    </PolicySection>

                    <PolicySection
                        icon={Mail}
                        title="Contact Us"
                    >
                        <InfoBox>
                            <h4 className="font-semibold text-primary mb-2">Privacy-Related Inquiries</h4>
                            <p className="text-primary/90 mb-2">
                                    If you have any questions about this Privacy Policy, your data rights, or our data practices, please contact us:
                                </p>
                            <div className="space-y-1 text-primary/80">
                                <p><strong>Email:</strong><a href="mailto:support@hapohub.example" className="underline"> support@hapohub.example</a></p>
                                    <p><strong>Subject Line:</strong> Privacy Policy Inquiry - HapoHub</p>
                                    <p><strong>Response Time:</strong> We aim to respond to all privacy inquiries within 5 business days.</p>
                                </div>
                        </InfoBox>
                    </PolicySection>
                </div>

                {/* Footer */}
                <div className="text-center mt-12 pt-8 border-t border-border">
                    <p className="text-muted-foreground text-sm">
                        © {new Date().getFullYear()} HapoHub. All rights reserved. |
                        <span className="ml-2">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

