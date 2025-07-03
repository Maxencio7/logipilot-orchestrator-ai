// src/pages/FinancialsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, FileText, Printer, PlusCircle, Edit, Trash2, Eye, Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Invoice, InvoiceFormData, FeeNote, FeeNoteFormData, Receipt, ReceiptFormData, LineItemFormData, DocumentStatus, Client } from '@/types';
import * as api from '@/api/mockService';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/components/ui/use-toast";
import { Separator } from '@/components/ui/separator';

// --- Zod Schemas ---
const documentStatusOptions: [DocumentStatus, ...DocumentStatus[]] = ['Draft', 'Sent', 'Paid', 'Partially Paid', 'Overdue', 'Void', 'Cancelled'];

const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().min(0.01, "Quantity must be positive"),
  unitPrice: z.coerce.number().min(0, "Unit price cannot be negative"),
});

const invoiceFormSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().optional(),
  currency: z.string().min(3, "Currency code is required (e.g., USD)").max(3),
  status: z.enum(documentStatusOptions),
  lineItems: z.array(lineItemSchema).min(1, "At least one line item is required"),
  taxRate: z.coerce.number().min(0).max(1).optional(), // e.g., 0.07 for 7%
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
});
// Schemas for FeeNote and Receipt would be similar, adapting fields as needed.
const feeNoteFormSchema = invoiceFormSchema.omit({ paymentTerms: true }).extend({ relatedInvoiceId: z.string().optional() });
const receiptFormSchema = invoiceFormSchema.omit({ dueDate: true, paymentTerms: true, taxRate: true }).extend({
    paymentDate: z.string().min(1, "Payment date is required"),
    paymentMethod: z.string().min(1, "Payment method is required"),
    relatedInvoiceId: z.string().optional(),
});


const FinancialsPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'invoices' | 'feenotes' | 'receipts'>('invoices');

  // Data states
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [feeNotes, setFeeNotes] = useState<FeeNote[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [clients, setClients] = useState<Client[]>([]); // For dropdowns

  // Pagination states
  const [invoicePagination, setInvoicePagination] = useState<api.PaginationInfo | null>(null);
  const [feeNotePagination, setFeeNotePagination] = useState<api.PaginationInfo | null>(null);
  const [receiptPagination, setReceiptPagination] = useState<api.PaginationInfo | null>(null);


  // Loading states - more granular
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [isLoadingFeeNotes, setIsLoadingFeeNotes] = useState(false);
  const [isLoadingReceipts, setIsLoadingReceipts] = useState(false);
  const [generalError, setGeneralError] = useState<Error | null>(null); // For table-level errors

  // Form/Dialog states
  const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [isFeeNoteFormOpen, setIsFeeNoteFormOpen] = useState(false);
  const [editingFeeNote, setEditingFeeNote] = useState<FeeNote | null>(null);
  const [isReceiptFormOpen, setIsReceiptFormOpen] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);

  const [documentToView, setDocumentToView] = useState<Invoice | FeeNote | Receipt | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<{type: 'invoice'|'feenote'|'receipt', id: string, name?: string} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);


  // --- Form Hooks ---
  const invoiceForm = useForm<InvoiceFormData>({ resolver: zodResolver(invoiceFormSchema), defaultValues: { currency: 'USD', status: 'Draft', lineItems: [{description: '', quantity: 1, unitPrice: 0}] } });
  const { fields: invoiceLineItems, append: appendInvoiceLineItem, remove: removeInvoiceLineItem } = useFieldArray({ control: invoiceForm.control, name: "lineItems" });

  const feeNoteForm = useForm<FeeNoteFormData>({ resolver: zodResolver(feeNoteFormSchema), defaultValues: { currency: 'USD', status: 'Draft', lineItems: [{description: '', quantity: 1, unitPrice: 0}] } });
  const { fields: feeNoteLineItems, append: appendFeeNoteLineItem, remove: removeFeeNoteLineItem } = useFieldArray({ control: feeNoteForm.control, name: "lineItems" });

  const receiptForm = useForm<ReceiptFormData>({ resolver: zodResolver(receiptFormSchema), defaultValues: { currency: 'USD', status: 'Paid', paymentMethod: 'Bank Transfer', lineItems: [{description: '', quantity: 1, unitPrice: 0}] } });
  const { fields: receiptLineItems, append: appendReceiptLineItem, remove: removeReceiptLineItem } = useFieldArray({ control: receiptForm.control, name: "lineItems" });


  // --- Data Fetching ---
  const fetchClientsForDropdown = useCallback(async () => {
    try {
        const clientData = await api.getClients(); // Assuming getClients doesn't require params for all
        setClients(clientData);
    } catch (err) {
        console.error("Failed to fetch clients for dropdown", err);
    }
  }, []);

  const fetchInvoices = useCallback(async (page: number = 1, pageSize: number = 10) => {
    setIsLoadingInvoices(true); setGeneralError(null);
    try {
      const response = await api.getInvoices({page, pageSize} as any); // Cast as any for now if getInvoices mock doesn't expect page/pageSize
      setInvoices(response.data || response); // Adapt to actual response structure from apiService vs mock
      // setInvoicePagination(response.pagination || null); // Assuming pagination comes from response
    }
    catch (err: any) { setGeneralError(err); toast({ title: "Error", description: "Failed to fetch invoices.", variant: "destructive" });}
    finally { setIsLoadingInvoices(false); }
  }, [toast]);

  const fetchFeeNotes = useCallback(async (page: number = 1, pageSize: number = 10) => {
    setIsLoadingFeeNotes(true); setGeneralError(null);
    try {
      const response = await api.getFeeNotes({page, pageSize} as any);
      setFeeNotes(response.data || response);
      // setFeeNotePagination(response.pagination || null);
    }
    catch (err: any) { setGeneralError(err); toast({ title: "Error", description: "Failed to fetch fee notes.", variant: "destructive" });}
    finally { setIsLoadingFeeNotes(false); }
  }, [toast]);

  const fetchReceipts = useCallback(async (page: number = 1, pageSize: number = 10) => {
    setIsLoadingReceipts(true); setGeneralError(null);
    try {
      const response = await api.getReceipts({page, pageSize} as any);
      setReceipts(response.data || response);
      // setReceiptPagination(response.pagination || null);
    }
    catch (err: any) { setGeneralError(err); toast({ title: "Error", description: "Failed to fetch receipts.", variant: "destructive" });}
    finally { setIsLoadingReceipts(false); }
  }, [toast]);

  useEffect(() => {
    fetchClientsForDropdown();
    // Initial fetch for the active tab
    if (activeTab === 'invoices') fetchInvoices();
    else if (activeTab === 'feenotes') fetchFeeNotes();
    else if (activeTab === 'receipts') fetchReceipts();
  }, [activeTab, fetchClientsForDropdown]); // Removed individual fetch functions from deps to avoid loop with initial call

  // Re-fetch when tab changes
  useEffect(() => {
    if (activeTab === 'invoices') fetchInvoices();
    else if (activeTab === 'feenotes') fetchFeeNotes();
    else if (activeTab === 'receipts') fetchReceipts();
  }, [activeTab]);


  // --- Form Submit Handlers ---
  const handleInvoiceFormSubmit = async (data: InvoiceFormData) => {
    try {
      if (editingInvoice) {
        await api.updateInvoice(editingInvoice.id, data);
        toast({ title: "Success", description: "Invoice updated." });
      } else {
        await api.createInvoice(data);
        toast({ title: "Success", description: "Invoice created." });
      }
      setIsInvoiceFormOpen(false); setEditingInvoice(null); invoiceForm.reset(); fetchInvoices();
    } catch (e) { toast({ title: "Error", description: "Failed to save invoice.", variant: "destructive" }); }
  };

  const handleFeeNoteFormSubmit = async (data: FeeNoteFormData) => {
    try {
      if (editingFeeNote) {
        await api.updateFeeNote(editingFeeNote.id, data); // Assuming api.updateFeeNote exists
        toast({ title: "Success", description: "Fee Note updated." });
      } else {
        await api.createFeeNote(data);
        toast({ title: "Success", description: "Fee Note created." });
      }
      setIsFeeNoteFormOpen(false); setEditingFeeNote(null); feeNoteForm.reset(); fetchFeeNotes();
    } catch (e) { toast({ title: "Error", description: "Failed to save Fee Note.", variant: "destructive" }); }
  };

  const handleReceiptFormSubmit = async (data: ReceiptFormData) => {
    try {
      if (editingReceipt) {
        await api.updateReceipt(editingReceipt.id, data); // Assuming api.updateReceipt exists
        toast({ title: "Success", description: "Receipt updated." });
      } else {
        await api.createReceipt(data);
        toast({ title: "Success", description: "Receipt created." });
      }
      setIsReceiptFormOpen(false); setEditingReceipt(null); receiptForm.reset(); fetchReceipts();
      // Potentially re-fetch invoices if a receipt was linked to an invoice to update its status
      if (data.relatedInvoiceId) fetchInvoices();
    } catch (e) { toast({ title: "Error", description: "Failed to save Receipt.", variant: "destructive" }); }
  };

  // --- Delete Handler ---
  const confirmDelete = async () => {
    if (!documentToDelete) return;
    setIsDeleting(true);
    try {
        if(documentToDelete.type === 'invoice') {
            await api.deleteInvoice(documentToDelete.id);
            fetchInvoices();
        } else if (documentToDelete.type === 'feenote') {
            await api.deleteFeeNote(documentToDelete.id);
            fetchFeeNotes();
        } else if (documentToDelete.type === 'receipt') {
            await api.deleteReceipt(documentToDelete.id); // Assuming api.deleteReceipt exists
            fetchReceipts();
        }
        toast({ title: "Success", description: `${documentToDelete.type.charAt(0).toUpperCase() + documentToDelete.type.slice(1)} '${documentToDelete.name || documentToDelete.id}' deleted.` });
    } catch (e) {
        // Error toast handled by apiService interceptor
        console.error(`Failed to delete ${documentToDelete.type}`, e);
    }
    finally {
        setIsDeleting(false);
        setDocumentToDelete(null);
    }
  };

  const handlePrintDocument = (doc: Invoice | FeeNote | Receipt | null) => {
    if (!doc) return;
    toast({ title: "Print Action", description: `Simulating print for ${doc.documentNumber}. Actual print/PDF generation requires dedicated libraries.`});
    // In a real app:
    // 1. Format 'doc' into a printable HTML structure.
    // 2. Open a new window with this HTML.
    // 3. Call window.print() on that new window.
    // OR use a library like jsPDF or react-pdf to generate a PDF.
  };

  // --- Render Helper for Line Items in Form ---
  const renderLineItemsFields = (fields: any[], append: any, remove: any, formControl: any, formRegister: any, formErrors: any) => (
    <div className="space-y-3">
        {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 gap-2 items-start border p-2 rounded-md">
                <div className="col-span-5"><Label htmlFor={`lineItems.${index}.description`}>Description</Label><Input {...formRegister(`lineItems.${index}.description`)} placeholder="Service or product" />{formErrors.lineItems?.[index]?.description && <p className="text-xs text-red-500">{formErrors.lineItems[index].description.message}</p>}</div>
                <div className="col-span-2"><Label htmlFor={`lineItems.${index}.quantity`}>Qty</Label><Input type="number" {...formRegister(`lineItems.${index}.quantity`)} placeholder="1" />{formErrors.lineItems?.[index]?.quantity && <p className="text-xs text-red-500">{formErrors.lineItems[index].quantity.message}</p>}</div>
                <div className="col-span-3"><Label htmlFor={`lineItems.${index}.unitPrice`}>Unit Price</Label><Input type="number" step="0.01" {...formRegister(`lineItems.${index}.unitPrice`)} placeholder="0.00" />{formErrors.lineItems?.[index]?.unitPrice && <p className="text-xs text-red-500">{formErrors.lineItems[index].unitPrice.message}</p>}</div>
                <div className="col-span-2 flex items-end"><Button type="button" variant="destructive" size="sm" onClick={() => remove(index)} disabled={fields.length <=1}><Trash2 className="h-4 w-4"/></Button></div>
            </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Line Item
        </Button>
    </div>
  );

  // --- Main Render ---
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center"><DollarSign className="mr-3 w-8 h-8 text-logistics-primary" />Financial Documents</h1>
        {/* Add button will be tab-specific */}
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="feenotes">Fee Notes</TabsTrigger>
          <TabsTrigger value="receipts">Receipts</TabsTrigger>
        </TabsList>

        {/* Invoices Tab */}
        <TabsContent value="invoices">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div><CardTitle>Invoices</CardTitle><CardDescription>Manage all your invoices.</CardDescription></div>
              <Button onClick={() => { setEditingInvoice(null); invoiceForm.reset({ currency: 'USD', status: 'Draft', lineItems: [{description: '', quantity: 1, unitPrice: 0}] }); setIsInvoiceFormOpen(true); }}><PlusCircle className="mr-2 h-4 w-4" />Create Invoice</Button>
            </CardHeader>
            <CardContent>
              {isLoading === 'invoices' && <Skeleton className="h-20 w-full"/>}
              {error && isLoading !== 'invoices' && <p className="text-red-500">Error loading invoices.</p>}
              {!isLoading && invoices.length === 0 && <p>No invoices found.</p>}
              {!isLoading && invoices.length > 0 && (
                <Table>
                  <TableHeader><TableRow><TableHead>Number</TableHead><TableHead>Client</TableHead><TableHead>Issue Date</TableHead><TableHead>Due Date</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {invoices.map(inv => (
                      <TableRow key={inv.id}>
                        <TableCell>{inv.documentNumber}</TableCell><TableCell>{inv.clientName}</TableCell><TableCell>{new Date(inv.issueDate).toLocaleDateString()}</TableCell><TableCell>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '-'}</TableCell><TableCell>{inv.currency} {inv.totalAmount.toFixed(2)}</TableCell><TableCell><Badge variant={inv.status === 'Paid' ? 'success' : inv.status === 'Overdue' ? 'destructive' : 'outline'}>{inv.status}</Badge></TableCell>
                        <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => setDocumentToView(inv)}><Eye className="h-4 w-4"/></Button>
                            <Button variant="ghost" size="icon" onClick={() => { setEditingInvoice(inv); invoiceForm.reset(inv as any); setIsInvoiceFormOpen(true);}}><Edit className="h-4 w-4"/></Button>
                            <Button variant="ghost" size="icon" onClick={() => setDocumentToDelete({type: 'invoice', id: inv.id})}><Trash2 className="h-4 w-4 text-red-500"/></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* FeeNotes Tab */}
        <TabsContent value="feenotes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div><CardTitle>Fee Notes</CardTitle><CardDescription>Manage all your fee notes.</CardDescription></div>
              <Button onClick={() => { setEditingFeeNote(null); feeNoteForm.reset({ currency: 'USD', status: 'Draft', lineItems: [{description: '', quantity: 1, unitPrice: 0}] }); setIsFeeNoteFormOpen(true); }}><PlusCircle className="mr-2 h-4 w-4" />Create Fee Note</Button>
            </CardHeader>
            <CardContent>
              {isLoadingFeeNotes && <Skeleton className="h-20 w-full"/>}
              {generalError && isLoadingFeeNotes !== true && <p className="text-red-500">Error loading fee notes.</p>}
              {!isLoadingFeeNotes && feeNotes.length === 0 && <p>No fee notes found.</p>}
              {!isLoadingFeeNotes && feeNotes.length > 0 && (
                <Table>
                  <TableHeader><TableRow><TableHead>Number</TableHead><TableHead>Client</TableHead><TableHead>Issue Date</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {feeNotes.map(fn => (
                      <TableRow key={fn.id}>
                        <TableCell>{fn.documentNumber}</TableCell><TableCell>{fn.clientName}</TableCell><TableCell>{new Date(fn.issueDate).toLocaleDateString()}</TableCell><TableCell>{fn.currency} {fn.totalAmount.toFixed(2)}</TableCell><TableCell><Badge variant={fn.status === 'Paid' ? 'success' : fn.status === 'Overdue' ? 'destructive' : 'outline'}>{fn.status}</Badge></TableCell>
                        <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => setDocumentToView(fn)}><Eye className="h-4 w-4"/></Button>
                            <Button variant="ghost" size="icon" onClick={() => { setEditingFeeNote(fn); feeNoteForm.reset(fn as any); setIsFeeNoteFormOpen(true);}}><Edit className="h-4 w-4"/></Button>
                            <Button variant="ghost" size="icon" onClick={() => setDocumentToDelete({type: 'feenote', id: fn.id, name: fn.documentNumber})}><Trash2 className="h-4 w-4 text-red-500"/></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Receipts Tab */}
        <TabsContent value="receipts">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div><CardTitle>Receipts</CardTitle><CardDescription>Manage all your payment receipts.</CardDescription></div>
              <Button onClick={() => { setEditingReceipt(null); receiptForm.reset({ currency: 'USD', status: 'Paid', paymentMethod: 'Bank Transfer', lineItems: [{description: 'Payment Received', quantity: 1, unitPrice: 0}] }); setIsReceiptFormOpen(true); }}><PlusCircle className="mr-2 h-4 w-4" />Create Receipt</Button>
            </CardHeader>
            <CardContent>
              {isLoadingReceipts && <Skeleton className="h-20 w-full"/>}
              {generalError && !isLoadingReceipts && <p className="text-red-500">Error loading receipts.</p>}
              {!isLoadingReceipts && receipts.length === 0 && <p>No receipts found.</p>}
              {!isLoadingReceipts && receipts.length > 0 && (
                <Table>
                  <TableHeader><TableRow><TableHead>Number</TableHead><TableHead>Client</TableHead><TableHead>Payment Date</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {receipts.map(rec => (
                      <TableRow key={rec.id}>
                        <TableCell>{rec.documentNumber}</TableCell><TableCell>{rec.clientName}</TableCell><TableCell>{new Date(rec.paymentDate).toLocaleDateString()}</TableCell><TableCell>{rec.currency} {rec.totalAmount.toFixed(2)}</TableCell><TableCell>{rec.paymentMethod}</TableCell>
                        <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => setDocumentToView(rec)}><Eye className="h-4 w-4"/></Button>
                            <Button variant="ghost" size="icon" onClick={() => { setEditingReceipt(rec); receiptForm.reset(rec as any); setIsReceiptFormOpen(true);}}><Edit className="h-4 w-4"/></Button>
                            <Button variant="ghost" size="icon" onClick={() => setDocumentToDelete({type: 'receipt', id: rec.id, name: rec.documentNumber})}><Trash2 className="h-4 w-4 text-red-500"/></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invoice Form Dialog */}
      <Dialog open={isInvoiceFormOpen} onOpenChange={(isOpen) => { if(!isOpen) setEditingInvoice(null); setIsInvoiceFormOpen(isOpen); }}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader><DialogTitle>{editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}</DialogTitle></DialogHeader>
          <form onSubmit={invoiceForm.handleSubmit(handleInvoiceFormSubmit)} className="space-y-4 py-4 max-h-[80vh] overflow-y-auto pr-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="invClientId">Client</Label><Controller name="clientId" control={invoiceForm.control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue placeholder="Select client"/></SelectTrigger><SelectContent>{clients.map(c=><SelectItem key={c.id} value={c.id}>{c.name} ({c.id})</SelectItem>)}</SelectContent></Select>)} />{invoiceForm.formState.errors.clientId && <p className="text-xs text-red-500">{invoiceForm.formState.errors.clientId.message}</p>}</div>
                <div><Label htmlFor="invStatus">Status</Label><Controller name="status" control={invoiceForm.control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue placeholder="Select status"/></SelectTrigger><SelectContent>{documentStatusOptions.map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>)} />{invoiceForm.formState.errors.status && <p className="text-xs text-red-500">{invoiceForm.formState.errors.status.message}</p>}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><Label htmlFor="invIssueDate">Issue Date</Label><Input id="invIssueDate" type="date" {...invoiceForm.register('issueDate')} />{invoiceForm.formState.errors.issueDate && <p className="text-xs text-red-500">{invoiceForm.formState.errors.issueDate.message}</p>}</div>
                <div><Label htmlFor="invDueDate">Due Date (Optional)</Label><Input id="invDueDate" type="date" {...invoiceForm.register('dueDate')} /></div>
                <div><Label htmlFor="invCurrency">Currency</Label><Input id="invCurrency" {...invoiceForm.register('currency')} placeholder="USD" />{invoiceForm.formState.errors.currency && <p className="text-xs text-red-500">{invoiceForm.formState.errors.currency.message}</p>}</div>
            </div>

            <Separator />
            <Label className="text-lg font-medium">Line Items</Label>
            {renderLineItemsFields(invoiceLineItems, appendInvoiceLineItem, removeInvoiceLineItem, invoiceForm.control, invoiceForm.register, invoiceForm.formState.errors)}
            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="invTaxRate">Tax Rate (Optional, e.g., 0.07 for 7%)</Label><Input id="invTaxRate" type="number" step="0.001" placeholder="0.00" {...invoiceForm.register('taxRate')} /></div>
                <div><Label htmlFor="invPaymentTerms">Payment Terms (Optional)</Label><Input id="invPaymentTerms" {...invoiceForm.register('paymentTerms')} placeholder="e.g., Net 30" /></div>
            </div>
            <div><Label htmlFor="invNotes">Notes (Optional)</Label><Textarea id="invNotes" {...invoiceForm.register('notes')} /></div>
            <DialogFooter><DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose><Button type="submit" disabled={invoiceForm.formState.isSubmitting}>{invoiceForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Invoice</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* FeeNote Form Dialog */}
      <Dialog open={isFeeNoteFormOpen} onOpenChange={(isOpen) => { if(!isOpen) setEditingFeeNote(null); setIsFeeNoteFormOpen(isOpen); }}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader><DialogTitle>{editingFeeNote ? 'Edit Fee Note' : 'Create New Fee Note'}</DialogTitle></DialogHeader>
          <form onSubmit={feeNoteForm.handleSubmit(handleFeeNoteFormSubmit)} className="space-y-4 py-4 max-h-[80vh] overflow-y-auto pr-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="fnClientId">Client</Label><Controller name="clientId" control={feeNoteForm.control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue placeholder="Select client"/></SelectTrigger><SelectContent>{clients.map(c=><SelectItem key={c.id} value={c.id}>{c.name} ({c.id})</SelectItem>)}</SelectContent></Select>)} />{feeNoteForm.formState.errors.clientId && <p className="text-xs text-red-500">{feeNoteForm.formState.errors.clientId.message}</p>}</div>
                <div><Label htmlFor="fnStatus">Status</Label><Controller name="status" control={feeNoteForm.control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue placeholder="Select status"/></SelectTrigger><SelectContent>{documentStatusOptions.map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>)} />{feeNoteForm.formState.errors.status && <p className="text-xs text-red-500">{feeNoteForm.formState.errors.status.message}</p>}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><Label htmlFor="fnIssueDate">Issue Date</Label><Input id="fnIssueDate" type="date" {...feeNoteForm.register('issueDate')} />{feeNoteForm.formState.errors.issueDate && <p className="text-xs text-red-500">{feeNoteForm.formState.errors.issueDate.message}</p>}</div>
                <div><Label htmlFor="fnDueDate">Due Date (Optional)</Label><Input id="fnDueDate" type="date" {...feeNoteForm.register('dueDate')} /></div>
                <div><Label htmlFor="fnCurrency">Currency</Label><Input id="fnCurrency" {...feeNoteForm.register('currency')} placeholder="USD" />{feeNoteForm.formState.errors.currency && <p className="text-xs text-red-500">{feeNoteForm.formState.errors.currency.message}</p>}</div>
            </div>
            <div>
                <Label htmlFor="fnRelatedInvoiceId">Related Invoice (Optional)</Label>
                <Controller
                    name="relatedInvoiceId"
                    control={feeNoteForm.control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                            <SelectTrigger id="fnRelatedInvoiceId">
                                <SelectValue placeholder="Select related invoice..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">None</SelectItem>
                                {invoices
                                    .filter(inv => inv.clientId === feeNoteForm.watch('clientId'))
                                    .map(inv => <SelectItem key={inv.id} value={inv.id}>{inv.documentNumber} ({inv.clientName}) - {inv.currency} {inv.totalAmount.toFixed(2)}</SelectItem>)
                                }
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>

            <Separator />
            <Label className="text-lg font-medium">Line Items</Label>
            {renderLineItemsFields(feeNoteLineItems, appendFeeNoteLineItem, removeFeeNoteLineItem, feeNoteForm.control, feeNoteForm.register, feeNoteForm.formState.errors)}
            <Separator />

            <div><Label htmlFor="fnTaxRate">Tax Rate (Optional, e.g., 0.07 for 7%)</Label><Input id="fnTaxRate" type="number" step="0.001" placeholder="0.00" {...feeNoteForm.register('taxRate')} /></div>
            <div><Label htmlFor="fnNotes">Notes (Optional)</Label><Textarea id="fnNotes" {...feeNoteForm.register('notes')} /></div>
            <DialogFooter><DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose><Button type="submit" disabled={feeNoteForm.formState.isSubmitting}>{feeNoteForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Fee Note</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Receipt Form Dialog */}
      <Dialog open={isReceiptFormOpen} onOpenChange={(isOpen) => { if(!isOpen) setEditingReceipt(null); setIsReceiptFormOpen(isOpen); }}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader><DialogTitle>{editingReceipt ? 'Edit Receipt' : 'Create New Receipt'}</DialogTitle></DialogHeader>
          <form onSubmit={receiptForm.handleSubmit(handleReceiptFormSubmit)} className="space-y-4 py-4 max-h-[80vh] overflow-y-auto pr-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="recClientId">Client</Label><Controller name="clientId" control={receiptForm.control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue placeholder="Select client"/></SelectTrigger><SelectContent>{clients.map(c=><SelectItem key={c.id} value={c.id}>{c.name} ({c.id})</SelectItem>)}</SelectContent></Select>)} />{receiptForm.formState.errors.clientId && <p className="text-xs text-red-500">{receiptForm.formState.errors.clientId.message}</p>}</div>
                <div><Label htmlFor="recPaymentDate">Payment Date</Label><Input id="recPaymentDate" type="date" {...receiptForm.register('paymentDate')} />{receiptForm.formState.errors.paymentDate && <p className="text-xs text-red-500">{receiptForm.formState.errors.paymentDate.message}</p>}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="recPaymentMethod">Payment Method</Label><Input id="recPaymentMethod" {...receiptForm.register('paymentMethod')} placeholder="e.g., Bank Transfer, Credit Card" />{receiptForm.formState.errors.paymentMethod && <p className="text-xs text-red-500">{receiptForm.formState.errors.paymentMethod.message}</p>}</div>
                <div><Label htmlFor="recCurrency">Currency</Label><Input id="recCurrency" {...receiptForm.register('currency')} placeholder="USD" />{receiptForm.formState.errors.currency && <p className="text-xs text-red-500">{receiptForm.formState.errors.currency.message}</p>}</div>
            </div>
            <div><Label htmlFor="recIssueDate">Issue Date (Receipt Date)</Label><Input id="recIssueDate" type="date" {...receiptForm.register('issueDate')} />{receiptForm.formState.errors.issueDate && <p className="text-xs text-red-500">{receiptForm.formState.errors.issueDate.message}</p>}</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="recRelatedInvoiceId">Related Invoice (Optional)</Label>
                    <Controller
                        name="relatedInvoiceId"
                        control={receiptForm.control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                                <SelectTrigger id="recRelatedInvoiceId"><SelectValue placeholder="Select related invoice..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">None</SelectItem>
                                    {invoices
                                        .filter(inv => inv.clientId === receiptForm.watch('clientId'))
                                        .map(inv => <SelectItem key={inv.id} value={inv.id}>{inv.documentNumber} ({inv.clientName})</SelectItem>)
                                    }
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
                <div>
                    <Label htmlFor="recRelatedFeeNoteId">Related Fee Note (Optional)</Label>
                     <Controller
                        name="relatedFeeNoteId"
                        control={receiptForm.control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                                <SelectTrigger id="recRelatedFeeNoteId"><SelectValue placeholder="Select related fee note..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">None</SelectItem>
                                    {feeNotes
                                        .filter(fn => fn.clientId === receiptForm.watch('clientId'))
                                        .map(fn => <SelectItem key={fn.id} value={fn.id}>{fn.documentNumber} ({fn.clientName})</SelectItem>)
                                    }
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
            </div>

            <Separator />
            <Label className="text-lg font-medium">Payment Details / Line Items</Label>
            {renderLineItemsFields(receiptLineItems, appendReceiptLineItem, removeReceiptLineItem, receiptForm.control, receiptForm.register, receiptForm.formState.errors)}
            <Separator />

            <div><Label htmlFor="recNotes">Notes (Optional)</Label><Textarea id="recNotes" {...receiptForm.register('notes')} /></div>
            <DialogFooter><DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose><Button type="submit" disabled={receiptForm.formState.isSubmitting}>{receiptForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Receipt</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Document Dialog (Generic for Invoice/FeeNote/Receipt) */}
      <Dialog open={!!documentToView} onOpenChange={(isOpen) => { if(!isOpen) setDocumentToView(null);}}>
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>Document: {documentToView?.documentNumber}</DialogTitle>
                <DialogDescription>Client: {documentToView?.clientName} ({documentToView?.clientId}) | Status: <Badge variant={documentToView?.status === 'Paid' ? 'success' : documentToView?.status === 'Overdue' ? 'destructive' : 'outline'}>{documentToView?.status}</Badge></DialogDescription>
            </DialogHeader>
            <div className="py-4 max-h-[70vh] overflow-y-auto pr-2 space-y-3">
                <p><strong>Type:</strong> {
                    documentToView && 'paymentDate' in documentToView ? 'Receipt' : documentToView && 'relatedInvoiceId' in documentToView && !( 'paymentDate' in documentToView) ? 'Fee Note' : 'Invoice'
                }</p>
                <p><strong>Issue Date:</strong> {documentToView && new Date(documentToView.issueDate).toLocaleDateString()}</p>
                {documentToView?.dueDate && <p><strong>Due Date:</strong> {new Date(documentToView.dueDate).toLocaleDateString()}</p>}
                {(documentToView as Receipt)?.paymentDate && <p><strong>Payment Date:</strong> {new Date((documentToView as Receipt).paymentDate).toLocaleDateString()}</p>}
                {(documentToView as Receipt)?.paymentMethod && <p><strong>Payment Method:</strong> {(documentToView as Receipt).paymentMethod}</p>}
                {(documentToView as Invoice)?.paymentTerms && <p><strong>Payment Terms:</strong> {(documentToView as Invoice).paymentTerms}</p>}

                <Label className="font-semibold">Line Items:</Label>
                <Table size="sm"><TableHeader><TableRow><TableHead>Description</TableHead><TableHead className="text-right">Qty</TableHead><TableHead className="text-right">Unit Price</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {documentToView?.lineItems.map(item => (
                            <TableRow key={item.id}><TableCell>{item.description}</TableCell><TableCell className="text-right">{item.quantity}</TableCell><TableCell className="text-right">{documentToView.currency} {item.unitPrice.toFixed(2)}</TableCell><TableCell className="text-right">{documentToView.currency} {item.total.toFixed(2)}</TableCell></TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div className="text-right space-y-1 pr-2">
                    <p><strong>Subtotal:</strong> {documentToView?.currency} {documentToView?.subtotal.toFixed(2)}</p>
                    {documentToView?.taxAmount !== undefined && <p><strong>Tax ({((documentToView?.taxRate || 0) * 100).toFixed(1)}%):</strong> {documentToView?.currency} {documentToView.taxAmount.toFixed(2)}</p>}
                    <p className="text-lg font-bold"><strong>Total:</strong> {documentToView?.currency} {documentToView?.totalAmount.toFixed(2)}</p>
                </div>
                {documentToView?.notes && <><Label className="font-semibold">Notes:</Label><p className="text-sm p-2 border rounded-md bg-slate-50 whitespace-pre-wrap">{documentToView.notes}</p></>}

                {/* Displaying Linked Document IDs */}
                {(documentToView as Invoice)?.linkedFeeNoteIds && (documentToView as Invoice).linkedFeeNoteIds!.length > 0 && (
                    <div><Label className="font-semibold">Linked Fee Notes:</Label><p className="text-sm">{(documentToView as Invoice).linkedFeeNoteIds!.join(', ')}</p></div>
                )}
                {(documentToView as Invoice)?.linkedReceiptIds && (documentToView as Invoice).linkedReceiptIds!.length > 0 && (
                    <div><Label className="font-semibold">Linked Receipts:</Label><p className="text-sm">{(documentToView as Invoice).linkedReceiptIds!.join(', ')}</p></div>
                )}
                {(documentToView as FeeNote)?.relatedInvoiceId && (
                    <div><Label className="font-semibold">Related Invoice:</Label><p className="text-sm">{(documentToView as FeeNote).relatedInvoiceId}</p></div>
                )}
                {(documentToView as Receipt)?.relatedInvoiceId && (
                    <div><Label className="font-semibold">Related Invoice:</Label><p className="text-sm">{(documentToView as Receipt).relatedInvoiceId}</p></div>
                )}
                 {(documentToView as Receipt)?.relatedFeeNoteId && (
                    <div><Label className="font-semibold">Related Fee Note:</Label><p className="text-sm">{(documentToView as Receipt).relatedFeeNoteId}</p></div>
                )}
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handlePrintDocument(documentToView)}><Printer className="mr-2 h-4 w-4"/>Print (Simulated)</Button>
                <DialogClose asChild><Button type="button">Close</Button></DialogClose>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!documentToDelete} onOpenChange={(isOpen) => { if(!isOpen) setDocumentToDelete(null);}}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Document?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this financial document.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default FinancialsPage;
