// src/hooks/useClients.ts
import { useState, useCallback, useEffect } from 'react';
import { Client, ClientFormData, ClientStatus, ClientActivitySummary } from '@/types';
import * as api from '@/api/mockService';

export interface UseClientsReturn {
  clients: Client[];
  isLoading: boolean;
  error: Error | null;
  fetchClients: (filters?: { query?: string; status?: ClientStatus }) => Promise<void>;
  fetchClientById: (id: string) => Promise<Client | undefined>;
  addClient: (data: ClientFormData) => Promise<Client | undefined>;
  editClient: (id: string, data: Partial<ClientFormData>) => Promise<Client | undefined>;
  removeClient: (id: string) => Promise<void>;
  fetchClientActivitySummary: (clientId: string) => Promise<ClientActivitySummary | undefined>;
  getClientStatusOptions: () => ClientStatus[];
}

const clientStatusOptions: ClientStatus[] = [
  'Active', 'Inactive', 'Prospect', 'Onboarding'
];

export const useClients = (): UseClientsReturn => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchClients = useCallback(async (filters?: { query?: string; status?: ClientStatus }) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getClients(filters);
      setClients(data);
    } catch (err: any) {
      setError(err);
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchClientById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getClientById(id);
      return data;
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
      const newClient = await api.createClient(data);
      await fetchClients();
      return newClient;
    } catch (err: any) {
      setError(err);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, [fetchClients]);

  const editClient = useCallback(async (id: string, data: Partial<ClientFormData>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedClient = await api.updateClient(id, data);
      await fetchClients();
      return updatedClient;
    } catch (err: any) {
      setError(err);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, [fetchClients]);

  const removeClient = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.deleteClient(id);
      await fetchClients();
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchClients]);

  const fetchClientActivitySummary = useCallback(async (clientId: string) => {
    setIsLoading(true); // May want a separate loading state for this
    setError(null);
    try {
      const summary = await api.getClientActivitySummary(clientId);
      return summary;
    } catch (err: any) {
      setError(err); // May want a separate error state
      return undefined;
    } finally {
      setIsLoading(false); // May want a separate loading state for this
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
