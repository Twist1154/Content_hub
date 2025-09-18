// src/components/admin/AdminClientManagement.tsx
import { getAllClients } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';

export async function AdminClientManagement() {
    const clients = await getAllClients();

    const getInitials = (email: string) => {
        return email.substring(0, 2).toUpperCase();
    }

    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Client</TableHead>
                            <TableHead>Store Name</TableHead>
                            <TableHead>Brand/Company</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clients.map((client: any) => (
                            <TableRow key={client.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarFallback>{getInitials(client.email)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{client.email}</p>
                                            <Badge variant="outline" className="mt-1">{client.role}</Badge>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{client.stores[0]?.name || 'N/A'}</TableCell>
                                <TableCell>{client.stores[0]?.brand_company || 'N/A'}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon">
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}