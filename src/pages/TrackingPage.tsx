// src/pages/TrackingPage.tsx
import React, { useState } from 'react';
import { MapPin, Search, Package, Clock, CheckCircle, XCircle, Loader2, ServerCrash, ListCollapse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTracker } from '@/hooks/useTracker';
import { TrackingUpdate, ShipmentStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const getStatusIcon = (status: ShipmentStatus | undefined, className = "w-5 h-5") => {
    if (!status) return <Package className={className} />;
    switch (status) {
      case 'Delivered': return <CheckCircle className={`${className} text-green-500`} />;
      case 'Delayed': return <XCircle className={`${className} text-red-500`} />;
      case 'Processing': return <Clock className={`${className} text-blue-500`} />;
      case 'In Transit': return <Package className={`${className} text-yellow-600`} />; // Using yellow for in transit
      case 'Pending': return <Loader2 className={`${className} text-gray-500 animate-spin`} />;
      case 'Cancelled': return <XCircle className={`${className} text-gray-400`} />;
      default: return <Package className={className} />;
    }
};

const getStatusBadge = (status: ShipmentStatus | undefined) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;
    switch (status)
    {
      case 'Delivered': return <Badge variant="success">{status}</Badge>;
      case 'Delayed': return <Badge variant="destructive">{status}</Badge>;
      case 'Processing': return <Badge variant="info">{status}</Badge>;
      case 'In Transit': return <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">{status}</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
};

const TrackingPage = () => {
  const [shipmentIdInput, setShipmentIdInput] = useState('');
  const { trackingInfo, isLoading, error, fetchTrackingInfo, isActive } = useTracker();

  const handleTrackShipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (shipmentIdInput.trim()) {
      fetchTrackingInfo(shipmentIdInput.trim());
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col items-center text-center">
        <MapPin className="w-12 h-12 text-logistics-primary mb-2" />
        <h1 className="text-3xl font-bold text-slate-800">Track Your Shipment</h1>
        <p className="text-slate-600 max-w-md mt-1">Enter your shipment ID below to see its current status and location.</p>
      </div>

      <form onSubmit={handleTrackShipment} className="flex items-center justify-center space-x-2 max-w-lg mx-auto">
        <Input
          type="text"
          value={shipmentIdInput}
          onChange={(e) => setShipmentIdInput(e.target.value)}
          placeholder="Enter Shipment ID (e.g., SH001)"
          className="flex-grow text-lg p-3"
          aria-label="Shipment ID"
        />
        <Button type="submit" size="lg" className="p-3 text-lg" disabled={isLoading}>
          {isLoading && !trackingInfo ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Search className="mr-2 h-5 w-5" />}
          Track
        </Button>
      </form>

      {isLoading && !trackingInfo && ( // Show loader only if no previous data
        <div className="flex justify-center items-center py-10">
          <Loader2 className="w-10 h-10 animate-spin text-logistics-primary" />
          <p className="ml-3 text-slate-600">Searching for shipment...</p>
        </div>
      )}

      {error && (
        <Card className="max-w-2xl mx-auto border-red-300 bg-red-50">
          <CardHeader className="text-center">
            <ServerCrash className="w-10 h-10 text-red-500 mx-auto mb-2" />
            <CardTitle className="text-red-700">Tracking Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-red-600">
            <p>{error.message}</p>
            <p className="text-sm mt-1">Please check the ID and try again. (Mock IDs: SH001-SH008)</p>
          </CardContent>
        </Card>
      )}

      {trackingInfo && isActive && (
        <div className="space-y-6 max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">Shipment ID: {trackingInfo.shipmentId}</CardTitle>
                  <CardDescription>From: {trackingInfo.origin} To: {trackingInfo.destination}</CardDescription>
                </div>
                {getStatusBadge(trackingInfo.currentStatus)}
              </div>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-semibold text-slate-700">Current Status:</p>
                <div className="flex items-center">
                    {getStatusIcon(trackingInfo.currentStatus, "w-4 h-4 mr-1.5 mt-0.5")}
                    <p>{trackingInfo.currentStatus}</p>
                </div>
              </div>
              <div>
                <p className="font-semibold text-slate-700">Current Location:</p>
                <p>{trackingInfo.currentLocation}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-700">Estimated Delivery:</p>
                <p>{trackingInfo.estimatedDelivery}</p>
              </div>
              {trackingInfo.carrier && <div><p className="font-semibold text-slate-700">Carrier:</p><p>{trackingInfo.carrier}</p></div>}
              {trackingInfo.trackingNumber && <div><p className="font-semibold text-slate-700">Tracking #:</p><p>{trackingInfo.trackingNumber}</p></div>}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><ListCollapse className="mr-2 h-5 w-5 text-logistics-primary"/>Tracking History</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading && trackingInfo && <div className="flex justify-center p-2"><Loader2 className="h-4 w-4 animate-spin text-slate-400"/></div>}
                <ScrollArea className="h-72">
                  {trackingInfo.updates.length === 0 ? (
                    <p className="text-slate-500">No tracking updates available yet.</p>
                  ) : (
                    <ul className="space-y-4">
                      {trackingInfo.updates.map((update, index) => (
                        <li key={index} className="relative pl-6">
                          <div className="absolute left-0 top-1 w-3 h-3 bg-slate-300 rounded-full border-2 border-white dark:border-slate-900"></div>
                          {index !== trackingInfo.updates.length - 1 && (
                            <div className="absolute left-[5px] top-4 w-0.5 h-full bg-slate-300"></div>
                          )}
                          <p className="font-medium text-sm text-slate-800 flex items-center">
                            {getStatusIcon(update.status, "w-4 h-4 mr-1.5")}
                            {update.status}
                          </p>
                          <p className="text-xs text-slate-500">{new Date(update.timestamp).toLocaleString()}</p>
                          <p className="text-sm text-slate-700">{update.location}</p>
                          {update.notes && <p className="text-xs italic text-slate-500 mt-0.5">{update.notes}</p>}
                        </li>
                      ))}
                    </ul>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><MapPin className="mr-2 h-5 w-5 text-logistics-primary"/>Map View</CardTitle>
              </CardHeader>
              <CardContent className="h-80 bg-slate-100 flex items-center justify-center text-slate-500">
                 <MapPin className="w-10 h-10 mr-2"/> Live map placeholder.
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingPage;
