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
        // This is a bit naive as client name might not be unique, real app would use client ID on shipment
        const deletedClientName = mockClientsDB.find(c => c.id === id)?.name;
        if (deletedClientName) {
            mockShipmentsDB = mockShipmentsDB.filter(s => s.client !== deletedClientName);
        }
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

// --- Settings Mock API ---
let mockUserSettingsDB: UserSettings = {
    id: 'USER001', // Assuming a single current user for now
    profile: {
        fullName: 'Jules Verne',
        email: 'jules.agent@example.com',
        jobTitle: 'Lead Logistics Coordinator',
        phoneNumber: '555-123-4567',
        avatarUrl: '/placeholder.svg', // Default placeholder
    },
    notifications: {
        emailNotifications: {
            newShipmentUpdates: true,
            shipmentDelays: true,
            clientMessages: false,
            systemAlerts: true,
            weeklySummary: false,
        },
        pushNotifications: { enabled: false },
        inAppNotifications: { showAll: true },
    },
    theme: 'light',
    language: 'en',
    timezone: 'America/New_York',
};

let mockOrgSettingsDB: OrganizationSettings = {
    id: 'ORG001',
    organizationName: 'LogiPilot Corp.',
    logoUrl: '/placeholder.svg', // Default placeholder logo
    address: { street: '123 Main St', city: 'Anytown', state: 'CA', zipCode: '90210', country: 'USA' },
    primaryContactEmail: 'contact@logipilot.com',
    defaultCurrency: 'USD',
    defaultTimezone: 'America/New_York',
    slaTargets: { responseTimeHours: 24, deliveryAccuracyPercent: 98.5 },
};

export const getUserSettings = (userId: string = "USER001"): Promise<UserSettings> => {
    console.log('Mock API: Fetching user settings for', userId);
    return new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(mockUserSettingsDB))), 300));
};

export const updateUserSettings = (userId: string = "USER001", data: Partial<UserSettings>): Promise<UserSettings> => {
    console.log('Mock API: Updating user settings for', userId, data);
    return new Promise(resolve => {
        // Deep merge for nested objects like profile and notifications
        if (data.profile) mockUserSettingsDB.profile = { ...mockUserSettingsDB.profile, ...data.profile };
        if (data.notifications) {
             mockUserSettingsDB.notifications = {
                ...mockUserSettingsDB.notifications,
                ...data.notifications,
                emailNotifications: { ...mockUserSettingsDB.notifications.emailNotifications, ...data.notifications.emailNotifications },
                pushNotifications: { ...mockUserSettingsDB.notifications.pushNotifications, ...data.notifications.pushNotifications },
                inAppNotifications: { ...mockUserSettingsDB.notifications.inAppNotifications, ...data.notifications.inAppNotifications },
             };
        }
        if (data.theme) mockUserSettingsDB.theme = data.theme;
        if (data.language) mockUserSettingsDB.language = data.language;
        if (data.timezone) mockUserSettingsDB.timezone = data.timezone;

        setTimeout(() => resolve(JSON.parse(JSON.stringify(mockUserSettingsDB))), 500);
    });
};

export const getOrganizationSettings = (orgId: string = "ORG001"): Promise<OrganizationSettings> => {
    console.log('Mock API: Fetching organization settings for', orgId);
    return new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(mockOrgSettingsDB))), 300));
};

export const updateOrganizationSettings = (orgId: string = "ORG001", data: OrganizationSettingsFormData): Promise<OrganizationSettings> => {
    console.log('Mock API: Updating organization settings for', orgId, data);
    return new Promise(resolve => {
        mockOrgSettingsDB = { ...mockOrgSettingsDB, ...data };
        setTimeout(() => resolve(JSON.parse(JSON.stringify(mockOrgSettingsDB))), 500);
    });
};

// --- Financial Documents Mock API ---
let mockInvoicesDB: Invoice[] = [
    { id: 'INV001', documentNumber: '2023-001', clientId: 'CL001', clientName: 'TechCorp Inc.', issueDate: new Date(Date.now() - 30 * 24*60*60*1000).toISOString(), dueDate: new Date(Date.now() - 0 * 24*60*60*1000).toISOString(), lineItems: [{id: 'L1', description: 'Freight Forwarding LAX-JFK', quantity: 1, unitPrice: 1200, total: 1200}, {id: 'L2', description: 'Customs Clearance Fee', quantity: 1, unitPrice: 300, total: 300}], subtotal: 1500, taxRate: 0.08, taxAmount: 120, totalAmount: 1620, currency: 'USD', status: 'Sent', paymentTerms: 'Net 30', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'INV002', documentNumber: '2023-002', clientId: 'CL002', clientName: 'Global Logistics', issueDate: new Date(Date.now() - 15 * 24*60*60*1000).toISOString(), dueDate: new Date(Date.now() + 15 * 24*60*60*1000).toISOString(), lineItems: [{id: 'L1', description: 'Warehousing Services - Oct', quantity: 100, unitPrice: 10, total: 1000}], subtotal: 1000, taxAmount: 0, totalAmount: 1000, currency: 'USD', status: 'Paid', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), linkedReceiptIds: ['RCT001'] },
];
let mockFeeNotesDB: FeeNote[] = [
    { id: 'FN001', documentNumber: 'FN-2023-001', clientId: 'CL001', clientName: 'TechCorp Inc.', issueDate: new Date(Date.now() - 5 * 24*60*60*1000).toISOString(), lineItems: [{id: 'L1', description: 'Late Payment Fee for INV001', quantity: 1, unitPrice: 50, total: 50}], subtotal: 50, totalAmount: 50, currency: 'USD', status: 'Sent', relatedInvoiceId: 'INV001', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
];
let mockReceiptsDB: Receipt[] = [
    { id: 'RCT001', documentNumber: 'RCPT-2023-001', clientId: 'CL002', clientName: 'Global Logistics', issueDate: new Date(Date.now() - 10 * 24*60*60*1000).toISOString(), paymentDate: new Date(Date.now() - 10 * 24*60*60*1000).toISOString(), paymentMethod: 'Bank Transfer', lineItems: [{id: 'L1', description: 'Payment for INV002', quantity:1, unitPrice: 1000, total: 1000}], subtotal: 1000, totalAmount: 1000, currency: 'USD', status: 'Paid', relatedInvoiceId: 'INV002', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
];

const calculateDocumentTotals = (lineItems: LineItemFormData[], taxRate?: number): { subtotal: number, taxAmount: number, totalAmount: number, itemsWithTotals: LineItem[] } => {
    let subtotal = 0;
    const itemsWithTotals: LineItem[] = lineItems.map((item, index) => {
        const total = item.quantity * item.unitPrice;
        subtotal += total;
        return { ...item, id: `li-${Date.now()}-${index}`, total };
    });
    const currentTaxRate = taxRate || 0;
    const taxAmount = subtotal * currentTaxRate;
    const totalAmount = subtotal + taxAmount;
    return { subtotal, taxAmount, totalAmount, itemsWithTotals };
};

// Invoice CRUD
export const getInvoices = (filters?: { status?: DocumentStatus; clientId?: string }): Promise<Invoice[]> => {
    return new Promise(resolve => setTimeout(() => {
        let result = [...mockInvoicesDB];
        if (filters?.status) result = result.filter(inv => inv.status === filters.status);
        if (filters?.clientId) result = result.filter(inv => inv.clientId === filters.clientId);
        resolve(result.sort((a,b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()));
    }, 400));
};
export const createInvoice = (data: InvoiceFormData): Promise<Invoice> => {
    return new Promise(resolve => setTimeout(() => {
        const client = mockClientsDB.find(c => c.id === data.clientId);
        const { subtotal, taxAmount, totalAmount, itemsWithTotals } = calculateDocumentTotals(data.lineItems, data.taxRate);
        const newInvoice: Invoice = {
            ...data,
            id: generateId('INV'),
            documentNumber: `INV-${new Date().getFullYear()}-${mockInvoicesDB.length + 1}`,
            clientName: client?.name || 'Unknown Client',
            lineItems: itemsWithTotals,
            subtotal, taxAmount, totalAmount,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        mockInvoicesDB.push(newInvoice);
        resolve(newInvoice);
    }, 500));
};
export const updateInvoice = (id: string, data: Partial<InvoiceFormData>): Promise<Invoice | undefined> => {
    return new Promise(resolve => setTimeout(() => {
        const index = mockInvoicesDB.findIndex(inv => inv.id === id);
        if (index !== -1) {
            const existingInvoice = mockInvoicesDB[index];
            const updatedData = { ...existingInvoice, ...data };
            if (data.lineItems || data.taxRate !== undefined) {
                 const { subtotal, taxAmount, totalAmount, itemsWithTotals } = calculateDocumentTotals(data.lineItems || existingInvoice.lineItems, data.taxRate !== undefined ? data.taxRate : existingInvoice.taxRate);
                 updatedData.lineItems = itemsWithTotals;
                 updatedData.subtotal = subtotal;
                 updatedData.taxAmount = taxAmount;
                 updatedData.totalAmount = totalAmount;
            }
            mockInvoicesDB[index] = { ...updatedData, updatedAt: new Date().toISOString() } as Invoice;
            resolve(mockInvoicesDB[index]);
        } else resolve(undefined);
    }, 500));
};
export const deleteInvoice = (id: string): Promise<boolean> => {
    return new Promise(resolve => setTimeout(() => {
        const initialLength = mockInvoicesDB.length;
        mockInvoicesDB = mockInvoicesDB.filter(inv => inv.id !== id);
        resolve(mockInvoicesDB.length < initialLength);
    }, 300));
};

// Similar CRUD for FeeNotes and Receipts can be added here...
// For brevity, I'll add simplified versions for get, create.

// FeeNote CRUD
export const getFeeNotes = (filters?: { status?: DocumentStatus; clientId?: string }): Promise<FeeNote[]> => {
    return new Promise(resolve => setTimeout(() => {
        // Basic filtering, expand as needed
        resolve([...mockFeeNotesDB].sort((a,b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()));
    }, 400));
};
export const createFeeNote = (data: FeeNoteFormData): Promise<FeeNote> => {
    return new Promise(resolve => setTimeout(() => {
        const client = mockClientsDB.find(c => c.id === data.clientId);
        const { subtotal, taxAmount, totalAmount, itemsWithTotals } = calculateDocumentTotals(data.lineItems, data.taxRate);
        const newFeeNote: FeeNote = {
            ...data,
            id: generateId('FN'),
            documentNumber: `FN-${new Date().getFullYear()}-${mockFeeNotesDB.length + 1}`,
            clientName: client?.name || 'Unknown Client',
            lineItems: itemsWithTotals,
            subtotal, taxAmount, totalAmount,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        mockFeeNotesDB.push(newFeeNote);
        resolve(newFeeNote);
    }, 500));
};
export const updateFeeNote = (id: string, data: Partial<FeeNoteFormData>): Promise<FeeNote | undefined> => {
    return new Promise(resolve => setTimeout(() => {
        const index = mockFeeNotesDB.findIndex(fn => fn.id === id);
        if (index !== -1) {
            const existingFeeNote = mockFeeNotesDB[index];
            const updatedData = { ...existingFeeNote, ...data };
             if (data.lineItems || data.taxRate !== undefined) {
                 const { subtotal, taxAmount, totalAmount, itemsWithTotals } = calculateDocumentTotals(data.lineItems || existingFeeNote.lineItems, data.taxRate !== undefined ? data.taxRate : existingFeeNote.taxRate);
                 updatedData.lineItems = itemsWithTotals;
                 updatedData.subtotal = subtotal;
                 updatedData.taxAmount = taxAmount;
                 updatedData.totalAmount = totalAmount;
            }
            mockFeeNotesDB[index] = { ...updatedData, updatedAt: new Date().toISOString() } as FeeNote;
            resolve(mockFeeNotesDB[index]);
        } else resolve(undefined);
    }, 500));
};
export const deleteFeeNote = (id: string): Promise<boolean> => {
    return new Promise(resolve => setTimeout(() => {
        const initialLength = mockFeeNotesDB.length;
        mockFeeNotesDB = mockFeeNotesDB.filter(fn => fn.id !== id);
        resolve(mockFeeNotesDB.length < initialLength);
    }, 300));
};


// Receipt CRUD
export const getReceipts = (filters?: { clientId?: string }): Promise<Receipt[]> => {
    return new Promise(resolve => setTimeout(() => {
        resolve([...mockReceiptsDB].sort((a,b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()));
    }, 400));
};
export const createReceipt = (data: ReceiptFormData): Promise<Receipt> => {
    return new Promise(resolve => setTimeout(() => {
        const client = mockClientsDB.find(c => c.id === data.clientId);
        const { subtotal, taxAmount, totalAmount, itemsWithTotals } = calculateDocumentTotals(data.lineItems, data.taxRate);
        const newReceipt: Receipt = {
            ...data,
            id: generateId('RCT'),
            documentNumber: `RCT-${new Date().getFullYear()}-${mockReceiptsDB.length + 1}`,
            clientName: client?.name || 'Unknown Client',
            lineItems: itemsWithTotals,
            subtotal, taxAmount, totalAmount,
            status: 'Paid', // Receipts are typically for paid amounts
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        mockReceiptsDB.push(newReceipt);
        // Optionally mark related invoice as paid
        if (newReceipt.relatedInvoiceId) {
            const invIdx = mockInvoicesDB.findIndex(inv => inv.id === newReceipt.relatedInvoiceId);
            if (invIdx !== -1) {
                mockInvoicesDB[invIdx].status = 'Paid';
                mockInvoicesDB[invIdx].linkedReceiptIds = [...(mockInvoicesDB[invIdx].linkedReceiptIds || []), newReceipt.id];
            }
        }
        resolve(newReceipt);
    }, 500));
};
export const updateReceipt = (id: string, data: Partial<ReceiptFormData>): Promise<Receipt | undefined> => {
    return new Promise(resolve => setTimeout(() => {
        const index = mockReceiptsDB.findIndex(r => r.id === id);
        if (index !== -1) {
            const existingReceipt = mockReceiptsDB[index];
            const updatedData = { ...existingReceipt, ...data };
             if (data.lineItems || data.taxRate !== undefined) { // Receipts might not have tax, but keep for consistency
                 const { subtotal, taxAmount, totalAmount, itemsWithTotals } = calculateDocumentTotals(data.lineItems || existingReceipt.lineItems, data.taxRate !== undefined ? data.taxRate : existingReceipt.taxRate);
                 updatedData.lineItems = itemsWithTotals;
                 updatedData.subtotal = subtotal;
                 updatedData.taxAmount = taxAmount;
                 updatedData.totalAmount = totalAmount;
            }
            mockReceiptsDB[index] = { ...updatedData, updatedAt: new Date().toISOString() } as Receipt;
            resolve(mockReceiptsDB[index]);
        } else resolve(undefined);
    }, 500));
};
export const deleteReceipt = (id: string): Promise<boolean> => {
    return new Promise(resolve => setTimeout(() => {
        const initialLength = mockReceiptsDB.length;
        mockReceiptsDB = mockReceiptsDB.filter(r => r.id !== id);
        resolve(mockReceiptsDB.length < initialLength);
    }, 300));
};

// --- Fleet Mock API ---
let mockVehiclesDB: Vehicle[] = [
    { id: 'TRK001', make: 'Volvo', model: 'VNL 760', year: 2021, licensePlate: 'FLT-001', type: 'Truck', status: 'Active', fuelLevel: 75, mileage: 120500, assignedDriverId: 'DRV001', lastMaintenanceDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), nextMaintenanceDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), currentLocation: { lat: 34.0522, lng: -118.2437, address: "Los Angeles, CA" } },
    { id: 'VAN001', make: 'Ford', model: 'Transit', year: 2022, licensePlate: 'FLT-002', type: 'Van', status: 'Idle', fuelLevel: 90, mileage: 35200, lastMaintenanceDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), nextMaintenanceDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), currentLocation: { lat: 40.7128, lng: -74.0060, address: "New York, NY" } },
    { id: 'TRK002', make: 'Kenworth', model: 'T680', year: 2020, licensePlate: 'FLT-003', type: 'Truck', status: 'Maintenance', fuelLevel: 30, mileage: 250000, lastMaintenanceDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), nextMaintenanceDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), currentLocation: { lat: 40.7128, lng: -74.0060, address: "Service Center, NY" } },
];
let mockMaintenanceLogsDB: MaintenanceLog[] = [
    { id: 'MAINT001', vehicleId: 'TRK001', date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), type: 'Scheduled', description: 'Oil change, filter replacement, tire rotation', cost: 350, serviceProvider: 'Fleet Maintenance Co.', completed: true },
    { id: 'MAINT002', vehicleId: 'TRK002', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), type: 'Repair', description: 'Engine diagnostics and coolant system repair', cost: 1200, serviceProvider: 'Heavy Duty Repairs Inc.', completed: false },
    { id: 'MAINT003', vehicleId: 'VAN001', date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), type: 'Inspection', description: 'Annual safety inspection', cost: 150, serviceProvider: 'State Inspection Services', completed: true },
];
let mockDriverAssignmentsDB: DriverAssignment[] = [
    { id: 'ASSIGN001', vehicleId: 'TRK001', driverId: 'DRV001', driverName: 'John Ryder', assignmentStartDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'ASSIGN002', vehicleId: 'VAN001', driverId: 'DRV002', driverName: 'Jane Miles', assignmentStartDate: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(), assignmentEndDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), notes: 'Temporary assignment' },
];

const generateId = (prefix: string) => `${prefix.toUpperCase()}${String(Math.random().toString(36).substr(2, 3) + Date.now().toString(36).substr(4,3)).toUpperCase()}`;

// Vehicle CRUD
export const getVehicles = (filters?: { status?: VehicleStatus; type?: VehicleType }): Promise<Vehicle[]> => {
    return new Promise(resolve => setTimeout(() => {
        let result = [...mockVehiclesDB];
        if (filters?.status) result = result.filter(v => v.status === filters.status);
        if (filters?.type) result = result.filter(v => v.type === filters.type);
        resolve(result);
    }, 400));
};
export const createVehicle = (data: VehicleFormData): Promise<Vehicle> => {
    return new Promise(resolve => setTimeout(() => {
        const newVehicle: Vehicle = { ...data, id: generateId('VCL'), assignedDriverId: undefined, currentLocation: { lat: 0, lng: 0, address: "Unknown" } } as Vehicle; // Ensure all fields
        mockVehiclesDB.push(newVehicle);
        resolve(newVehicle);
    }, 500));
};
export const updateVehicle = (id: string, data: Partial<VehicleFormData>): Promise<Vehicle | undefined> => {
    return new Promise(resolve => setTimeout(() => {
        const index = mockVehiclesDB.findIndex(v => v.id === id);
        if (index !== -1) {
            mockVehiclesDB[index] = { ...mockVehiclesDB[index], ...data };
            resolve(mockVehiclesDB[index]);
        } else resolve(undefined);
    }, 500));
};
export const deleteVehicle = (id: string): Promise<boolean> => {
    return new Promise(resolve => setTimeout(() => {
        const initialLength = mockVehiclesDB.length;
        mockVehiclesDB = mockVehiclesDB.filter(v => v.id !== id);
        resolve(mockVehiclesDB.length < initialLength);
    }, 300));
};

// --- Tracking Mock API ---
export const getTrackingDetailsByShipmentId = (shipmentId: string): Promise<TrackingInfo | undefined> => {
    console.log('Mock API: Fetching tracking details for Shipment ID:', shipmentId);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Try to find a shipment from our mockShipmentsDB
            const shipment = mockShipmentsDB.find(s => s.id.toLowerCase() === shipmentId.toLowerCase());

            if (shipment) {
                const updates: TrackingUpdate[] = [
                    { timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), status: 'Processing', location: shipment.origin, notes: 'Shipment created and processed at origin facility.' },
                    { timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), status: 'In Transit', location: `Departed from ${shipment.origin}`, notes: 'On its way to destination.' },
                ];
                if (shipment.status === 'Delivered') {
                     updates.push({ timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), status: 'Delivered', location: shipment.destination, notes: 'Package delivered successfully.' });
                } else if (shipment.status === 'Delayed') {
                     updates.push({ timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), status: 'Delayed', location: `Hub near ${shipment.destination}`, notes: shipment.notes || 'Delay reported due to unforeseen circumstances.' });
                } else if (shipment.status === 'In Transit') {
                     updates.push({ timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), status: 'In Transit', location: `Currently near Midpoint City, State`, notes: 'Proceeding as scheduled.'});
                }


                const trackingInfo: TrackingInfo = {
                    shipmentId: shipment.id,
                    currentStatus: shipment.status,
                    currentLocation: updates[updates.length-1].location, // Last update location
                    estimatedDelivery: shipment.eta || 'Pending',
                    origin: shipment.origin,
                    destination: shipment.destination,
                    carrier: shipment.carrier,
                    trackingNumber: shipment.trackingNumber,
                    updates: updates.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), // Ensure sorted desc
                };
                console.log('Mock API: Responding with tracking info:', trackingInfo);
                resolve(trackingInfo);
            } else {
                console.log('Mock API: No shipment found for tracking ID:', shipmentId);
                resolve(undefined); // Or reject(new Error('Shipment not found'))
            }
        }, 600);
    });
};

// Maintenance Log CRUD
export const getMaintenanceLogsForVehicle = (vehicleId: string): Promise<MaintenanceLog[]> => {
    return new Promise(resolve => setTimeout(() => {
        resolve(mockMaintenanceLogsDB.filter(log => log.vehicleId === vehicleId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }, 400));
};
export const createMaintenanceLog = (data: MaintenanceLogFormData): Promise<MaintenanceLog> => {
    return new Promise(resolve => setTimeout(() => {
        const newLog: MaintenanceLog = { ...data, id: generateId('MAINT') };
        mockMaintenanceLogsDB.push(newLog);
        resolve(newLog);
    }, 500));
};
export const updateMaintenanceLog = (id: string, data: Partial<MaintenanceLogFormData>): Promise<MaintenanceLog | undefined> => {
     return new Promise(resolve => setTimeout(() => {
        const index = mockMaintenanceLogsDB.findIndex(log => log.id === id);
        if (index !== -1) {
            mockMaintenanceLogsDB[index] = { ...mockMaintenanceLogsDB[index], ...data };
            resolve(mockMaintenanceLogsDB[index]);
        } else resolve(undefined);
    }, 500));
};
export const deleteMaintenanceLog = (id: string): Promise<boolean> => {
    return new Promise(resolve => setTimeout(() => {
        const initialLength = mockMaintenanceLogsDB.length;
        mockMaintenanceLogsDB = mockMaintenanceLogsDB.filter(log => log.id !== id);
        resolve(mockMaintenanceLogsDB.length < initialLength);
    }, 300));
};


// Driver Assignment CRUD
export const getDriverAssignmentsForVehicle = (vehicleId: string): Promise<DriverAssignment[]> => {
     return new Promise(resolve => setTimeout(() => {
        resolve(mockDriverAssignmentsDB.filter(ass => ass.vehicleId === vehicleId).sort((a,b) => new Date(b.assignmentStartDate).getTime() - new Date(a.assignmentStartDate).getTime()));
    }, 400));
};
export const createDriverAssignment = (data: DriverAssignmentFormData): Promise<DriverAssignment> => {
    return new Promise(resolve => setTimeout(() => {
        // In a real app, driverName would be fetched based on driverId
        const newAssignment: DriverAssignment = { ...data, id: generateId('ASSIGN'), driverName: `Driver ${data.driverId.substring(0,3)}` };
        mockDriverAssignmentsDB.push(newAssignment);
        // Update vehicle's assignedDriverId
        const vehicleIndex = mockVehiclesDB.findIndex(v => v.id === data.vehicleId);
        if (vehicleIndex !== -1 && !data.assignmentEndDate) { // Only set if it's an ongoing assignment
             mockVehiclesDB[vehicleIndex].assignedDriverId = data.driverId;
        }
        resolve(newAssignment);
    }, 500));
};
export const updateDriverAssignment = (id: string, data: Partial<DriverAssignmentFormData>): Promise<DriverAssignment | undefined> => {
    return new Promise(resolve => setTimeout(() => {
        const index = mockDriverAssignmentsDB.findIndex(ass => ass.id === id);
        if (index !== -1) {
            const oldAssignment = mockDriverAssignmentsDB[index];
            mockDriverAssignmentsDB[index] = { ...oldAssignment, ...data };

            // Update vehicle's assignedDriverId if necessary
            const vehicleIndex = mockVehiclesDB.findIndex(v => v.id === mockDriverAssignmentsDB[index].vehicleId);
            if (vehicleIndex !== -1) {
                if (mockDriverAssignmentsDB[index].assignmentEndDate) { // Assignment ended
                    if (mockVehiclesDB[vehicleIndex].assignedDriverId === mockDriverAssignmentsDB[index].driverId) {
                        mockVehiclesDB[vehicleIndex].assignedDriverId = undefined;
                    }
                } else { // Ongoing assignment
                     mockVehiclesDB[vehicleIndex].assignedDriverId = mockDriverAssignmentsDB[index].driverId;
                }
            }
            resolve(mockDriverAssignmentsDB[index]);
        } else resolve(undefined);
    }, 500));
};
export const deleteDriverAssignment = (id: string): Promise<boolean> => {
     return new Promise(resolve => setTimeout(() => {
        const assignment = mockDriverAssignmentsDB.find(ass => ass.id === id);
        const initialLength = mockDriverAssignmentsDB.length;
        mockDriverAssignmentsDB = mockDriverAssignmentsDB.filter(ass => ass.id !== id);
        const success = mockDriverAssignmentsDB.length < initialLength;

        if (success && assignment) {
            // If the deleted assignment was active, clear vehicle's assignedDriverId
            const vehicleIndex = mockVehiclesDB.findIndex(v => v.id === assignment.vehicleId);
            if (vehicleIndex !== -1 && mockVehiclesDB[vehicleIndex].assignedDriverId === assignment.driverId && !assignment.assignmentEndDate) {
                 mockVehiclesDB[vehicleIndex].assignedDriverId = undefined;
            }
        }
        resolve(success);
    }, 300));
};

// --- Alerts / Notifications Mock API ---
let mockNotificationsDB: NotificationAlert[] = [
    { id: 'notif001', title: 'Shipment SH001 Delayed', description: 'ETA updated due to weather conditions.', severity: 'High', category: 'Shipment', timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(), read: false, link: '/shipments?id=SH001' },
    { id: 'notif002', title: 'New Client Onboarded: Alpha Corp', description: 'Alpha Corp has been successfully onboarded.', severity: 'Success', category: 'Client', timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), read: true, link: '/clients?id=CL_ALPHA' },
    { id: 'notif003', title: 'System Maintenance Scheduled', description: 'System will be down for maintenance tonight at 2 AM.', severity: 'Info', category: 'System', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), read: false },
    { id: 'notif004', title: 'Report Submitted: REP004', description: 'A new incident report has been submitted by John Doe.', severity: 'Info', category: 'Report', timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), read: true, link: '/reports?id=REP004' },
];

const generateNotificationId = () => `notif${String(Math.random().toString(36).substr(2, 3) + Date.now().toString(36).substr(4,3)).toLowerCase()}`;

export const getNotifications = (): Promise<NotificationAlert[]> => {
    console.log('Mock API: Fetching notifications');
    return new Promise(resolve => {
        setTimeout(() => {
            // Sort by timestamp descending
            const sortedNotifications = [...mockNotificationsDB].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            console.log(`Mock API: Responding with ${sortedNotifications.length} notifications.`);
            resolve(sortedNotifications);
        }, 300);
    });
};

export const markNotificationAsRead = (notificationId: string): Promise<boolean> => {
    console.log('Mock API: Marking notification as read:', notificationId);
    return new Promise(resolve => {
        setTimeout(() => {
            const index = mockNotificationsDB.findIndex(n => n.id === notificationId);
            if (index !== -1) {
                mockNotificationsDB[index].read = true;
                resolve(true);
            } else {
                resolve(false);
            }
        }, 100);
    });
};

export const markAllNotificationsAsRead = (): Promise<boolean> => {
    console.log('Mock API: Marking all notifications as read');
    return new Promise(resolve => {
        setTimeout(() => {
            mockNotificationsDB.forEach(n => n.read = true);
            resolve(true);
        }, 100);
    });
};

// Function to simulate a new alert being generated (e.g., by a WebSocket push)
export const generateNewMockNotification = (): NotificationAlert => {
    const titles = ["New Urgent Shipment", "Fleet Update", "Client Message Received", "Task Overdue", "System Alert"];
    const descs = ["Requires immediate attention.", "Vehicle TRK-101 needs maintenance.", "From 'Beta Solutions' regarding order #12345.", "Follow up on report REP005.", "High CPU usage detected on server EU-WEST-1."];
    const severities: NotificationAlert['severity'][] = ['High', 'Medium', 'Info', 'Error', 'Success'];
    const categories: NotificationAlert['category'][] = ['Shipment', 'Fleet', 'Client', 'Report', 'System'];

    const newNotif: NotificationAlert = {
        id: generateNotificationId(),
        title: titles[Math.floor(Math.random() * titles.length)],
        description: descs[Math.floor(Math.random() * descs.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        timestamp: new Date().toISOString(),
        read: false,
        link: Math.random() > 0.5 ? '/dashboard' : undefined, // Random link
    };
    mockNotificationsDB.push(newNotif); // Add to our mock DB
    console.log("Mock API: Generated new notification:", newNotif.title);
    return newNotif;
};

// --- Analytics Mock API ---
const generateRandomTimeSeries = (days: number, keyName = 'value', multiple = 1, startValue = 50, fluctuation = 10): TimeSeriesDataPoint[] => {
    const data: TimeSeriesDataPoint[] = [];
    let currentValue = startValue;
    for (let i = days -1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        currentValue += (Math.random() - 0.5) * fluctuation;
        if (currentValue < 0) currentValue = Math.random() * 5; // Ensure non-negative for most metrics
        data.push({
            date: date.toISOString().split('T')[0], // YYYY-MM-DD
            [keyName]: Math.round(currentValue * multiple),
        });
    }
    return data;
};

const generateRandomCategorical = (categories: string[], keyName = 'value', multiple = 1): CategoricalDataPoint[] => {
    const fills = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28', '#FF8042'];
    return categories.map((cat, index) => ({
        name: cat,
        [keyName]: Math.round((Math.random() * 100 + 20) * multiple),
        fill: fills[index % fills.length]
    }));
};


export const getAnalyticsData = (timeRange: TimeRange = '30d', chartType?: string): Promise<AnalyticsChartData[]> => {
    console.log('Mock API: Fetching analytics data for timeRange:', timeRange, 'type:', chartType);
    return new Promise(resolve => {
        setTimeout(() => {
            const days = typeof timeRange === 'string' ?
                (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : timeRange === '1y' ? 365 : 30) :
                30; // Default for custom range for now

            const allCharts: AnalyticsChartData[] = [
                {
                    title: 'Shipment Volume Over Time',
                    type: 'line',
                    data: generateRandomTimeSeries(days, 'shipments', 1, 100, 20),
                    description: 'Total number of shipments processed daily.',
                    dataKeys: ['shipments']
                },
                {
                    title: 'Shipment Delays',
                    type: 'bar',
                    data: generateRandomTimeSeries(days, 'delayedShipments', 0.1, 10, 5),
                    description: 'Number of shipments delayed per day.',
                    dataKeys: ['delayedShipments']
                },
                {
                    title: 'Cost Per Route',
                    type: 'line',
                    data: generateRandomTimeSeries(days, 'avgCost', 10, 500, 100),
                    description: 'Average cost associated with routes over time.',
                    dataKeys: ['avgCost']
                },
                {
                    title: 'Agent Performance (Tasks Completed)',
                    type: 'bar',
                    data: generateRandomCategorical(['Alice', 'Bob', 'Charlie', 'Diana', 'Edward'], 'tasksCompleted', 1),
                    description: 'Number of tasks completed by each agent this period.',
                    dataKeys: ['tasksCompleted']
                },
                 {
                    title: 'Shipment Status Distribution',
                    type: 'pie',
                    data: generateRandomCategorical(['Delivered', 'In Transit', 'Processing', 'Delayed', 'Cancelled'], 'count', 1),
                    description: 'Current distribution of shipment statuses.',
                    dataKeys: ['count']
                },
                {
                    title: 'Revenue vs. Expenses',
                    type: 'line',
                    data: (() => {
                        const revenue = generateRandomTimeSeries(days, 'revenue', 100, 200, 50);
                        const expenses = generateRandomTimeSeries(days, 'expenses', 80, 150, 40);
                        return revenue.map((r, i) => ({ ...r, expenses: expenses[i].expenses }));
                    })(),
                    description: 'Comparison of revenue and expenses over time.',
                    dataKeys: ['revenue', 'expenses']
                }
            ];

            let result = allCharts;
            if (chartType) { // If a specific chartType is requested (not fully used in mock yet)
                result = allCharts.filter(chart => chart.title.toLowerCase().includes(chartType.toLowerCase()));
                if (result.length === 0) result = [allCharts[0]]; // return at least one
            }

            console.log(`Mock API: Responding with ${result.length} analytics charts.`);
            resolve(result);
        }, 700);
    });
};

// --- AI Assistant Mock API ---
let mockConversationHistory: AIMessage[] = [
    // Initial conversation items can be added here if desired
];
let mockAIQueryLogs: AIQueryLog[] = [];

const generateAIMessageId = () => `aimsg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
const generateAIQueryLogId = () => `ailog-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

export const getConversationHistory = (): Promise<AIMessage[]> => {
    console.log('Mock API: Fetching AI conversation history');
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([...mockConversationHistory]);
        }, 200);
    });
};

export const postToFlowise = (query: string, currentConversation: AIMessage[]): Promise<AIMessage> => {
    console.log('Mock API: Posting query to Flowise:', query);
    return new Promise(resolve => {
        const userMessage: AIMessage = {
            id: generateAIMessageId(),
            type: 'user',
            message: query,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        // Add user message to our mock history
        // currentConversation.push(userMessage); // The component will handle adding this

        // Simulate Flowise response
        let aiResponseText = "I'm sorry, I didn't understand that. Can you please rephrase?";
        if (query.toLowerCase().includes("hello") || query.toLowerCase().includes("hi")) {
            aiResponseText = "Hello there! How can I help you with your logistics today?";
        } else if (query.toLowerCase().includes("status of shipment sh001")) {
            aiResponseText = "Shipment SH001 is currently In Transit and expected to arrive tomorrow.";
        } else if (query.toLowerCase().includes("generate label")) {
            aiResponseText = "Okay, I can help with that. Which shipment ID do you need a label for?";
        } else if (query.toLowerCase().includes("thank you")) {
            aiResponseText = "You're welcome! Is there anything else?";
        }

        const aiMessage: AIMessage = {
            id: generateAIMessageId(),
            type: 'ai',
            message: aiResponseText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setTimeout(() => {
            console.log('Mock API: Flowise responded:', aiMessage);
            resolve(aiMessage);
        }, 1000 + Math.random() * 1000); // Simulate variable delay
    });
};

export const logAIQuery = (logEntry: Omit<AIQueryLog, 'id' | 'timestamp'>): Promise<AIQueryLog> => {
    console.log('Mock API: Logging AI Query:', logEntry);
    return new Promise(resolve => {
        const newLog: AIQueryLog = {
            ...logEntry,
            id: generateAIQueryLogId(),
            timestamp: new Date().toISOString(),
        };
        mockAIQueryLogs.push(newLog);
        setTimeout(() => {
            console.log('Mock API: AI Query logged successfully', newLog);
            resolve(newLog);
        }, 100);
    });
};


// --- Reports Mock API ---
let mockReportsDB: Report[] = [
    { id: 'REP001', title: 'Daily Operations Summary - Oct 26', submittedBy: 'Alice Wonderland', department: 'Operations', type: 'Daily Task', urgency: 'Medium', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), content: 'All shipments processed on time. Minor delay on route AX-12 due to traffic.', status: 'Closed', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'REP002', title: 'Incident: Warehouse Spill - Bay 3', submittedBy: 'Bob The Builder', department: 'Fleet Management', type: 'Incident', urgency: 'High', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), content: 'Chemical spill in Bay 3. Area cordoned off. Cleanup crew dispatched. No injuries.', summary: 'Chemical spill in Bay 3, contained, cleanup in progress.', status: 'In Progress', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(), attachments: [{fileName: 'spill_report.pdf', url: '#'}] },
    { id: 'REP003', title: 'Weekly Client Feedback Summary', submittedBy: 'Charlie Brown', department: 'Customer Service', type: 'Weekly Summary', urgency: 'Low', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), content: 'Overall positive feedback. One client reported a damaged package (SH000). Follow-up initiated.', tags: ['feedback', 'client-service'], status: 'Open', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
];

const generateReportId = () => `REP${String(Math.random().toString(36).substr(2, 3) + Date.now().toString(36).substr(4,3)).toUpperCase()}`;

export const getReports = (filters?: { query?: string; department?: ReportDepartment; type?: ReportType; urgency?: ReportUrgency }): Promise<Report[]> => {
    console.log('Mock API: Fetching reports with filters:', filters);
    return new Promise(resolve => {
        setTimeout(() => {
            let result = [...mockReportsDB];
            if (filters?.query) {
                const q = filters.query.toLowerCase();
                result = result.filter(r =>
                    r.id.toLowerCase().includes(q) ||
                    r.title.toLowerCase().includes(q) ||
                    r.submittedBy.toLowerCase().includes(q) ||
                    r.content.toLowerCase().includes(q)
                );
            }
            if (filters?.department) result = result.filter(r => r.department === filters.department);
            if (filters?.type) result = result.filter(r => r.type === filters.type);
            if (filters?.urgency) result = result.filter(r => r.urgency === filters.urgency);

            console.log(`Mock API: Responding with ${result.length} reports.`);
            resolve(result.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }, 500);
    });
};

export const submitReport = (data: ReportFormData, submittedBy: string = "Current User"): Promise<Report> => {
    console.log('Mock API: Submitting report:', data);
    return new Promise(resolve => {
        setTimeout(() => {
            const newReport: Report = {
                ...data,
                id: generateReportId(),
                submittedBy, // In a real app, get from auth
                date: new Date().toISOString(), // Submission date
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                status: 'Open',
                attachments: [], // Handle actual uploads separately
            };
            mockReportsDB.unshift(newReport);
            console.log('Mock API: Report submitted successfully', newReport);
            resolve(newReport);
        }, 700);
    });
};

// Mock function for summarizing report (placeholder for Flowise)
export const summarizeReportWithAI = (reportContent: string): Promise<string> => {
    console.log('Mock API: Summarizing report content with AI...');
    return new Promise(resolve => {
        setTimeout(() => {
            const summary = `This is an AI-generated summary of the report: "${reportContent.substring(0, 50)}..." Further details would be extracted and synthesized here.`;
            console.log('Mock API: Report summary generated.');
            resolve(summary);
        }, 1500);
    });
};
