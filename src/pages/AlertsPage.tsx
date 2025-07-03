
import React from 'react';
import { AlertTriangle, Bell, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const AlertsPage = () => {
  const alerts = [
    {
      id: 1,
      title: 'Delayed Shipment',
      message: 'Shipment SH001 is running 2 hours behind schedule',
      severity: 'High',
      timestamp: '2 minutes ago',
      status: 'active'
    },
    {
      id: 2,
      title: 'Route Optimization',
      message: 'New optimal route available for delivery batch DB-45',
      severity: 'Medium',
      timestamp: '15 minutes ago',
      status: 'active'
    },
    {
      id: 3,
      title: 'System Maintenance',
      message: 'Scheduled maintenance completed successfully',
      severity: 'Info',
      timestamp: '1 hour ago',
      status: 'resolved'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'destructive';
      case 'Medium': return 'secondary';
      case 'Info': return 'outline';
      default: return 'default';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800">Alerts & Notifications</h2>
        <Button variant="outline">
          <Bell className="w-4 h-4 mr-2" />
          Mark All Read
        </Button>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <Card key={alert.id} className="card-hover">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 mt-0.5 text-amber-600" />
                  <div>
                    <CardTitle className="text-lg">{alert.title}</CardTitle>
                    <p className="text-sm text-slate-600 mt-1">{alert.message}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getSeverityColor(alert.severity)}>
                    {alert.severity}
                  </Badge>
                  {alert.status === 'resolved' ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{alert.timestamp}</span>
                <div className="space-x-2">
                  <Button variant="outline" size="sm">Dismiss</Button>
                  <Button variant="default" size="sm">View Details</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AlertsPage;
