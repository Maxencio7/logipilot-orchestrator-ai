
import React from 'react';
import { MapPin, Navigation, Clock, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const TrackingPage = () => {
  const shipments = [
    {
      id: 'SH001',
      status: 'In Transit',
      currentLocation: 'Chicago, IL',
      destination: 'New York, NY',
      estimatedArrival: '2024-01-15 14:30',
      progress: 65
    },
    {
      id: 'SH002',
      status: 'Out for Delivery',
      currentLocation: 'Brooklyn, NY',
      destination: 'Manhattan, NY',
      estimatedArrival: '2024-01-14 16:45',
      progress: 90
    },
    {
      id: 'SH003',
      status: 'Processing',
      currentLocation: 'Los Angeles, CA',
      destination: 'San Francisco, CA',
      estimatedArrival: '2024-01-16 10:15',
      progress: 25
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Transit': return 'secondary';
      case 'Out for Delivery': return 'default';
      case 'Processing': return 'outline';
      case 'Delivered': return 'default';
      default: return 'outline';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800">Shipment Tracking</h2>
      </div>

      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Navigation className="w-5 h-5 mr-2 text-logistics-primary" />
            Track Shipment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Input 
              placeholder="Enter tracking number (e.g., SH001)" 
              className="flex-1"
            />
            <Button className="bg-logistics-primary hover:bg-logistics-primary/90">
              Track
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="w-5 h-5 mr-2 text-logistics-primary" />
              Active Shipments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {shipments.map((shipment) => (
                <div key={shipment.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-slate-900">{shipment.id}</p>
                      <Badge variant={getStatusColor(shipment.status)} className="mt-1">
                        {shipment.status}
                      </Badge>
                    </div>
                    <div className="text-right text-sm text-slate-600">
                      <p className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        ETA: {shipment.estimatedArrival}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-slate-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>From: {shipment.currentLocation}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <Navigation className="w-4 h-4 mr-2" />
                      <span>To: {shipment.destination}</span>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex justify-between text-sm text-slate-600 mb-1">
                        <span>Progress</span>
                        <span>{shipment.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-logistics-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${shipment.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Live Map View</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 bg-slate-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500">Interactive map will be implemented here</p>
                <p className="text-sm text-slate-400 mt-2">Real-time tracking visualization</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrackingPage;
