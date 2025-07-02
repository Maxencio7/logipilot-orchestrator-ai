// src/pages/ReportsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle, Edit, Trash2, Search, FileText, MoreHorizontal, Loader2, ServerCrash, Filter, UploadCloud, Sparkles, Eye } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Report, ReportFormData, ReportType, ReportUrgency, ReportDepartment } from '@/types';
import * as api from '@/api/mockService'; // Assuming API functions are here
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/components/ui/use-toast";

const reportTypeOptions: ReportType[] = ['Daily Task', 'Weekly Summary', 'Incident', 'Feedback', 'Other'];
const reportUrgencyOptions: ReportUrgency[] = ['Low', 'Medium', 'High', 'Critical'];
const reportDepartmentOptions: ReportDepartment[] = ['Operations', 'Logistics', 'Customer Service', 'Fleet Management', 'Admin', 'Sales'];

const reportFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  department: z.string().min(1, 'Department is required'),
  type: z.string().min(1, 'Report type is required'),
  urgency: z.string().min(1, 'Urgency level is required'),
  content: z.string().min(10, 'Report content must be at least 10 characters'),
  tags: z.string().optional(), // Comma-separated
});


const ReportsPage = () => {
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingReport, setViewingReport] = useState<Report | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [currentSummary, setCurrentSummary] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<ReportDepartment | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ReportType | 'all'>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<ReportUrgency | 'all'>('all');


  const { control, handleSubmit, register, reset, formState: { errors, isSubmitting } } = useForm<ReportFormData>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      title: '',
      department: reportDepartmentOptions[0],
      type: reportTypeOptions[0],
      urgency: reportUrgencyOptions[0],
      content: '',
      tags: '',
    },
  });

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters = {
        query: searchTerm || undefined,
        department: departmentFilter === 'all' ? undefined : departmentFilter,
        type: typeFilter === 'all' ? undefined : typeFilter,
        urgency: urgencyFilter === 'all' ? undefined : urgencyFilter,
      };
      const data = await api.getReports(filters);
      setReports(data);
    } catch (err: any) {
      setError(err);
      toast({ title: "Error", description: "Failed to fetch reports.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, departmentFilter, typeFilter, urgencyFilter, toast]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleFormSubmit = async (data: ReportFormData) => {
    // Convert comma-separated tags string to array
    const reportDataWithTagsArray = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
    };
    try {
      // Assuming submittedBy is handled by the backend or mock service
      await api.submitReport(reportDataWithTagsArray, "Current User Mock");
      toast({ title: "Success", description: "Report submitted successfully." });
      setIsFormOpen(false);
      reset();
      fetchReports(); // Refresh list
    } catch (e) {
      console.error("Failed to submit report:", e);
      toast({ title: "Error", description: "Failed to submit report.", variant: "destructive" });
    }
  };

  const handleViewReport = (report: Report) => {
    setViewingReport(report);
    setCurrentSummary(report.summary || null); // Show existing summary if any
  };

  const handleSummarizeReport = async () => {
    if (!viewingReport) return;
    setIsSummarizing(true);
    setCurrentSummary(null); // Clear previous summary
    try {
        const summary = await api.summarizeReportWithAI(viewingReport.content);
        setCurrentSummary(summary);
        // Optionally, update the report in the main list if summaries are persisted
        // For now, just display it in the dialog
        toast({ title: "Summary Generated", description: "AI summary created for the report." });
    } catch (e) {
        toast({ title: "Error", description: "Failed to generate AI summary.", variant: "destructive" });
    } finally {
        setIsSummarizing(false);
    }
  };

  const getUrgencyBadge = (urgency: ReportUrgency) => {
    switch (urgency) {
      case 'Critical': return <Badge variant="destructive" className="capitalize">{urgency}</Badge>;
      case 'High': return <Badge variant="warning" className="capitalize">{urgency}</Badge>; // Custom variant or map to existing
      case 'Medium': return <Badge variant="info" className="capitalize">{urgency}</Badge>;
      case 'Low':
      default:
        return <Badge variant="secondary" className="capitalize">{urgency}</Badge>;
    }
  };

  if (error && reports.length === 0) { // Show full page error only if initial load fails
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full text-red-500">
        <ServerCrash className="w-16 h-16 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Error Loading Reports</h2>
        <p>{error.message}</p>
        <Button onClick={fetchReports} className="mt-4">Try Again</Button>
      </div>
    );
  }

  const renderTableBody = () => {
     if (isLoading && reports.length === 0) {
      return Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={`skeleton-${i}`}>
          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
        </TableRow>
      ));
    }
    if(reports.length === 0) {
        return <TableRow><TableCell colSpan={6} className="text-center h-24">No reports found.</TableCell></TableRow>;
    }
    return reports.map((report) => (
        <TableRow key={report.id}>
          <TableCell className="font-medium">{report.title}</TableCell>
          <TableCell>{report.type}</TableCell>
          <TableCell>{report.department}</TableCell>
          <TableCell>{getUrgencyBadge(report.urgency)}</TableCell>
          <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
          <TableCell>
            <Button variant="outline" size="sm" onClick={() => handleViewReport(report)}>
                <Eye className="mr-2 h-4 w-4" /> View
            </Button>
          </TableCell>
        </TableRow>
      ));
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center"><FileText className="mr-3 w-8 h-8 text-logistics-primary" />Manage Reports</h1>
        <Button onClick={() => { reset(); setIsFormOpen(true); }}>
          <PlusCircle className="mr-2 h-4 w-4" /> Submit New Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submitted Reports</CardTitle>
          <CardDescription>View, search, and manage all submitted reports.</CardDescription>
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-4">
            <div className="relative flex-1 md:col-span-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search reports..."
                    className="pl-8 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Select value={departmentFilter} onValueChange={(value: ReportDepartment | 'all') => setDepartmentFilter(value)}>
                <SelectTrigger><SelectValue placeholder="Filter by Department" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {reportDepartmentOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(value: ReportType | 'all') => setTypeFilter(value)}>
                <SelectTrigger><SelectValue placeholder="Filter by Type" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {reportTypeOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
            </Select>
            {/* <Select value={urgencyFilter} onValueChange={(value: ReportUrgency | 'all') => setUrgencyFilter(value)}>
                <SelectTrigger><SelectValue placeholder="Filter by Urgency" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Urgencies</SelectItem>
                    {reportUrgencyOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
            </Select> */}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderTableBody()}
            </TableBody>
          </Table>
          {isLoading && reports.length > 0 && <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-logistics-primary" /></div>}
        </CardContent>
      </Card>

      {/* Submit Report Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit New Report</DialogTitle>
            <DialogDescription>Fill in the details of your report below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div>
              <Label htmlFor="title">Report Title</Label>
              <Input id="title" {...register('title')} className={errors.title ? 'border-red-500' : ''} />
              {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="type">Report Type</Label>
                <Controller name="type" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} >
                        <SelectTrigger id="type" className={errors.type ? 'border-red-500' : ''}><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>{reportTypeOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                )} />
                {errors.type && <p className="text-sm text-red-500 mt-1">{errors.type.message}</p>}
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                 <Controller name="department" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} >
                        <SelectTrigger id="department" className={errors.department ? 'border-red-500' : ''}><SelectValue placeholder="Select department" /></SelectTrigger>
                        <SelectContent>{reportDepartmentOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                )} />
                {errors.department && <p className="text-sm text-red-500 mt-1">{errors.department.message}</p>}
              </div>
              <div>
                <Label htmlFor="urgency">Urgency</Label>
                <Controller name="urgency" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} >
                        <SelectTrigger id="urgency" className={errors.urgency ? 'border-red-500' : ''}><SelectValue placeholder="Select urgency" /></SelectTrigger>
                        <SelectContent>{reportUrgencyOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                )} />
                {errors.urgency && <p className="text-sm text-red-500 mt-1">{errors.urgency.message}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="content">Report Content</Label>
              <Textarea id="content" {...register('content')} rows={8} className={errors.content ? 'border-red-500' : ''} />
              {errors.content && <p className="text-sm text-red-500 mt-1">{errors.content.message}</p>}
            </div>
            <div>
                <Label htmlFor="tags">Tags (Optional, comma-separated)</Label>
                <Input id="tags" {...register('tags')} placeholder="e.g., daily, ops, client-xyz" />
            </div>
            <div>
                <Label>Attachments (Mock UI)</Label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="text-sm text-gray-600">Drag & drop files here, or click to select files</p>
                        <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB (Feature not implemented)</p>
                    </div>
                </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Submit Report
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Report Dialog */}
      <Dialog open={!!viewingReport} onOpenChange={(isOpen) => { if(!isOpen) setViewingReport(null); setCurrentSummary(null); }}>
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>{viewingReport?.title}</DialogTitle>
                <DialogDescription>
                    Submitted by {viewingReport?.submittedBy} on {viewingReport && new Date(viewingReport.date).toLocaleDateString()}
                     <br/> Type: {viewingReport?.type} | Department: {viewingReport?.department} | Urgency: {viewingReport?.urgency}
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 max-h-[60vh] overflow-y-auto pr-2 space-y-4">
                <Card>
                    <CardHeader><CardTitle className="text-lg">Full Report Content</CardTitle></CardHeader>
                    <CardContent className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                        {viewingReport?.content}
                    </CardContent>
                </Card>

                {viewingReport?.attachments && viewingReport.attachments.length > 0 && (
                    <Card>
                        <CardHeader><CardTitle className="text-lg">Attachments</CardTitle></CardHeader>
                        <CardContent>
                            <ul className="list-disc pl-5">
                                {viewingReport.attachments.map(att => <li key={att.fileName}><a href={att.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{att.fileName}</a></li>)}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg">AI Summary</CardTitle>
                        <Button size="sm" onClick={handleSummarizeReport} disabled={isSummarizing || !viewingReport}>
                            {isSummarizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            {currentSummary ? 'Re-summarize' : 'Generate Summary'}
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {isSummarizing && !currentSummary && <p className="text-sm text-gray-500 italic">AI is generating summary...</p>}
                        {currentSummary ? (
                            <p className="text-sm whitespace-pre-wrap">{currentSummary}</p>
                        ) : (
                            !isSummarizing && <p className="text-sm text-gray-500 italic">Click "Generate Summary" to use AI.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportsPage;
