// src/pages/ShipmentsPage.tsx
import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, Search, Package, Clock, CheckCircle, XCircle, MoreHorizontal, Loader2, ServerCrash, Filter } from 'lucide-react';
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
import { Shipment, ShipmentFormData, ShipmentStatus } from '@/types';
import { useShipments } from '@/hooks/useShipments';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const shipmentFormSchema = z.object({
  client: z.string().min(1, 'Client name is required'),
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  status: z.string().min(1, 'Status is required'), // Will be from ShipmentStatus type
  carrier: z.string().optional(),
  trackingNumber: z.string().optional(),
  weightKg: z.coerce.number().positive('Weight must be positive').optional(),
  contents: z.string().optional(),
  notes: z.string().optional(),
  eta: z.string().optional(),
});


const ShipmentsPage = () => {
  const {
    shipments,
    isLoading,
    error,
    fetchShipments,
    addShipment,
    editShipment,
    removeShipment,
    getShipmentStatusOptions,
  } = useShipments();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [shipmentToDelete, setShipmentToDelete] = useState<Shipment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false); // Local state for delete operation

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | 'all'>('all');

  const statusOptions = getShipmentStatusOptions();

  const { control, handleSubmit, register, reset, formState: { errors, isSubmitting } } = useForm<ShipmentFormData>({
    resolver: zodResolver(shipmentFormSchema),
    defaultValues: {
      client: '',
      origin: '',
      destination: '',
      status: 'Pending',
      carrier: '',
      trackingNumber: '',
      weightKg: undefined,
      contents: '',
      notes: '',
      eta: '',
    },
  });

  useEffect(() => {
    fetchShipments({ query: searchTerm, status: statusFilter === 'all' ? undefined : statusFilter });
  }, [searchTerm, statusFilter, fetchShipments]);

  useEffect(() => {
    if (editingShipment) {
      reset({
        client: editingShipment.client,
        origin: editingShipment.origin,
        destination: editingShipment.destination,
        status: editingShipment.status,
        carrier: editingShipment.carrier,
        trackingNumber: editingShipment.trackingNumber,
        weightKg: editingShipment.weightKg,
        contents: editingShipment.contents,
        notes: editingShipment.notes,
        eta: editingShipment.eta,
      });
    } else {
      reset(); // Reset to default values when adding new
    }
  }, [editingShipment, reset]);

  const handleFormSubmit = async (data: ShipmentFormData) => {
    try {
      if (editingShipment) {
        await editShipment(editingShipment.id, data);
      } else {
        await addShipment(data);
      }
      setIsFormOpen(false);
      setEditingShipment(null);
      reset();
    } catch (e) {
      console.error("Failed to save shipment:", e);
      // Potentially show a toast notification here
    }
  };

  const openEditForm = (shipment: Shipment) => {
    setEditingShipment(shipment);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (shipment: Shipment) => {
    setShipmentToDelete(shipment);
  };

  const confirmDelete = async () => {
    if (shipmentToDelete) {
      setIsDeleting(true);
      try {
        await removeShipment(shipmentToDelete.id);
        // Toast for success will be shown by hook or could be added here
      } catch (e) {
        // Toast for error will be shown by apiService interceptor or hook
        console.error("Deletion failed", e);
      } finally {
        setIsDeleting(false);
        setShipmentToDelete(null);
      }
    }
  };

  const getStatusBadge = (status: ShipmentStatus) => {
    switch (status) {
      case 'Delivered': return <Badge variant="success" className="capitalize">{status}</Badge>;
      case 'Delayed': return <Badge variant="destructive" className="capitalize">{status}</Badge>;
      case 'Cancelled': return <Badge variant="outline" className="capitalize">{status}</Badge>;
      case 'Processing': return <Badge variant="info" className="capitalize">{status}</Badge>;
      case 'In Transit': return <Badge variant="secondary" className="capitalize">{status}</Badge>;
      case 'Pending':
      default:
        return <Badge variant="default" className="capitalize">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: ShipmentStatus) => {
    switch (status) {
      case 'Delivered': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Delayed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'Processing': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'In Transit': return <Package className="w-4 h-4 text-yellow-500" />;
      case 'Pending': return <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />;
      case 'Cancelled': return <XCircle className="w-4 h-4 text-gray-400" />;
      default: return <Package className="w-4 h-4 text-gray-500" />;
    }
  };


  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full text-red-500">
        <ServerCrash className="w-16 h-16 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Error Loading Shipments</h2>
        <p>{error.message}</p>
        <Button onClick={() => fetchShipments()} className="mt-4">Try Again</Button>
      </div>
    );
  }

  const renderTableBody = () => {
    if (isLoading && shipments.length === 0) { // Initial load
      return Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={`skeleton-${i}`}>
          <TableCell><Skeleton className="h-5 w-5" /></TableCell>
          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
        </TableRow>
      ));
    }
    if (shipments.length === 0) {
        return <TableRow><TableCell colSpan={7} className="text-center h-24">No shipments found.</TableCell></TableRow>;
    }
    return shipments.map((shipment) => (
        <TableRow key={shipment.id}>
          <TableCell>{getStatusIcon(shipment.status)}</TableCell>
          <TableCell className="font-medium">{shipment.id}</TableCell>
          <TableCell>{shipment.client}</TableCell>
          <TableCell>{shipment.origin}</TableCell>
          <TableCell>{shipment.destination}</TableCell>
          <TableCell>{getStatusBadge(shipment.status)}</TableCell>
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
                <DropdownMenuItem onClick={() => openEditForm(shipment)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openDeleteDialog(shipment)} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
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
        <h1 className="text-3xl font-bold text-slate-800">Manage Shipments</h1>
        <Button onClick={() => { setEditingShipment(null); reset(); setIsFormOpen(true); }}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Shipment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shipment List</CardTitle>
          <CardDescription>View, search, and manage all your shipments.</CardDescription>
           <div className="flex items-center space-x-2 pt-4">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search by ID, client, origin, destination..."
                    className="pl-8 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Select value={statusFilter} onValueChange={(value: ShipmentStatus | 'all') => setStatusFilter(value)}>
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
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Origin</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderTableBody()}
            </TableBody>
          </Table>
          {isLoading && shipments.length > 0 && <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-logistics-primary" /></div>}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={(isOpen) => { setIsFormOpen(isOpen); if (!isOpen) setEditingShipment(null); }}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{editingShipment ? 'Edit Shipment' : 'Add New Shipment'}</DialogTitle>
            <DialogDescription>
              {editingShipment ? 'Update the details of this shipment.' : 'Enter the details for the new shipment.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client">Client Name</Label>
                <Input id="client" {...register('client')} className={errors.client ? 'border-red-500' : ''} />
                {errors.client && <p className="text-sm text-red-500 mt-1">{errors.client.message}</p>}
              </div>
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="origin">Origin</Label>
                <Input id="origin" {...register('origin')} className={errors.origin ? 'border-red-500' : ''} />
                {errors.origin && <p className="text-sm text-red-500 mt-1">{errors.origin.message}</p>}
              </div>
              <div>
                <Label htmlFor="destination">Destination</Label>
                <Input id="destination" {...register('destination')} className={errors.destination ? 'border-red-500' : ''} />
                {errors.destination && <p className="text-sm text-red-500 mt-1">{errors.destination.message}</p>}
              </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="carrier">Carrier (Optional)</Label>
                <Input id="carrier" {...register('carrier')} />
              </div>
              <div>
                <Label htmlFor="trackingNumber">Tracking Number (Optional)</Label>
                <Input id="trackingNumber" {...register('trackingNumber')} />
              </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weightKg">Weight (kg) (Optional)</Label>
                <Input id="weightKg" type="number" step="0.1" {...register('weightKg')} />
                 {errors.weightKg && <p className="text-sm text-red-500 mt-1">{errors.weightKg.message}</p>}
              </div>
               <div>
                <Label htmlFor="eta">ETA (Optional)</Label>
                <Input id="eta" {...register('eta')} placeholder="e.g., 2 days, Tomorrow 3 PM" />
              </div>
            </div>
            <div>
              <Label htmlFor="contents">Contents (Optional)</Label>
              <Textarea id="contents" {...register('contents')} />
            </div>
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea id="notes" {...register('notes')} />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingShipment ? 'Save Changes' : 'Create Shipment'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!shipmentToDelete} onOpenChange={(isOpen) => { if(!isOpen) setShipmentToDelete(null);}}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the shipment
              with ID: <span className="font-semibold">{shipmentToDelete?.id}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShipmentToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700" disabled={isDeleting}>
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ShipmentsPage;
