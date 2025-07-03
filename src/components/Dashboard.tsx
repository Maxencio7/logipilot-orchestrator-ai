
import React, { useEffect, useState } from 'react';
import { 
  Package, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Truck,
  Loader2, // For loading spinner
  ServerCrash // For error icon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Metric, ShipmentPreview, AlertPreview, SummaryData, ApiResponse } from '@/types'; // Added ApiResponse
import apiService from '@/api/apiService'; // Changed from mockService
import { Skeleton } from '@/components/ui/skeleton';

// Mapping icon names from data to actual Lucide components
const iconComponents: { [key: string]: React.ElementType } = {
  Package,
  Users,
  DollarSign,
  AlertTriangle,
  Truck,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
};

const Dashboard = () => {
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Assuming the backend provides a similar structure at /dashboard/summary
        const response = await apiService.get<ApiResponse<SummaryData>>('/dashboard/summary');
        if (response.data.data) {
            setSummaryData(response.data.data);
            setLastUpdated(new Date().toLocaleTimeString());
        } else {
            // Handle case where response.data.data is null/undefined but no error was thrown by interceptor
            setError('Failed to retrieve dashboard summary data.');
            setSummaryData(null);
        }
      } catch (err: any) { // Error should be caught by apiService interceptor, but good to have defense
        setError(err.message || 'Failed to fetch dashboard data. Please try again later.');
        setSummaryData(null);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const getStatusIcon = (status: ShipmentPreview['status']) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Delayed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'Processing':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'In Transit':
      default:
        return <Package className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status: ShipmentPreview['status']) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Delayed':
        return 'bg-red-100 text-red-800';
      case 'Processing':
        return 'bg-amber-100 text-amber-800';
      case 'In Transit':
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getAlertSeverityColor = (severity: AlertPreview['severity']) => {
    switch (severity) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Info':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getAlertIconColor = (severity: AlertPreview['severity']) => {
    switch (severity) {
      case 'High':
        return 'text-red-600';
      case 'Medium':
        return 'text-amber-600';
      case 'Info':
      default:
        return 'text-blue-600';
    }
  };


  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full text-red-600">
        <ServerCrash className="w-16 h-16 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800">Dashboard Overview</h2>
        {isLoading ? (
          <Skeleton className="h-5 w-28" />
        ) : (
          lastUpdated && <div className="text-sm text-slate-500">Last updated: {lastUpdated}</div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="metric-card">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-8 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/4" />
              </CardContent>
            </Card>
          ))
        ) : (
          summaryData?.metrics.map((metric) => {
            const IconComponent = iconComponents[metric.iconName] || Package;
            return (
              <Card key={metric.title} className="metric-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">{metric.title}</p>
                      <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
                      <p className={`text-sm ${metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {metric.change} from last month
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${metric.bgColor}`}>
                      <IconComponent className={`w-6 h-6 ${metric.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-logistics-primary" />
              Recent Shipments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-16 w-full" />)}
              </div>
            ) : (
              summaryData?.recentShipments.length === 0 ? (
                <p className="text-sm text-slate-500">No recent shipments.</p>
              ) : (
                <div className="space-y-4">
                  {summaryData?.recentShipments.map((shipment) => (
                    <div key={shipment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(shipment.status)}
                        <div>
                          <p className="font-medium text-slate-900">{shipment.id}</p>
                          <p className="text-sm text-slate-600">{shipment.client}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                          {shipment.status}
                        </span>
                        <p className="text-sm text-slate-600 mt-1">{shipment.destination}</p>
                        <p className="text-xs text-slate-500 mt-0.5">ETA: {shipment.eta}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-amber-600" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
               <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-16 w-full" />)}
              </div>
            ) : (
              summaryData?.activeAlerts.length === 0 ? (
                <p className="text-sm text-slate-500">No active alerts.</p>
              ) : (
                <div className="space-y-4">
                  {summaryData?.activeAlerts.map((alert) => (
                    <div key={alert.id} className={`p-3 border rounded-lg ${getAlertSeverityColor(alert.severity)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2">
                           <AlertTriangle className={`w-4 h-4 mt-0.5 ${getAlertIconColor(alert.severity)}`} />
                          <div>
                            <p className={`font-medium`}>{alert.title}</p>
                            <p className={`text-sm`}>{alert.description}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap`}>
                          {alert.severity}
                        </span>
                      </div>
                      {alert.category && (
                        <p className="text-xs opacity-80 mt-1 pl-6">Category: {alert.category}</p>
                      )}
                    </div>
                  ))}
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
