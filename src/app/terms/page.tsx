
// app/terms/page.tsx


import { BackButton } from '@/components/ui/BackButton';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FileText, Users, Shield, AlertTriangle, Mail } from 'lucide-react';

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

const InfoBox = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'destructive' }) => {
    const variants = {
        default: 'bg-primary/10 border-primary/20 text-primary',
        destructive: 'bg-destructive/10 border-destructive/20 text-destructive',
    };
    return <div className={`rounded-lg border p-4 not-prose ${variants[variant]}`}>{children}</div>;
};

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto max-w-4xl py-8 px-4">
                <div className="mb-6">
                    <BackButton href="/" label="Back to home" />
                    <Breadcrumb
                        items={[
                            { label: 'Terms of Service', current: true }
                        ]}
                        className="mt-2"
                    />
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
                    <p className="text-muted-foreground">HapoHub</p>
                    <p className="text-sm text-muted-foreground mt-2">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                <div className="space-y-6">
                    <PolicySection
                        icon={FileText}
                        title="Agreement to Terms"
                    >
                        <p>
                                Welcome to HapoHub. These Terms of Service (&quot;Terms&quot;) govern your use of our
                                content management platform and services. By accessing or using our service, you agree to be bound
                                by these Terms.
                            </p>
                        <InfoBox>
                            <p className="text-primary">
                                <strong>Important:</strong> If you do not agree to these Terms, please do not use our service.
                            </p>
                        </InfoBox>
                    </PolicySection>

                    <PolicySection
                        icon={Users}
                        title="Service Description"
                        iconColorClass="text-chart-2">
                        <p>The HapoHub is a digital content management platform that allows:</p>
                        <ul>
                                <li><strong>Clients</strong> to upload, organize, and schedule digital marketing content</li>
                                <li><strong>Administrators</strong> to manage, organize, and deploy client content across multiple locations</li>
                                <li>Secure storage and management of images, videos, and other files</li>
                                <li>Campaign scheduling and content organization tools</li>
                            </ul>
                    </PolicySection>

                    
                    <PolicySection
                        icon={Shield}
                        title="User Accounts and Responsibilities"
                        iconColorClass="text-chart-4"
                    >
                            <div className="space-y-4">
                                <div>
                                <h4 className="font-semibold text-foreground">Account Creation</h4>
                                <ul>
                                        <li>You must provide accurate and complete information when creating an account</li>
                                        <li>You are responsible for maintaining the security of your account credentials</li>
                                        <li>You must notify us immediately of any unauthorized use of your account</li>
                                    </ul>
                                </div>

                                <div>
                                <h4 className="font-semibold text-foreground">Acceptable Use</h4>
                                <p>You agree to use our service only for lawful purposes and in accordance with these Terms. You must not:</p>
                                <ul>
                                        <li>Upload content that infringes on intellectual property rights</li>
                                        <li>Share inappropriate, offensive, or illegal content</li>
                                        <li>Attempt to gain unauthorized access to our systems</li>
                                        <li>Use the service to distribute malware or harmful code</li>
                                        <li>Violate any applicable laws or regulations</li>
                                    </ul>
                                </div>
                            </div>
                    </PolicySection>

                    
                    <PolicySection icon={FileText} title="Content and Intellectual Property" iconColorClass="text-chart-5">
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-foreground">Your Content</h4>
                                <ul>
                                    <li>You retain ownership of all content you upload to our platform</li>
                                    <li>You grant us a limited license to store, process, and display your content as necessary to provide our services</li>
                                    <li>You are responsible for ensuring you have the right to upload and use all content</li>
                                    <li>You warrant that your content does not infringe on third-party rights</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-foreground">Our Platform</h4>
                                <p>
                                    The HapoHub platform, including its design, functionality, and underlying technology,
                                    is owned by HapoHub and protected by intellectual property laws.
                                </p>
                            </div>
                        </div>
                    </PolicySection>

                    
                    <PolicySection icon={AlertTriangle} title="Service Availability and Modifications" iconColorClass="text-yellow-500">
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-foreground">Service Availability</h4>
                                <p>
                                    While we strive to provide continuous service availability, we do not guarantee uninterrupted access.
                                    We may temporarily suspend service for maintenance, updates, or other operational reasons.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-foreground">Service Modifications</h4>
                                <p>
                                    We reserve the right to modify, update, or discontinue features of our service at any time.
                                    We will provide reasonable notice of significant changes that may affect your use of the service.
                                </p>
                            </div>
                        </div>
                    </PolicySection>

                    
                    <PolicySection icon={AlertTriangle} title="Limitation of Liability" iconColorClass="text-destructive">
                        <InfoBox variant="destructive">
                            <h4 className="font-semibold text-destructive mb-2">Important Legal Notice</h4>
                            <p className="text-destructive/90 text-sm">
                                    The following limitations apply to the maximum extent permitted by law.
                                </p>
                        </InfoBox>
                        <div className="space-y-4 mt-4">
                            <p><strong>Service &quot;As Is&quot;:</strong> Our service is provided &quot;as is&quot; without warranties of any kind,
                                either express or implied.</p>
                            <p><strong>Limitation of Damages:</strong> In no event shall HapoHub be liable for any indirect,
                                    incidental, special, consequential, or punitive damages, including but not limited to loss of profits,
                                data, or business opportunities.</p>
                            <p><strong>Maximum Liability:</strong> Our total liability for any claims related to the service
                                shall not exceed the amount paid by you for the service in the 12 months preceding the claim.</p>
                                </div>
                    </PolicySection>

                    
                    <PolicySection icon={AlertTriangle} title="Termination" iconColorClass="text-muted-foreground">
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-foreground">Termination by You</h4>
                                <p>
                                    You may terminate your account at any time by contacting us or using the account deletion
                                    features in your dashboard.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-foreground">Termination by Us</h4>
                                <p>We may terminate or suspend your account if you:</p>
                                <ul>
                                    <li>Violate these Terms of Service</li>
                                    <li>Engage in fraudulent or illegal activities</li>
                                    <li>Pose a security risk to our platform or other users</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-foreground">Effect of Termination</h4>
                                <p>
                                    Upon termination, your access to the service will cease, and we may delete your account
                                    and associated data in accordance with our Privacy Policy.
                                </p>
                            </div>
                        </div>
                    </PolicySection>

                    
                    <PolicySection icon={FileText} title="Changes to These Terms" iconColorClass="text-chart-1">
                        <p>
                            We may update these Terms from time to time to reflect changes in our service, legal requirements,
                            or business practices. We will notify you of material changes by:
                        </p>
                        <ul>
                            <li>Posting the updated Terms on our platform</li>
                            <li>Updating the &quot;Last Updated&quot; date</li>
                            <li>Sending email notifications for significant changes</li>
                        </ul>
                        <p>
                            Your continued use of the service after changes become effective constitutes acceptance of the new Terms.
                        </p>
                    </PolicySection>

                    
                    <PolicySection icon={Mail} title="Contact Information">
                        <InfoBox>
                            <h4 className="font-semibold text-primary mb-2">Questions About These Terms?</h4>
                            <p className="text-primary/90 mb-2">
                                    If you have any questions about these Terms of Service, please contact us:
                                </p>
                            <div className="space-y-1 text-primary/80">
                                    <p><strong>Email:</strong> <a href="mailto:support@hapohub.example" className="underline">support@hapohub.example</a></p>
                                    <p><strong>Subject Line:</strong> Terms of Service Inquiry - HapoHub</p>
                                </div>
                        </InfoBox>
                    </PolicySection>
                </div>

                
                <div className="text-center mt-12 pt-8 border-t border-border">
                    <p className="text-muted-foreground text-sm">
                        © {new Date().getFullYear()} HapoHub. All rights reserved. |
                        <span className="ml-2">
                            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}
