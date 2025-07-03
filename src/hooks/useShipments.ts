// src/hooks/useShipments.ts
import { useState, useCallback, useEffect } from 'react';
import { Shipment, ShipmentFormData, ShipmentStatus, ApiResponse } from '@/types'; // Assuming ApiResponse is defined in types
import apiService from '@/api/apiService'; // Import the new apiService

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages?: number; // Optional, can be calculated
}
export interface UseShipmentsReturn {
  shipments: Shipment[];
  pagination: PaginationInfo | null;
  isLoading: boolean;
  error: Error | null; // Error object from Axios or custom
  fetchShipments: (page?: number, pageSize?: number, filters?: { query?: string; status?: ShipmentStatus }) => Promise<void>;
  fetchShipmentById: (id: string) => Promise<Shipment | undefined>;
  addShipment: (data: ShipmentFormData) => Promise<Shipment | undefined>;
  editShipment: (id: string, data: Partial<ShipmentFormData>) => Promise<Shipment | undefined>;
  removeShipment: (id: string) => Promise<boolean>; // Return true on success
  getShipmentStatusOptions: () => ShipmentStatus[];
}

const shipmentStatusOptions: ShipmentStatus[] = [
  'Pending', 'Processing', 'In Transit', 'Delivered', 'Delayed', 'Cancelled'
];

export const useShipments = (): UseShipmentsReturn => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchShipments = useCallback(async (page: number = 1, pageSize: number = 10, filters?: { query?: string; status?: ShipmentStatus }) => {
    setIsLoading(true);
    setError(null);
    try {
      const params: any = { page, pageSize, ...filters };
      // Remove undefined filters to keep URL clean
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

      const response = await apiService.get<ApiResponse<Shipment[]>>('/shipments', { params });

      setShipments(response.data.data || []); // Assuming response.data.data is the array
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      } else {
        // If no pagination info, create a basic one based on received data
        setPagination({ page: 1, pageSize: response.data.data?.length || 0, totalItems: response.data.data?.length || 0 });
      }
    } catch (err: any) {
      setError(err); // Axios error object will be passed
      setShipments([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchShipmentById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.get<ApiResponse<Shipment>>(`/shipments/${id}`);
      return response.data.data;
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
      const response = await apiService.post<ApiResponse<Shipment>>('/shipments', data);
      fetchShipments(pagination?.page || 1, pagination?.pageSize || 10); // Refresh current page
      return response.data.data;
    } catch (err: any) {
      setError(err);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, [fetchShipments, pagination]);

  const editShipment = useCallback(async (id: string, data: Partial<ShipmentFormData>) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.put<ApiResponse<Shipment>>(`/shipments/${id}`, data);
      fetchShipments(pagination?.page || 1, pagination?.pageSize || 10); // Refresh current page
      return response.data.data;
    } catch (err: any) {
      setError(err);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, [fetchShipments, pagination]);

  const removeShipment = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiService.delete(`/shipments/${id}`);
      fetchShipments(pagination?.page || 1, pagination?.pageSize || 10); // Refresh current page
      return true;
    } catch (err: any) {
      setError(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchShipments, pagination]);

  // Initial fetch of all shipments when the hook is first used
  useEffect(() => {
    fetchShipments(); // Fetch initial page
  }, [fetchShipments]); // fetchShipments is memoized

  const getShipmentStatusOptions = useCallback(() => {
    return shipmentStatusOptions;
  }, []);

  return {
    shipments,
    pagination,
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
