
import React from 'react';
import { Truck, MapPin, Fuel, Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const FleetPage = () => {
  const vehicles = [
    {
      id: 'V001',
      type: 'Delivery Truck',
      status: 'Active',
      location: 'Downtown District',
      driver: 'John Smith',
      fuel: 75,
      maintenance: 'Due Soon'
    },
    {
      id: 'V002',
      type: 'Cargo Van',
      status: 'In Transit',
      location: 'Highway 101',
      driver: 'Sarah Johnson',
      fuel: 45,
      maintenance: 'Up to Date'
    },
    {
      id: 'V003',
      type: 'Heavy Truck',
      status: 'Maintenance',
      location: 'Service Center',
      driver: 'Mike Davis',
      fuel: 90,
      maintenance: 'In Progress'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'default';
      case 'In Transit': return 'secondary';
      case 'Maintenance': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800">Fleet Management</h2>
        <Button className="bg-logistics-primary hover:bg-logistics-primary/90">
          <Truck className="w-4 h-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Vehicles</p>
                <p className="text-2xl font-bold text-slate-900">24</p>
              </div>
              <Truck className="w-8 h-8 text-logistics-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Routes</p>
                <p className="text-2xl font-bold text-slate-900">18</p>
              </div>
              <MapPin className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Fuel Efficiency</p>
                <p className="text-2xl font-bold text-slate-900">8.2L/100km</p>
              </div>
              <Fuel className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Maintenance Due</p>
                <p className="text-2xl font-bold text-slate-900">3</p>
              </div>
              <Wrench className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="card-hover">
        <CardHeader>
          <CardTitle>Fleet Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <Truck className="w-8 h-8 text-logistics-primary" />
                  <div>
                    <p className="font-medium text-slate-900">{vehicle.id} - {vehicle.type}</p>
                    <p className="text-sm text-slate-600">Driver: {vehicle.driver}</p>
                    <p className="text-sm text-slate-600">Location: {vehicle.location}</p>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Badge variant={getStatusColor(vehicle.status)}>
                    {vehicle.status}
                  </Badge>
                  <div className="text-sm text-slate-600">
                    <p>Fuel: {vehicle.fuel}%</p>
                    <p>Maintenance: {vehicle.maintenance}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FleetPage;
