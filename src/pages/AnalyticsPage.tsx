
import React from 'react';
import { BarChart3, TrendingUp, PieChart, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AnalyticsPage = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800">Analytics Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">On-Time Delivery</p>
                <p className="text-2xl font-bold text-slate-900">94.2%</p>
                <p className="text-sm text-green-600">+2.1% from last month</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Cost Efficiency</p>
                <p className="text-2xl font-bold text-slate-900">87.5%</p>
                <p className="text-sm text-green-600">+1.8% from last month</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Client Satisfaction</p>
                <p className="text-2xl font-bold text-slate-900">4.8/5</p>
                <p className="text-sm text-green-600">+0.2 from last month</p>
              </div>
              <div className="p-3 rounded-full bg-amber-100">
                <Activity className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Route Optimization</p>
                <p className="text-2xl font-bold text-slate-900">92.1%</p>
                <p className="text-sm text-green-600">+3.4% from last month</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <PieChart className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-slate-50 rounded">
              <p className="text-slate-500">Chart visualization will be implemented here</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Regional Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-slate-50 rounded">
              <p className="text-slate-500">Regional analytics chart will be implemented here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;
