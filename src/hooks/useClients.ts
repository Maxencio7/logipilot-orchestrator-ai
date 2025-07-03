// src/hooks/useClients.ts
import { useState, useCallback, useEffect } from 'react';
import { Client, ClientFormData, ClientStatus, ClientActivitySummary, ApiResponse } from '@/types';
import apiService from '@/api/apiService';
import { PaginationInfo } from './useShipments'; // Re-use PaginationInfo from useShipments

export interface UseClientsReturn {
  clients: Client[];
  pagination: PaginationInfo | null;
  isLoading: boolean;
  error: Error | null;
  fetchClients: (page?: number, pageSize?: number, filters?: { query?: string; status?: ClientStatus }) => Promise<void>;
  fetchClientById: (id: string) => Promise<Client | undefined>;
  addClient: (data: ClientFormData) => Promise<Client | undefined>;
  editClient: (id: string, data: Partial<ClientFormData>) => Promise<Client | undefined>;
  removeClient: (id: string) => Promise<boolean>;
  fetchClientActivitySummary: (clientId: string) => Promise<ClientActivitySummary | undefined>;
  getClientStatusOptions: () => ClientStatus[];
}

const clientStatusOptions: ClientStatus[] = [
  'Active', 'Inactive', 'Prospect', 'Onboarding'
];

export const useClients = (): UseClientsReturn => {
  const [clients, setClients] = useState<Client[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchClients = useCallback(async (page: number = 1, pageSize: number = 10, filters?: { query?: string; status?: ClientStatus }) => {
    setIsLoading(true);
    setError(null);
    try {
      const params: any = { page, pageSize, ...filters };
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

      const response = await apiService.get<ApiResponse<Client[]>>('/clients', { params });
      setClients(response.data.data || []);
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      } else {
        setPagination({ page: 1, pageSize: response.data.data?.length || 0, totalItems: response.data.data?.length || 0 });
      }
    } catch (err: any) {
      setError(err);
      setClients([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchClientById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.get<ApiResponse<Client>>(`/clients/${id}`);
      return response.data.data;
    } catch (err: any) {
      setError(err);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addClient = useCallback(async (data: ClientFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.post<ApiResponse<Client>>('/clients', data);
      fetchClients(pagination?.page || 1, pagination?.pageSize || 10);
      return response.data.data;
    } catch (err: any) {
      setError(err);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, [fetchClients, pagination]);

  const editClient = useCallback(async (id: string, data: Partial<ClientFormData>) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.put<ApiResponse<Client>>(`/clients/${id}`, data);
      fetchClients(pagination?.page || 1, pagination?.pageSize || 10);
      return response.data.data;
    } catch (err: any) {
      setError(err);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, [fetchClients, pagination]);

  const removeClient = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiService.delete(`/clients/${id}`);
      fetchClients(pagination?.page || 1, pagination?.pageSize || 10);
      return true;
    } catch (err: any) {
      setError(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchClients, pagination]);

  const fetchClientActivitySummary = useCallback(async (clientId: string) => {
    // Assuming this might be a separate endpoint or part of getClientById in a real API
    // For now, let's assume it's specific and might not use the global isLoading
    // This mock service function might need to be adapted or a new one created in apiService.ts
    // if the backend provides this. For now, we'll keep it using the mock.
    // TODO: Update this if/when a real backend endpoint for activity summary is available.
    setIsLoading(true);
    setError(null);
    try {
      // const summary = await api.getClientActivitySummary(clientId); // Kept from mock for now
      // If backend provides it via /clients/:id/activity-summary
      const response = await apiService.get<ApiResponse<ClientActivitySummary>>(`/clients/${clientId}/activity-summary`);
      return response.data.data;
    } catch (err: any) {
      console.warn("fetchClientActivitySummary using mock or potentially non-existent real endpoint.", err)
      setError(err);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const getClientStatusOptions = useCallback(() => {
    return clientStatusOptions;
  }, []);

  return {
    clients,
    pagination,
    isLoading,
    error,
    fetchClients,
    fetchClientById,
    addClient,
    editClient,
    removeClient,
    fetchClientActivitySummary,
    getClientStatusOptions,
  };
};
