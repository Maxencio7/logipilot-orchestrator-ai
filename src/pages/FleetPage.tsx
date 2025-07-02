// src/pages/FleetPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Truck, Wrench, UserCheck, Map, PlusCircle, Edit, Trash2, MoreHorizontal, Loader2, ServerCrash, Search, Filter, MapPinIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Vehicle, VehicleFormData, MaintenanceLog, MaintenanceLogFormData, DriverAssignment, DriverAssignmentFormData, VehicleStatus, VehicleType, MaintenanceType } from '@/types';
import * as api from '@/api/mockService';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from '@/components/ui/checkbox';


// --- Zod Schemas ---
const vehicleStatusOptions: [VehicleStatus, ...VehicleStatus[]] = ['Active', 'Maintenance', 'Idle', 'Out of Service'];
const vehicleTypeOptions: [VehicleType, ...VehicleType[]] = ['Truck', 'Van', 'Motorcycle', 'Drone', 'Other'];

const vehicleFormSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.coerce.number().int().min(1980, 'Year must be after 1980').max(new Date().getFullYear() + 1, 'Year cannot be too far in future'),
  licensePlate: z.string().min(1, 'License plate is required'),
  vin: z.string().optional(),
  type: z.enum(vehicleTypeOptions),
  status: z.enum(vehicleStatusOptions),
  fuelLevel: z.coerce.number().min(0).max(100).optional(),
  mileage: z.coerce.number().min(0).optional(),
  lastMaintenanceDate: z.string().optional(),
  nextMaintenanceDate: z.string().optional(),
});

const maintenanceTypeOptions: [MaintenanceType, ...MaintenanceType[]] = ['Scheduled', 'Repair', 'Inspection'];
const maintenanceLogFormSchema = z.object({
  vehicleId: z.string().min(1), // Will be set based on context
  date: z.string().min(1, 'Date is required'), // Should be a date string
  type: z.enum(maintenanceTypeOptions),
  description: z.string().min(1, 'Description is required'),
  cost: z.coerce.number().min(0).optional(),
  serviceProvider: z.string().optional(),
  notes: z.string().optional(),
  completed: z.boolean().default(false),
});

const driverAssignmentFormSchema = z.object({
  vehicleId: z.string().min(1), // Will be set based on context
  driverId: z.string().min(1, 'Driver ID is required'),
  assignmentStartDate: z.string().min(1, 'Start date is required'),
  assignmentEndDate: z.string().optional(),
  notes: z.string().optional(),
});

// --- Helper Components & Functions ---
const getVehicleStatusBadge = (status: VehicleStatus) => {
  switch (status) {
    case 'Active': return <Badge variant="success">{status}</Badge>;
    case 'Maintenance': return <Badge variant="warning">{status}</Badge>;
    case 'Idle': return <Badge variant="secondary">{status}</Badge>;
    case 'Out of Service': return <Badge variant="destructive">{status}</Badge>;
    default: return <Badge>{status}</Badge>;
  }
};

const FleetPage = () => {
  const { toast } = useToast();
  // States for Vehicles
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  const [vehicleError, setVehicleError] = useState<Error | null>(null);
  const [isVehicleFormOpen, setIsVehicleFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

  // States for Maintenance Logs (contextual to selected vehicle)
  const [selectedVehicleForLogs, setSelectedVehicleForLogs] = useState<Vehicle | null>(null);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [isLogFormOpen, setIsLogFormOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<MaintenanceLog | null>(null);
  const [logToDelete, setLogToDelete] = useState<MaintenanceLog | null>(null);

  // States for Driver Assignments (contextual to selected vehicle)
  const [selectedVehicleForAssignments, setSelectedVehicleForAssignments] = useState<Vehicle | null>(null);
  const [driverAssignments, setDriverAssignments] = useState<DriverAssignment[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  const [isAssignmentFormOpen, setIsAssignmentFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<DriverAssignment | null>(null);
  const [assignmentToDelete, setAssignmentToDelete] = useState<DriverAssignment | null>(null);

  // Forms
  const vehicleForm = useForm<VehicleFormData>({ resolver: zodResolver(vehicleFormSchema), defaultValues: {type: 'Truck', status: 'Idle'} });
  const logForm = useForm<MaintenanceLogFormData>({ resolver: zodResolver(maintenanceLogFormSchema), defaultValues: {type: 'Scheduled', completed: false} });
  const assignmentForm = useForm<DriverAssignmentFormData>({ resolver: zodResolver(driverAssignmentFormSchema) });

  // Fetching Data
  const fetchVehicles = useCallback(async () => {
    setIsLoadingVehicles(true); setVehicleError(null);
    try {
      const data = await api.getVehicles(); // Add filters later if needed
      setVehicles(data);
    } catch (err: any) { setVehicleError(err); toast({ title: "Error", description: "Failed to fetch vehicles.", variant: "destructive" });}
    finally { setIsLoadingVehicles(false); }
  }, [toast]);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  const fetchLogsForVehicle = useCallback(async (vehicleId: string) => {
    setIsLoadingLogs(true);
    try {
      const data = await api.getMaintenanceLogsForVehicle(vehicleId);
      setMaintenanceLogs(data);
    } catch (err) { toast({ title: "Error", description: `Failed to fetch logs for vehicle ${vehicleId}.`, variant: "destructive" });}
    finally { setIsLoadingLogs(false); }
  }, [toast]);

  const fetchAssignmentsForVehicle = useCallback(async (vehicleId: string) => {
    setIsLoadingAssignments(true);
    try {
      const data = await api.getDriverAssignmentsForVehicle(vehicleId);
      setDriverAssignments(data);
    } catch (err) { toast({ title: "Error", description: `Failed to fetch assignments for vehicle ${vehicleId}.`, variant: "destructive" });}
    finally { setIsLoadingAssignments(false); }
  }, [toast]);

  // Vehicle Form Actions
  const handleVehicleFormSubmit = async (data: VehicleFormData) => {
    try {
      if (editingVehicle) {
        await api.updateVehicle(editingVehicle.id, data);
        toast({ title: "Success", description: "Vehicle updated." });
      } else {
        await api.createVehicle(data);
        toast({ title: "Success", description: "Vehicle added." });
      }
      setIsVehicleFormOpen(false); setEditingVehicle(null); vehicleForm.reset(); fetchVehicles();
    } catch (e) { toast({ title: "Error", description: "Failed to save vehicle.", variant: "destructive" }); }
  };
  const openVehicleEditForm = (vehicle: Vehicle) => { setEditingVehicle(vehicle); vehicleForm.reset(vehicle); setIsVehicleFormOpen(true); };
  const confirmVehicleDelete = async () => {
    if (vehicleToDelete) {
      try { await api.deleteVehicle(vehicleToDelete.id); toast({ title: "Success", description: "Vehicle deleted." }); fetchVehicles(); }
      catch (e) { toast({ title: "Error", description: "Failed to delete vehicle.", variant: "destructive" }); }
      setVehicleToDelete(null);
    }
  };

  // Log Form Actions
  const handleLogFormSubmit = async (data: MaintenanceLogFormData) => {
    if (!selectedVehicleForLogs) return;
    const payload = {...data, vehicleId: selectedVehicleForLogs.id };
    try {
      if (editingLog) {
        await api.updateMaintenanceLog(editingLog.id, payload);
        toast({ title: "Success", description: "Maintenance log updated." });
      } else {
        await api.createMaintenanceLog(payload);
        toast({ title: "Success", description: "Maintenance log added." });
      }
      setIsLogFormOpen(false); setEditingLog(null); logForm.reset(); fetchLogsForVehicle(selectedVehicleForLogs.id);
    } catch (e) { toast({ title: "Error", description: "Failed to save maintenance log.", variant: "destructive" }); }
  };
  const openLogEditForm = (log: MaintenanceLog) => { setEditingLog(log); logForm.reset(log); setIsLogFormOpen(true); };
  const confirmLogDelete = async () => {
    if (logToDelete && selectedVehicleForLogs) {
      try { await api.deleteMaintenanceLog(logToDelete.id); toast({ title: "Success", description: "Log deleted." }); fetchLogsForVehicle(selectedVehicleForLogs.id); }
      catch (e) { toast({ title: "Error", description: "Failed to delete log.", variant: "destructive" }); }
      setLogToDelete(null);
    }
  };

  // Assignment Form Actions
  const handleAssignmentFormSubmit = async (data: DriverAssignmentFormData) => {
    if (!selectedVehicleForAssignments) return;
    const payload = {...data, vehicleId: selectedVehicleForAssignments.id };
    try {
      if (editingAssignment) {
        await api.updateDriverAssignment(editingAssignment.id, payload);
        toast({ title: "Success", description: "Assignment updated." });
      } else {
        await api.createDriverAssignment(payload);
        toast({ title: "Success", description: "Assignment created." });
      }
      setIsAssignmentFormOpen(false); setEditingAssignment(null); assignmentForm.reset(); fetchAssignmentsForVehicle(selectedVehicleForAssignments.id); fetchVehicles(); // Re-fetch vehicles to update assignedDriverId
    } catch (e) { toast({ title: "Error", description: "Failed to save assignment.", variant: "destructive" }); }
  };
  const openAssignmentEditForm = (assignment: DriverAssignment) => { setEditingAssignment(assignment); assignmentForm.reset(assignment); setIsAssignmentFormOpen(true); };
  const confirmAssignmentDelete = async () => {
    if (assignmentToDelete && selectedVehicleForAssignments) {
      try { await api.deleteDriverAssignment(assignmentToDelete.id); toast({ title: "Success", description: "Assignment deleted." }); fetchAssignmentsForVehicle(selectedVehicleForAssignments.id); fetchVehicles(); }
      catch (e) { toast({ title: "Error", description: "Failed to delete assignment.", variant: "destructive" }); }
      setAssignmentToDelete(null);
    }
  };

  // Render
  if (isLoadingVehicles && vehicles.length === 0) return <div className="p-6 flex justify-center"><Loader2 className="w-12 h-12 animate-spin text-logistics-primary" /></div>;
  if (vehicleError) return <div className="p-6 text-red-500 text-center"><ServerCrash className="w-12 h-12 mx-auto mb-2" />Failed to load fleet data.</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center"><Truck className="mr-3 w-8 h-8 text-logistics-primary" />Fleet Management</h1>
        <Button onClick={() => { setEditingVehicle(null); vehicleForm.reset({type: 'Truck', status: 'Idle'}); setIsVehicleFormOpen(true); }}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Vehicle
        </Button>
      </div>

      {/* Map Placeholder */}
      <Card>
        <CardHeader><CardTitle className="flex items-center"><Map className="mr-2"/>Fleet Map Overview</CardTitle></CardHeader>
        <CardContent className="h-64 bg-slate-100 flex items-center justify-center text-slate-500">
          <MapPinIcon className="w-10 h-10 mr-2"/> Map Placeholder - Integration with Leaflet.js or Mapbox pending.
        </CardContent>
      </Card>

      <Tabs defaultValue="vehicles">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vehicles">Vehicles ({vehicles.length})</TabsTrigger>
          <TabsTrigger value="maintenance" disabled={!selectedVehicleForLogs}>Maintenance Logs</TabsTrigger>
          <TabsTrigger value="assignments" disabled={!selectedVehicleForAssignments}>Driver Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles">
          <Card>
            <CardHeader><CardTitle>Vehicle List</CardTitle><CardDescription>Manage all vehicles in your fleet.</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Make/Model</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>License Plate</TableHead><TableHead>Driver</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {vehicles.map(v => (
                    <TableRow key={v.id} onClick={() => {setSelectedVehicleForLogs(v); setSelectedVehicleForAssignments(v); fetchLogsForVehicle(v.id); fetchAssignmentsForVehicle(v.id);}} className="cursor-pointer hover:bg-slate-50">
                      <TableCell>{v.id}</TableCell>
                      <TableCell>{v.make} {v.model} ({v.year})</TableCell>
                      <TableCell>{v.type}</TableCell>
                      <TableCell>{getVehicleStatusBadge(v.status)}</TableCell>
                      <TableCell>{v.licensePlate}</TableCell>
                      <TableCell>{v.assignedDriverId || 'N/A'}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={(e)=>{e.stopPropagation(); openVehicleEditForm(v);}} className="mr-2"><Edit className="h-3 w-3 mr-1"/>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={(e)=>{e.stopPropagation(); setVehicleToDelete(v);}}><Trash2 className="h-3 w-3 mr-1"/>Del</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Maintenance Logs for {selectedVehicleForLogs?.id}</CardTitle>
                    <CardDescription>View and manage maintenance records.</CardDescription>
                </div>
                <Button onClick={() => {setEditingLog(null); logForm.reset({type: 'Scheduled', completed: false}); setIsLogFormOpen(true);}} disabled={!selectedVehicleForLogs}><PlusCircle className="mr-2 h-4 w-4"/>Add Log</Button>
            </CardHeader>
            <CardContent>
              {isLoadingLogs ? <Loader2 className="animate-spin"/> : maintenanceLogs.length === 0 ? <p>No maintenance logs for this vehicle.</p> : (
                <Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Description</TableHead><TableHead>Cost</TableHead><TableHead>Completed</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                  <TableBody>{maintenanceLogs.map(log => (<TableRow key={log.id}>
                      <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell><TableCell>{log.type}</TableCell><TableCell>{log.description}</TableCell><TableCell>${log.cost || 'N/A'}</TableCell><TableCell>{log.completed ? "Yes" : "No"}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={()=>{openLogEditForm(log);}} className="mr-2"><Edit className="h-3 w-3 mr-1"/>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={()=>{setLogToDelete(log);}}><Trash2 className="h-3 w-3 mr-1"/>Del</Button>
                      </TableCell>
                  </TableRow>))}</TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Driver Assignments for {selectedVehicleForAssignments?.id}</CardTitle>
                    <CardDescription>Manage driver assignments for this vehicle.</CardDescription>
                </div>
                <Button onClick={() => {setEditingAssignment(null); assignmentForm.reset(); setIsAssignmentFormOpen(true);}} disabled={!selectedVehicleForAssignments}><PlusCircle className="mr-2 h-4 w-4"/>Assign Driver</Button>
            </CardHeader>
            <CardContent>
              {isLoadingAssignments ? <Loader2 className="animate-spin"/> : driverAssignments.length === 0 ? <p>No driver assignments for this vehicle.</p> : (
                <Table><TableHeader><TableRow><TableHead>Driver ID</TableHead><TableHead>Driver Name</TableHead><TableHead>Start Date</TableHead><TableHead>End Date</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                  <TableBody>{driverAssignments.map(ass => (<TableRow key={ass.id}>
                      <TableCell>{ass.driverId}</TableCell><TableCell>{ass.driverName || 'N/A'}</TableCell><TableCell>{new Date(ass.assignmentStartDate).toLocaleDateString()}</TableCell><TableCell>{ass.assignmentEndDate ? new Date(ass.assignmentEndDate).toLocaleDateString() : 'Ongoing'}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={()=>{openAssignmentEditForm(ass);}} className="mr-2"><Edit className="h-3 w-3 mr-1"/>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={()=>{setAssignmentToDelete(ass);}}><Trash2 className="h-3 w-3 mr-1"/>Del</Button>
                      </TableCell>
                  </TableRow>))}</TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Vehicle Form Dialog */}
      <Dialog open={isVehicleFormOpen} onOpenChange={setIsVehicleFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle></DialogHeader>
          <form onSubmit={vehicleForm.handleSubmit(handleVehicleFormSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div><Label htmlFor="make">Make</Label><Input id="make" {...vehicleForm.register('make')} />{vehicleForm.formState.errors.make && <p className="text-xs text-red-500">{vehicleForm.formState.errors.make.message}</p>}</div>
              <div><Label htmlFor="model">Model</Label><Input id="model" {...vehicleForm.register('model')} />{vehicleForm.formState.errors.model && <p className="text-xs text-red-500">{vehicleForm.formState.errors.model.message}</p>}</div>
            </div>
            {/* ... more fields: year, licensePlate, vin, type, status, fuelLevel, mileage, maintenance dates ... */}
            <div><Label htmlFor="year">Year</Label><Input id="year" type="number" {...vehicleForm.register('year')} />{vehicleForm.formState.errors.year && <p className="text-xs text-red-500">{vehicleForm.formState.errors.year.message}</p>}</div>
            <div><Label htmlFor="licensePlate">License Plate</Label><Input id="licensePlate" {...vehicleForm.register('licensePlate')} />{vehicleForm.formState.errors.licensePlate && <p className="text-xs text-red-500">{vehicleForm.formState.errors.licensePlate.message}</p>}</div>
            <div><Label htmlFor="vin">VIN (Optional)</Label><Input id="vin" {...vehicleForm.register('vin')} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label htmlFor="type">Type</Label><Controller name="type" control={vehicleForm.control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue placeholder="Select type"/></SelectTrigger><SelectContent>{vehicleTypeOptions.map(t=><SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>)} />{vehicleForm.formState.errors.type && <p className="text-xs text-red-500">{vehicleForm.formState.errors.type.message}</p>}</div>
              <div><Label htmlFor="status">Status</Label><Controller name="status" control={vehicleForm.control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue placeholder="Select status"/></SelectTrigger><SelectContent>{vehicleStatusOptions.map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>)} />{vehicleForm.formState.errors.status && <p className="text-xs text-red-500">{vehicleForm.formState.errors.status.message}</p>}</div>
            </div>
             <div><Label htmlFor="lastMaintenanceDate">Last Maintenance (Optional)</Label><Input id="lastMaintenanceDate" type="date" {...vehicleForm.register('lastMaintenanceDate')} /></div>
            <div><Label htmlFor="nextMaintenanceDate">Next Maintenance (Optional)</Label><Input id="nextMaintenanceDate" type="date" {...vehicleForm.register('nextMaintenanceDate')} /></div>

            <DialogFooter><DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose><Button type="submit" disabled={vehicleForm.formState.isSubmitting}>{vehicleForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Vehicle</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!vehicleToDelete} onOpenChange={(isOpen) => { if(!isOpen) setVehicleToDelete(null);}}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Vehicle?</AlertDialogTitle><AlertDialogDescription>This will permanently delete vehicle {vehicleToDelete?.id}.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmVehicleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>

      {/* Maintenance Log Form Dialog */}
       <Dialog open={isLogFormOpen} onOpenChange={setIsLogFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editingLog ? 'Edit Log' : `Add Log for ${selectedVehicleForLogs?.id}`}</DialogTitle></DialogHeader>
          <form onSubmit={logForm.handleSubmit(handleLogFormSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div><Label htmlFor="logDate">Date</Label><Input id="logDate" type="date" {...logForm.register('date')} />{logForm.formState.errors.date && <p className="text-xs text-red-500">{logForm.formState.errors.date.message}</p>}</div>
            <div><Label htmlFor="logType">Type</Label><Controller name="type" control={logForm.control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue placeholder="Select type"/></SelectTrigger><SelectContent>{maintenanceTypeOptions.map(t=><SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>)} />{logForm.formState.errors.type && <p className="text-xs text-red-500">{logForm.formState.errors.type.message}</p>}</div>
            <div><Label htmlFor="logDescription">Description</Label><Textarea id="logDescription" {...logForm.register('description')} />{logForm.formState.errors.description && <p className="text-xs text-red-500">{logForm.formState.errors.description.message}</p>}</div>
            <div><Label htmlFor="logCost">Cost (Optional)</Label><Input id="logCost" type="number" step="0.01" {...logForm.register('cost')} /></div>
            <div><Label htmlFor="logServiceProvider">Service Provider (Optional)</Label><Input id="logServiceProvider" {...logForm.register('serviceProvider')} /></div>
            <div className="flex items-center space-x-2"><Controller name="completed" control={logForm.control} render={({ field }) => (<Checkbox id="logCompleted" checked={field.value} onCheckedChange={field.onChange} />)} /><Label htmlFor="logCompleted">Mark as Completed</Label></div>
            <DialogFooter><DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose><Button type="submit" disabled={logForm.formState.isSubmitting}>{logForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Log</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!logToDelete} onOpenChange={(isOpen) => { if(!isOpen) setLogToDelete(null);}}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Log?</AlertDialogTitle><AlertDialogDescription>This will permanently delete log {logToDelete?.id}.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmLogDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>

      {/* Driver Assignment Form Dialog */}
      <Dialog open={isAssignmentFormOpen} onOpenChange={setIsAssignmentFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editingAssignment ? 'Edit Assignment' : `Assign Driver to ${selectedVehicleForAssignments?.id}`}</DialogTitle></DialogHeader>
          <form onSubmit={assignmentForm.handleSubmit(handleAssignmentFormSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div><Label htmlFor="assignDriverId">Driver ID (e.g. DRV00X)</Label><Input id="assignDriverId" {...assignmentForm.register('driverId')} />{assignmentForm.formState.errors.driverId && <p className="text-xs text-red-500">{assignmentForm.formState.errors.driverId.message}</p>}</div>
            <div><Label htmlFor="assignStartDate">Start Date</Label><Input id="assignStartDate" type="date" {...assignmentForm.register('assignmentStartDate')} />{assignmentForm.formState.errors.assignmentStartDate && <p className="text-xs text-red-500">{assignmentForm.formState.errors.assignmentStartDate.message}</p>}</div>
            <div><Label htmlFor="assignEndDate">End Date (Optional - leave blank if ongoing)</Label><Input id="assignEndDate" type="date" {...assignmentForm.register('assignmentEndDate')} /></div>
            <div><Label htmlFor="assignNotes">Notes (Optional)</Label><Textarea id="assignNotes" {...assignmentForm.register('notes')} /></div>
            <DialogFooter><DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose><Button type="submit" disabled={assignmentForm.formState.isSubmitting}>{assignmentForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Assignment</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!assignmentToDelete} onOpenChange={(isOpen) => { if(!isOpen) setAssignmentToDelete(null);}}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Assignment?</AlertDialogTitle><AlertDialogDescription>This will permanently delete assignment {assignmentToDelete?.id}.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmAssignmentDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>

    </div>
  );
};

export default FleetPage;
