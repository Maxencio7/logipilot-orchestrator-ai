// src/hooks/useShipments.ts
import { useState, useCallback, useEffect } from 'react';
import { Shipment, ShipmentFormData, ShipmentStatus } from '@/types';
import * as api from '@/api/mockService'; // Using * as api for clarity

export interface UseShipmentsReturn {
  shipments: Shipment[];
  isLoading: boolean;
  error: Error | null;
  fetchShipments: (filters?: { query?: string; status?: ShipmentStatus }) => Promise<void>;
  fetchShipmentById: (id: string) => Promise<Shipment | undefined>;
  addShipment: (data: ShipmentFormData) => Promise<Shipment | undefined>;
  editShipment: (id: string, data: Partial<ShipmentFormData>) => Promise<Shipment | undefined>;
  removeShipment: (id: string) => Promise<void>;
  getShipmentStatusOptions: () => ShipmentStatus[];
}

const shipmentStatusOptions: ShipmentStatus[] = [
  'Pending', 'Processing', 'In Transit', 'Delivered', 'Delayed', 'Cancelled'
];

export const useShipments = (): UseShipmentsReturn => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchShipments = useCallback(async (filters?: { query?: string; status?: ShipmentStatus }) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getShipments(filters);
      setShipments(data);
    } catch (err: any) {
      setError(err);
      setShipments([]); // Clear shipments on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchShipmentById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getShipmentById(id);
      return data;
    } catch (err: any) {
      setError(err);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addShipment = useCallback(async (data: ShipmentFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const newShipment = await api.createShipment(data);
      // Refresh the list or add to state optimistically/realistically
      // For now, just refresh the whole list to see the new item
      await fetchShipments();
      return newShipment;
    } catch (err: any) {
      setError(err);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, [fetchShipments]);

  const editShipment = useCallback(async (id: string, data: Partial<ShipmentFormData>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedShipment = await api.updateShipment(id, data);
      await fetchShipments(); // Refresh list
      return updatedShipment;
    } catch (err: any) {
      setError(err);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, [fetchShipments]);

  const removeShipment = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.deleteShipment(id);
      await fetchShipments(); // Refresh list
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchShipments]);

  // Initial fetch of all shipments when the hook is first used
  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  const getShipmentStatusOptions = useCallback(() => {
    return shipmentStatusOptions;
  }, []);

  return {
    shipments,
    isLoading,
    error,
    fetchShipments,
    fetchShipmentById,
    addShipment,
    editShipment,
    removeShipment,
    getShipmentStatusOptions,
  };
};
