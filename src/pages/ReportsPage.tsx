
import React from 'react';
import { FileText, Download, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ReportsPage = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800">Reports</h2>
        <Button className="bg-logistics-primary hover:bg-logistics-primary/90">
          <Download className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-logistics-primary" />
              Shipment Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Generate detailed reports on shipment performance and metrics.
            </p>
            <Button variant="outline" size="sm">View Reports</Button>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-logistics-primary" />
              Performance Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Analyze delivery times, success rates, and operational efficiency.
            </p>
            <Button variant="outline" size="sm">View Analytics</Button>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-logistics-primary" />
              Monthly Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Monthly overview of all logistics operations and KPIs.
            </p>
            <Button variant="outline" size="sm">View Summary</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;
