// src/hooks/useTracker.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { TrackingInfo, TrackingUpdate, ShipmentStatus } from '@/types';
import * as api from '@/api/mockService';
import { toast } from 'sonner';

export interface UseTrackerReturn {
  trackingInfo: TrackingInfo | null;
  isLoading: boolean;
  error: Error | null;
  fetchTrackingInfo: (shipmentId: string) => Promise<void>;
  isActive: boolean; // To know if tracking is currently active for a shipment
}

const mockLocations = [
    "City A Sorting Facility", "In transit between City A and City B", "City B Hub",
    "Out for delivery from City B Hub", "Regional Hub C", "Crossing State Line X to Y",
    "Customs Checkpoint Alpha", "Delayed at Junction Z due to weather"
];
const mockStatuses: ShipmentStatus[] = ['In Transit', 'Delayed', 'Processing']; // Possible live update statuses

export const useTracker = (pollInterval: number = 10000): UseTrackerReturn => { // Poll every 10 seconds for new mock updates
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentShipmentIdRef = useRef<string | null>(null);

  const fetchTrackingInfo = useCallback(async (shipmentId: string) => {
    if (!shipmentId) {
        setTrackingInfo(null);
        setError(null);
        setIsActive(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
        currentShipmentIdRef.current = null;
        return;
    }

    setIsLoading(true);
    setError(null);
    currentShipmentIdRef.current = shipmentId;

    try {
      const data = await api.getTrackingDetailsByShipmentId(shipmentId);
      if (data) {
        setTrackingInfo(data);
        setIsActive(true);
        // Start polling for updates only if tracking info is found and it's not delivered/cancelled
        if (data.currentStatus !== 'Delivered' && data.currentStatus !== 'Cancelled') {
            if (intervalRef.current) clearInterval(intervalRef.current); // Clear existing interval
            intervalRef.current = setInterval(() => {
                // Simulate a new update
                setTrackingInfo(prevInfo => {
                    if (!prevInfo || prevInfo.currentStatus === 'Delivered' || prevInfo.currentStatus === 'Cancelled') {
                        if (intervalRef.current) clearInterval(intervalRef.current);
                        return prevInfo;
                    }

                    const newStatus = Math.random() > 0.8 ? 'Delayed' : prevInfo.currentStatus === 'Processing' ? 'In Transit' : prevInfo.currentStatus;
                    const newLocation = mockLocations[Math.floor(Math.random() * mockLocations.length)];
                    const newUpdate: TrackingUpdate = {
                        timestamp: new Date().toISOString(),
                        status: newStatus,
                        location: newLocation,
                        notes: newStatus === 'Delayed' ? 'Unexpected delay encountered.' : 'Shipment moving as expected.',
                    };

                    const updatedInfo = {
                        ...prevInfo,
                        currentStatus: newStatus,
                        currentLocation: newLocation,
                        updates: [newUpdate, ...prevInfo.updates],
                    };

                    // Simulate ETA change alert
                    if (newStatus === 'Delayed' && prevInfo.currentStatus !== 'Delayed') {
                        toast.warning(`Shipment ${prevInfo.shipmentId} Delayed`, {
                            description: `New ETA might be affected. Current location: ${newLocation}`,
                        });
                        updatedInfo.estimatedDelivery = "Delayed - Recalculating ETA";
                    }

                    return updatedInfo;
                });
            }, pollInterval);
        } else {
             if (intervalRef.current) clearInterval(intervalRef.current); // Stop polling if delivered/cancelled
        }

      } else {
        setTrackingInfo(null);
        setError(new Error(`Shipment ID "${shipmentId}" not found.`));
        setIsActive(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    } catch (err: any) {
      setError(err);
      setTrackingInfo(null);
      setIsActive(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    } finally {
      setIsLoading(false);
    }
  }, [pollInterval]);


  // Cleanup interval on unmount or if shipmentId changes
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    trackingInfo,
    isLoading,
    error,
    fetchTrackingInfo,
    isActive,
  };
};
