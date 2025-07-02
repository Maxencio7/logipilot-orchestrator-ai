// src/api/mockService.ts

import {
    SummaryData, Metric, ShipmentPreview, AlertPreview,
    Shipment, ShipmentFormData, ShipmentStatus,
    Client, ClientFormData, ClientStatus, ClientActivitySummary
} from '@/types';

const mockMetrics: Metric[] = [
  { title: 'Active Shipments', value: '1,305', change: '+15%', iconName: 'Package', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { title: 'Total Clients', value: '350', change: '+10%', iconName: 'Users', color: 'text-green-600', bgColor: 'bg-green-50' },
  { title: 'Revenue', value: '$135,200', change: '+20%', iconName: 'DollarSign', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  { title: 'Pending Alerts', value: '18', change: '-2%', iconName: 'AlertTriangle', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  { title: 'Fleet Online', value: '85%', change: '+3%', iconName: 'Truck', color: 'text-purple-600', bgColor: 'bg-purple-50' },
];

const mockRecentShipments: ShipmentPreview[] = [
  { id: 'SH005', client: 'Innovate Solutions', status: 'In Transit', destination: 'Dallas', eta: '5 hours' },
  { id: 'SH006', client: 'Alpha Goods', status: 'Delivered', destination: 'Seattle', eta: 'Completed' },
  { id: 'SH007', client: 'NextGen Retail', status: 'Processing', destination: 'Austin', eta: '2 days' },
  { id: 'SH008', client: 'Quick Supplies', status: 'Delayed', destination: 'Denver', eta: '6 hours (Delayed)' },
];

const mockActiveAlerts: AlertPreview[] = [
  { id: 'alert1', title: 'Shipment SH008 Overdue', description: 'Exceeded ETA by 2 hours due to congestion.', severity: 'High', category: 'Shipment' },
  { id: 'alert2', title: 'Maintenance Required - TRK04', description: 'Vehicle TRK04 needs scheduled maintenance soon.', severity: 'Medium', category: 'Fleet' },
  { id: 'alert3', title: 'New High-Value Client Onboarded', description: 'Ensure "White Glove" service for Client XYZ.', severity: 'Info', category: 'System' },
];

const mockApiSummary: SummaryData = {
  metrics: mockMetrics,
  recentShipments: mockRecentShipments,
  activeAlerts: mockActiveAlerts,
};

// Mock fetch function for summary data
export const fetchSummaryData = (): Promise<SummaryData> => {
  console.log('Mock API: Fetching summary data...');
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('Mock API: Responding with summary data.');
      resolve(mockApiSummary);
    }, 500); // Simulate network delay
  });
};


// --- Shipments Mock API ---
let mockShipmentsDB: Shipment[] = [
  { id: 'SH001', client: 'TechCorp Inc.', status: 'In Transit', destination: 'New York', origin: 'Chicago', carrier: 'LogiFast', trackingNumber: 'LF123456789', weightKg: 25, contents: 'Electronics', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(), eta: '2 hours' },
  { id: 'SH002', client: 'Global Logistics', status: 'Delivered', destination: 'Los Angeles', origin: 'New York', carrier: 'SpeedyShip', trackingNumber: 'SS987654321', weightKg: 150, contents: 'Industrial Parts', createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), eta: 'Completed' },
  { id: 'SH003', client: 'MegaStore LLC', status: 'Processing', destination: 'Chicago', origin: 'Los Angeles', carrier: 'LogiFast', weightKg: 500, contents: 'Retail Goods', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(), eta: '1 day' },
  { id: 'SH004', client: 'FastTrack Co.', status: 'Delayed', destination: 'Miami', origin: 'Dallas', carrier: 'SpeedyShip', trackingNumber: 'SS123123123', weightKg: 75, contents: 'Perishables', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(), notes: 'Weather delay in Atlanta', eta: '3 hours late' },
  { ...mockRecentShipments[0], origin: 'Warehouse A', carrier: 'Local Carrier', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Shipment,
  { ...mockRecentShipments[1], origin: 'Factory B', carrier: 'National Freight', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Shipment,
  { ...mockRecentShipments[2], origin: 'Port C', carrier: 'SeaLink Logistics', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Shipment,
  { ...mockRecentShipments[3], origin: 'Distribution Hub D', carrier: 'Air Express', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Shipment,
];

// Helper to generate unique IDs for shipments
const generateShipmentId = () => `SH${String(Math.random().toString(36).substr(2, 3) + Date.now().toString(36).substr(4,3)).toUpperCase()}`;


export const getShipments = (filters?: { query?: string; status?: ShipmentStatus }): Promise<Shipment[]> => {
  console.log('Mock API: Fetching shipments with filters:', filters);
  return new Promise(resolve => {
    setTimeout(() => {
      let result = [...mockShipmentsDB];
      if (filters?.query) {
        const q = filters.query.toLowerCase();
        result = result.filter(s =>
          s.id.toLowerCase().includes(q) ||
          s.client.toLowerCase().includes(q) || // Client here is string name
          s.destination.toLowerCase().includes(q) ||
          s.origin.toLowerCase().includes(q)
        );
      }
      if (filters?.status) {
        result = result.filter(s => s.status === filters.status);
      }
      console.log(`Mock API: Responding with ${result.length} shipments.`);
      resolve(result.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, 500);
  });
};

export const getShipmentById = (id: string): Promise<Shipment | undefined> => {
  console.log('Mock API: Fetching shipment by ID:', id);
  return new Promise(resolve => {
    setTimeout(() => {
      const shipment = mockShipmentsDB.find(s => s.id === id);
      console.log('Mock API: Responding with shipment:', shipment);
      resolve(shipment);
    }, 300);
  });
};

export const createShipment = (data: ShipmentFormData): Promise<Shipment> => {
  console.log('Mock API: Creating shipment with data:', data);
  return new Promise(resolve => {
    setTimeout(() => {
      const newShipment: Shipment = {
        ...data,
        id: generateShipmentId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        carrier: data.carrier || 'Default Carrier',
        eta: data.eta || 'Pending ETA',
      };
      mockShipmentsDB.unshift(newShipment);
      console.log('Mock API: Responded with new shipment:', newShipment);
      resolve(newShipment);
    }, 700);
  });
};

export const updateShipment = (id: string, data: Partial<ShipmentFormData>): Promise<Shipment | undefined> => {
  console.log('Mock API: Updating shipment ID:', id, 'with data:', data);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockShipmentsDB.findIndex(s => s.id === id);
      if (index !== -1) {
        mockShipmentsDB[index] = { ...mockShipmentsDB[index], ...data, updatedAt: new Date().toISOString() };
        console.log('Mock API: Responded with updated shipment:', mockShipmentsDB[index]);
        resolve(mockShipmentsDB[index]);
      } else {
        console.error('Mock API: Shipment not found for update:', id);
        reject(new Error('Shipment not found'));
      }
    }, 700);
  });
};

export const deleteShipment = (id: string): Promise<void> => {
  console.log('Mock API: Deleting shipment ID:', id);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const initialLength = mockShipmentsDB.length;
      mockShipmentsDB = mockShipmentsDB.filter(s => s.id !== id);
      if (mockShipmentsDB.length < initialLength) {
        console.log('Mock API: Shipment deleted successfully.');
        resolve();
      } else {
        console.error('Mock API: Shipment not found for deletion:', id);
        reject(new Error('Shipment not found'));
      }
    }, 500);
  });
};


// --- Clients Mock API ---
let mockClientsDB: Client[] = [
  { id: 'CL001', name: 'TechCorp Inc.', email: 'contact@techcorp.com', phone: '555-0101', address: '123 Tech Road, Silicon Valley, CA', status: 'Active', companyName: 'TechCorp Incorporated', contactPerson: 'Jane Doe', industry: 'Technology', satisfactionScore: 92, createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'CL002', name: 'Global Logistics', email: 'info@globallogistics.com', phone: '555-0202', address: '456 Trade St, New York, NY', status: 'Active', companyName: 'Global Logistics Solutions', contactPerson: 'John Smith', industry: 'Logistics', satisfactionScore: 88, createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'CL003', name: 'MegaStore LLC', email: 'support@megastore.com', phone: '555-0303', status: 'Inactive', companyName: 'MegaStore Retail', industry: 'Retail', createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'CL004', name: 'Innovate Solutions', email: 'leads@innovate.io', status: 'Prospect', industry: 'Consulting', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'CL005', name: 'Alpha Goods', email: 'onboarding@alphagoods.co', status: 'Onboarding', companyName: 'Alpha Goods Ltd.', contactPerson: 'Alice Brown', industry: 'Manufacturing', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
];

// Helper to generate unique IDs for clients
const generateClientId = () => `CL${String(Math.random().toString(36).substr(2, 3) + Date.now().toString(36).substr(4,3)).toUpperCase()}`;

export const getClients = (filters?: { query?: string; status?: ClientStatus }): Promise<Client[]> => {
  console.log('Mock API: Fetching clients with filters:', filters);
  return new Promise(resolve => {
    setTimeout(() => {
      let result = [...mockClientsDB];
      if (filters?.query) {
        const q = filters.query.toLowerCase();
        result = result.filter(c =>
          c.id.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          (c.companyName && c.companyName.toLowerCase().includes(q)) ||
          c.email.toLowerCase().includes(q)
        );
      }
      if (filters?.status) {
        result = result.filter(c => c.status === filters.status);
      }
      console.log(`Mock API: Responding with ${result.length} clients.`);
      resolve(result.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, 500);
  });
};

export const getClientById = (id: string): Promise<Client | undefined> => {
  console.log('Mock API: Fetching client by ID:', id);
  return new Promise(resolve => {
    setTimeout(() => {
      const client = mockClientsDB.find(c => c.id === id);
      console.log('Mock API: Responding with client:', client);
      resolve(client);
    }, 300);
  });
};

export const createClient = (data: ClientFormData): Promise<Client> => {
  console.log('Mock API: Creating client with data:', data);
  return new Promise(resolve => {
    setTimeout(() => {
      const newClient: Client = {
        ...data,
        id: generateClientId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        satisfactionScore: Math.floor(Math.random() * 30) + 70, // Random initial score 70-99
      };
      mockClientsDB.unshift(newClient);
      console.log('Mock API: Responded with new client:', newClient);
      resolve(newClient);
    }, 700);
  });
};

export const updateClient = (id: string, data: Partial<ClientFormData>): Promise<Client | undefined> => {
  console.log('Mock API: Updating client ID:', id, 'with data:', data);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockClientsDB.findIndex(c => c.id === id);
      if (index !== -1) {
        mockClientsDB[index] = { ...mockClientsDB[index], ...data, updatedAt: new Date().toISOString() };
        console.log('Mock API: Responded with updated client:', mockClientsDB[index]);
        resolve(mockClientsDB[index]);
      } else {
        console.error('Mock API: Client not found for update:', id);
        reject(new Error('Client not found'));
      }
    }, 700);
  });
};

export const deleteClient = (id: string): Promise<void> => {
  console.log('Mock API: Deleting client ID:', id);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const initialLength = mockClientsDB.length;
      mockClientsDB = mockClientsDB.filter(c => c.id !== id);
      if (mockClientsDB.length < initialLength) {
        // Also remove their shipments for mock simplicity, or handle orphaned data appropriately in a real app
        mockShipmentsDB = mockShipmentsDB.filter(s => s.client !== mockClientsDB.find(c => c.id === id)?.name); // This is a bit naive
        console.log('Mock API: Client deleted successfully.');
        resolve();
      } else {
        console.error('Mock API: Client not found for deletion:', id);
        reject(new Error('Client not found'));
      }
    }, 500);
  });
};

export const getClientActivitySummary = (clientId: string): Promise<ClientActivitySummary | undefined> => {
    console.log('Mock API: Fetching activity summary for client ID:', clientId);
    return new Promise(resolve => {
        setTimeout(() => {
            const client = mockClientsDB.find(c => c.id === clientId);
            if (!client) {
                resolve(undefined);
                return;
            }
            const clientShipments = mockShipmentsDB.filter(s => s.client === client.name); // Match by name for mock
            const summary: ClientActivitySummary = {
                clientId: client.id,
                totalRequests: clientShipments.length,
                lastRequestDate: clientShipments.length > 0 ? clientShipments.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt : undefined,
                commonDestinations: [...new Set(clientShipments.map(s => s.destination))].slice(0,3),
                satisfactionTrend: [Math.max(0, (client.satisfactionScore || 80) - 10), Math.max(0, (client.satisfactionScore || 85) -5) , client.satisfactionScore || 90],
            };
            console.log('Mock API: Responding with client activity summary:', summary);
            resolve(summary);
        }, 400);
    });
};
