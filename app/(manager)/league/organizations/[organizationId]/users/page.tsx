"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type UserProfile = {
    id: string;
    email: string;
    role: string;
    approval_status: string;
    organization_id: string;
};

export default function UserManagementPage() {
    const { organizationId } = useParams();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [newRole, setNewRole] = useState<string>('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const fetchUsers = useCallback(async () => {
        const response = await fetch(`/api/organizations/${organizationId}/users`);
        if (response.ok) {
            const data = await response.json();
            setUsers(data);
        }
    }, [organizationId]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleApprove = async (userId: string) => {
        await fetch(`/api/organizations/${organizationId}/users/${userId}/approve`, {
            method: 'POST',
        });
        fetchUsers(); // Refresh users list
    };

    const handleRoleChange = async () => {
        if (!selectedUser || !newRole) return;
        await fetch(`/api/organizations/${organizationId}/users/${selectedUser.id}/update-role`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: newRole }),
        });
        setIsDialogOpen(false);
        fetchUsers(); // Refresh users list
    };

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-2xl font-bold mb-4">User Management</h1>
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.role}</TableCell>
                            <TableCell>{user.approval_status}</TableCell>
                            <TableCell>
                                {user.approval_status === 'pending' && (
                                    <Button onClick={() => handleApprove(user.id)}>Approve</Button>
                                )}
                                <Dialog open={isDialogOpen && selectedUser?.id === user.id} onOpenChange={setIsDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" onClick={() => {
                                            setSelectedUser(user);
                                            setNewRole(user.role);
                                            setIsDialogOpen(true);
                                        }}>
                                            Change Role
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Change Role for {selectedUser?.email}</DialogTitle>
                                        </DialogHeader>
                                        <Select onValueChange={setNewRole} defaultValue={user.role}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="admin">Admin</SelectItem>
                                                <SelectItem value="manager">Manager</SelectItem>
                                                <SelectItem value="referee">Referee</SelectItem>
                                                <SelectItem value="player">Player</SelectItem>
                                                <SelectItem value="fan">Fan</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button onClick={handleRoleChange}>Save Changes</Button>
                                    </DialogContent>
                                </Dialog>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            </div>
        </div>
    );
}
