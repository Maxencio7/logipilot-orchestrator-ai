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

  // Loading states
  const [isLoading, setIsLoading] = useState<'invoices'|'feenotes'|'receipts'|false>(false);
  const [error, setError] = useState<Error | null>(null);

  // Form/Dialog states
  const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [isFeeNoteFormOpen, setIsFeeNoteFormOpen] = useState(false);
  const [editingFeeNote, setEditingFeeNote] = useState<FeeNote | null>(null);
  const [isReceiptFormOpen, setIsReceiptFormOpen] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);

  const [documentToView, setDocumentToView] = useState<Invoice | FeeNote | Receipt | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<{type: 'invoice'|'feenote'|'receipt', id: string} | null>(null);


  // --- Form Hooks ---
  const invoiceForm = useForm<InvoiceFormData>({ resolver: zodResolver(invoiceFormSchema), defaultValues: { currency: 'USD', status: 'Draft', lineItems: [{description: '', quantity: 1, unitPrice: 0}] } });
  const { fields: invoiceLineItems, append: appendInvoiceLineItem, remove: removeInvoiceLineItem } = useFieldArray({ control: invoiceForm.control, name: "lineItems" });

  // Similar forms for FeeNote and Receipt would be needed
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

  const fetchInvoices = useCallback(async () => {
    setIsLoading('invoices'); setError(null);
    try { const data = await api.getInvoices(); setInvoices(data); }
    catch (err: any) { setError(err); toast({ title: "Error", description: "Failed to fetch invoices.", variant: "destructive" });}
    finally { setIsLoading(false); }
  }, [toast]);

  const fetchFeeNotes = useCallback(async () => {
    setIsLoading('feenotes'); setError(null);
    try { const data = await api.getFeeNotes(); setFeeNotes(data); }
    catch (err: any) { setError(err); toast({ title: "Error", description: "Failed to fetch fee notes.", variant: "destructive" });}
    finally { setIsLoading(false); }
  }, [toast]);

  const fetchReceipts = useCallback(async () => {
    setIsLoading('receipts'); setError(null);
    try { const data = await api.getReceipts(); setReceipts(data); }
    catch (err: any) { setError(err); toast({ title: "Error", description: "Failed to fetch receipts.", variant: "destructive" });}
    finally { setIsLoading(false); }
  }, [toast]);

  useEffect(() => {
    fetchClientsForDropdown();
    if (activeTab === 'invoices') fetchInvoices();
    else if (activeTab === 'feenotes') fetchFeeNotes();
    else if (activeTab === 'receipts') fetchReceipts();
  }, [activeTab, fetchInvoices, fetchFeeNotes, fetchReceipts, fetchClientsForDropdown]);


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
  // TODO: handleFeeNoteFormSubmit, handleReceiptFormSubmit

  // --- Delete Handler ---
  const confirmDelete = async () => {
    if (!documentToDelete) return;
    try {
        if(documentToDelete.type === 'invoice') await api.deleteInvoice(documentToDelete.id);
        // TODO: Add delete for feenote and receipt
        toast({ title: "Success", description: `${documentToDelete.type.charAt(0).toUpperCase() + documentToDelete.type.slice(1)} deleted.` });
        if(documentToDelete.type === 'invoice') fetchInvoices();
        // TODO: Fetch others
    } catch (e) { toast({ title: "Error", description: `Failed to delete ${documentToDelete.type}.`, variant: "destructive" }); }
    setDocumentToDelete(null);
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
        {/* TODO: FeeNotes and Receipts Tabs - similar structure */}
         <TabsContent value="feenotes"><Card><CardHeader><CardTitle>Fee Notes</CardTitle><CardDescription>Coming Soon</CardDescription></CardHeader><CardContent><p>Fee Note Management will be here.</p></CardContent></Card></TabsContent>
         <TabsContent value="receipts"><Card><CardHeader><CardTitle>Receipts</CardTitle><CardDescription>Coming Soon</CardDescription></CardHeader><CardContent><p>Receipt Management will be here.</p></CardContent></Card></TabsContent>
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

      {/* View Document Dialog (Generic for Invoice/FeeNote/Receipt) */}
      <Dialog open={!!documentToView} onOpenChange={(isOpen) => { if(!isOpen) setDocumentToView(null);}}>
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>Document: {documentToView?.documentNumber}</DialogTitle>
                <DialogDescription>Client: {documentToView?.clientName} ({documentToView?.clientId}) | Status: <Badge variant={documentToView?.status === 'Paid' ? 'success' : documentToView?.status === 'Overdue' ? 'destructive' : 'outline'}>{documentToView?.status}</Badge></DialogDescription>
            </DialogHeader>
            <div className="py-4 max-h-[70vh] overflow-y-auto pr-2 space-y-3">
                <p><strong>Issue Date:</strong> {documentToView && new Date(documentToView.issueDate).toLocaleDateString()}</p>
                {documentToView?.dueDate && <p><strong>Due Date:</strong> {new Date(documentToView.dueDate).toLocaleDateString()}</p>}
                {(documentToView as Receipt)?.paymentDate && <p><strong>Payment Date:</strong> {new Date((documentToView as Receipt).paymentDate).toLocaleDateString()}</p>}
                {(documentToView as Receipt)?.paymentMethod && <p><strong>Payment Method:</strong> {(documentToView as Receipt).paymentMethod}</p>}

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
