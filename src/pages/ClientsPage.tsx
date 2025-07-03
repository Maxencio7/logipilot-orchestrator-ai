// src/pages/ClientsPage.tsx
import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, Search, Users, MoreHorizontal, Loader2, ServerCrash, Filter, Info, FileText, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Client, ClientFormData, ClientStatus, ClientActivitySummary } from '@/types';
import { useClients } from '@/hooks/useClients';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const clientFormSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  status: z.string().min(1, 'Status is required'), // from ClientStatus
  phone: z.string().optional(),
  address: z.string().optional(),
  companyName: z.string().optional(),
  contactPerson: z.string().optional(),
  industry: z.string().optional(),
  notes: z.string().optional(),
});


const ClientsPage = () => {
  const {
    clients,
    isLoading,
    error,
    fetchClients,
    addClient,
    editClient,
    removeClient,
    fetchClientActivitySummary,
    getClientStatusOptions,
  } = useClients();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [viewingActivityClient, setViewingActivityClient] = useState<Client | null>(null);
  const [activitySummary, setActivitySummary] = useState<ClientActivitySummary | null>(null);
  const [isActivityLoading, setIsActivityLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClientStatus | 'all'>('all');

  const statusOptions = getClientStatusOptions();

  const { control, handleSubmit, register, reset, formState: { errors, isSubmitting } } = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: '',
      email: '',
      status: 'Prospect',
    },
  });

  useEffect(() => {
    fetchClients({ query: searchTerm, status: statusFilter === 'all' ? undefined : statusFilter });
  }, [searchTerm, statusFilter, fetchClients]);

  useEffect(() => {
    if (editingClient) {
      reset({
        name: editingClient.name,
        email: editingClient.email,
        status: editingClient.status,
        phone: editingClient.phone,
        address: editingClient.address,
        companyName: editingClient.companyName,
        contactPerson: editingClient.contactPerson,
        industry: editingClient.industry,
        notes: editingClient.notes,
      });
    } else {
      reset({ name: '', email: '', status: 'Prospect', phone: '', address: '', companyName: '', contactPerson: '', industry: '', notes: '' });
    }
  }, [editingClient, reset]);

  const handleFormSubmit = async (data: ClientFormData) => {
    try {
      if (editingClient) {
        await editClient(editingClient.id, data);
      } else {
        await addClient(data);
      }
      setIsFormOpen(false);
      setEditingClient(null);
    } catch (e) {
      console.error("Failed to save client:", e);
    }
  };

  const openEditForm = (client: Client) => {
    setEditingClient(client);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (client: Client) => {
    setClientToDelete(client);
  };

  const confirmDelete = async () => {
    if (clientToDelete) {
      await removeClient(clientToDelete.id);
      setClientToDelete(null);
    }
  };

  const handleViewActivity = async (client: Client) => {
    setViewingActivityClient(client);
    setIsActivityLoading(true);
    const summary = await fetchClientActivitySummary(client.id);
    setActivitySummary(summary || null); // Ensure null if undefined
    setIsActivityLoading(false);
  };

  const getStatusBadge = (status: ClientStatus) => {
    switch (status) {
      case 'Active': return <Badge variant="default" className="capitalize">{status}</Badge>;
      case 'Inactive': return <Badge variant="outline" className="capitalize">{status}</Badge>;
      case 'Prospect': return <Badge variant="secondary" className="capitalize">{status}</Badge>;
      case 'Onboarding': return <Badge variant="secondary" className="capitalize">{status}</Badge>;
      default: return <Badge variant="default" className="capitalize">{status}</Badge>;
    }
  };

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full text-red-500">
        <ServerCrash className="w-16 h-16 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Error Loading Clients</h2>
        <p>{error.message}</p>
        <Button onClick={() => fetchClients()} className="mt-4">Try Again</Button>
      </div>
    );
  }

  const renderTableBody = () => {
     if (isLoading && clients.length === 0) { // Initial load
      return Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={`skeleton-${i}`}>
          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
        </TableRow>
      ));
    }
    if(clients.length === 0) {
        return <TableRow><TableCell colSpan={5} className="text-center h-24">No clients found.</TableCell></TableRow>;
    }
    return clients.map((client) => (
        <TableRow key={client.id}>
          <TableCell className="font-medium">{client.name}</TableCell>
          <TableCell>{client.email}</TableCell>
          <TableCell>{client.companyName || '-'}</TableCell>
          <TableCell>{getStatusBadge(client.status)}</TableCell>
          <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => openEditForm(client)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit Profile
                </DropdownMenuItem>
                 <DropdownMenuItem onClick={() => handleViewActivity(client)}>
                  <BarChart3 className="mr-2 h-4 w-4" /> View Activity
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => openDeleteDialog(client)} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Client
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      ));
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center"><Users className="mr-3 w-8 h-8 text-logistics-primary" />Manage Clients</h1>
        <Button onClick={() => { setEditingClient(null); reset({ name: '', email: '', status: 'Prospect' }); setIsFormOpen(true); }}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Client
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client List</CardTitle>
          <CardDescription>View, search, and manage all your clients.</CardDescription>
           <div className="flex items-center space-x-2 pt-4">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search by name, email, company..."
                    className="pl-8 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Select value={statusFilter} onValueChange={(value: ClientStatus | 'all') => setStatusFilter(value)}>
                <SelectTrigger className="w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderTableBody()}
            </TableBody>
          </Table>
          {isLoading && clients.length > 0 && <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-logistics-primary" /></div>}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(isOpen) => { setIsFormOpen(isOpen); if (!isOpen) setEditingClient(null); }}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{editingClient ? 'Edit Client Profile' : 'Onboard New Client'}</DialogTitle>
            <DialogDescription>
              {editingClient ? 'Update the details for this client.' : 'Enter the details for the new client.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="grid gap-4 py-4">
            {/* AI Onboarding Suggestions Placeholder */}
            {!editingClient && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-700">AI Onboarding Suggestions</h4>
                      <p className="text-sm text-blue-600">Placeholder: AI will provide suggestions here based on client industry or initial input.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name / Company Name</Label>
                <Input id="name" {...register('name')} className={errors.name ? 'border-red-500' : ''} />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" {...register('email')} className={errors.email ? 'border-red-500' : ''} />
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
              </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="status">Status</Label>
                    <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value} >
                                <SelectTrigger id="status" className={errors.status ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.status && <p className="text-sm text-red-500 mt-1">{errors.status.message}</p>}
                </div>
                <div>
                    <Label htmlFor="phone">Phone (Optional)</Label>
                    <Input id="phone" {...register('phone')} />
                </div>
            </div>
            <div>
                <Label htmlFor="companyName">Official Company Name (Optional)</Label>
                <Input id="companyName" {...register('companyName')} />
            </div>
            <div>
                <Label htmlFor="address">Address (Optional)</Label>
                <Textarea id="address" {...register('address')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="contactPerson">Contact Person (Optional)</Label>
                    <Input id="contactPerson" {...register('contactPerson')} />
                </div>
                <div>
                    <Label htmlFor="industry">Industry (Optional)</Label>
                    <Input id="industry" {...register('industry')} />
                </div>
            </div>
            <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea id="notes" {...register('notes')} />
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingClient ? 'Save Changes' : 'Add Client'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!clientToDelete} onOpenChange={(isOpen) => { if(!isOpen) setClientToDelete(null);}}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete client <span className="font-semibold">{clientToDelete?.name}</span> and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
             {isLoading && clientToDelete ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Delete Client
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Client Activity Summary Dialog */}
      <Dialog open={!!viewingActivityClient} onOpenChange={(isOpen) => { if(!isOpen) setViewingActivityClient(null); setActivitySummary(null);}}>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>Activity Summary: {viewingActivityClient?.name}</DialogTitle>
                <DialogDescription>Overview of client interactions and history.</DialogDescription>
            </DialogHeader>
            {isActivityLoading ? (
                 <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin text-logistics-primary" />
                 </div>
            ) : activitySummary ? (
                <div className="space-y-4 py-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center"><FileText className="mr-2 h-5 w-5 text-logistics-primary" />Request History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p><strong>Total Requests:</strong> {activitySummary.totalRequests}</p>
                            <p><strong>Last Request Date:</strong> {activitySummary.lastRequestDate ? new Date(activitySummary.lastRequestDate).toLocaleDateString() : 'N/A'}</p>
                            <p><strong>Common Destinations:</strong> {activitySummary.commonDestinations?.join(', ') || 'N/A'}</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center"><BarChart3 className="mr-2 h-5 w-5 text-green-600" />Satisfaction</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <p><strong>Current Score:</strong> {viewingActivityClient?.satisfactionScore || 'N/A'}/100</p>
                             <p><strong>Recent Trend:</strong> {activitySummary.satisfactionTrend?.join(' → ') || 'N/A'}</p>
                        </CardContent>
                    </Card>
                    {/* Placeholder for more detailed activity log or charts */}
                </div>
            ) : (
                <p className="py-4 text-center">No activity summary available for this client.</p>
            )}
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>
            </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default ClientsPage;
