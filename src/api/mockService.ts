// src/api/mockService.ts

import {
    SummaryData, Metric, ShipmentPreview, AlertPreview,
    Shipment, ShipmentFormData, ShipmentStatus,
    Client, ClientFormData, ClientStatus, ClientActivitySummary,
    SearchResultItem,
    NotificationItem, NotificationType,
    UserProfile, UserRole, UserStatus, TaskPreview, TaskStatus // Added UserProfile and Task types
} from '@/types';

// Local definition of SearchResultItem is no longer needed.

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

// --- Alerts Mock API ---
let mockAlertsDB: AlertPreview[] = [
  { id: 'alert1', title: 'Shipment SH008 Overdue', description: 'Exceeded ETA by 2 hours due to congestion.', severity: 'High', category: 'Shipment', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
  { id: 'alert2', title: 'Maintenance Required - TRK04', description: 'Vehicle TRK04 needs scheduled maintenance soon.', severity: 'Medium', category: 'Fleet', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
  { id: 'alert3', title: 'New High-Value Client Onboarded', description: 'Ensure "White Glove" service for Client XYZ.', severity: 'Info', category: 'System', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
  { id: 'alert4', title: 'Low Stock Warning: Part ABC', description: 'Stock for Part ABC is below 10 units.', severity: 'Medium', category: 'Inventory', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: 'alert5', title: 'System Update Scheduled', description: 'A system update is scheduled for Sunday at 2 AM.', severity: 'Info', category: 'System', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'alert6', title: 'Client "Innovate Solutions" Query', description: 'Client "Innovate Solutions" has a query regarding shipment SH005.', severity: 'Low', category: 'Client', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
];

export const getAlerts = (filters?: { query?: string }): Promise<AlertPreview[]> => {
  console.log('Mock API: Fetching alerts with filters:', filters);
  return new Promise(resolve => {
    setTimeout(() => {
      let result = [...mockAlertsDB];
      if (filters?.query) {
        const q = filters.query.toLowerCase();
        result = result.filter(a =>
          a.id.toLowerCase().includes(q) ||
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
        );
      }
      // Sort by timestamp descending (newest first)
      resolve(result.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()));
    }, 400); // Simulate network delay
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

// --- Global Search ---
export const searchGlobal = async (query: string): Promise<SearchResultItem[]> => {
  console.log('Mock API: Performing global search for query:', query);
  if (!query || query.trim() === "") {
    return Promise.resolve([]);
  }

  try {
    const [shipmentResults, clientResults, alertResults] = await Promise.all([
      getShipments({ query }),
      getClients({ query }),
      getAlerts({ query })
    ]);

    const mappedShipments: SearchResultItem[] = shipmentResults.map(s => ({
      type: 'Shipment',
      id: s.id,
      title: `Shipment: ${s.id} - ${s.client}`,
      description: `To: ${s.destination}, Status: ${s.status}, Contents: ${s.contents || 'N/A'}`,
      link: `/shipments/${s.id}`
    }));

    const mappedClients: SearchResultItem[] = clientResults.map(c => ({
      type: 'Client',
      id: c.id,
      title: `Client: ${c.name} (${c.id})`,
      description: `Email: ${c.email}, Company: ${c.companyName || 'N/A'}, Status: ${c.status}`,
      link: `/clients/${c.id}`
    }));

    const mappedAlerts: SearchResultItem[] = alertResults.map(a => ({
      type: 'Alert',
      id: a.id,
      title: `Alert: ${a.title} (${a.category})`,
      description: a.description,
      link: `/alerts/${a.id}` // Assuming an /alerts/:id page will exist or be created
    }));

    const combinedResults = [...mappedShipments, ...mappedClients, ...mappedAlerts];

    // Simple sort: exact ID matches or title matches first, then by type
    // This is a basic example; real ranking is complex.
    combinedResults.sort((a, b) => {
        const aQueryLc = query.toLowerCase();
        const bQueryLc = query.toLowerCase();
        const aTitleLc = a.title.toLowerCase();
        const bTitleLc = b.title.toLowerCase();
        const aIdLc = a.id.toLowerCase();
        const bIdLc = b.id.toLowerCase();

        if (aIdLc === aQueryLc && bIdLc !== bQueryLc) return -1;
        if (bIdLc === bQueryLc && aIdLc !== aQueryLc) return 1;
        if (aTitleLc.includes(aQueryLc) && !bTitleLc.includes(bQueryLc)) return -1;
        if (bTitleLc.includes(bQueryLc) && !aTitleLc.includes(bQueryLc)) return 1;

        return a.type.localeCompare(b.type);
    });

    console.log(`Mock API: Global search responded with ${combinedResults.length} items.`);
    return combinedResults;

  } catch (error) {
    console.error('Mock API: Error during global search:', error);
    return Promise.reject(error);
  }
};

// --- Notifications Mock API ---
let mockNotificationsDB: NotificationItem[] = [
  {
    id: 'notif001',
    type: 'NEW_WORKER_INPUT',
    message: 'Worker John Doe submitted new Fuel Log for TRK001.',
    description: 'Fuel amount: 50L, Odometer: 12345km.',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
    isRead: false,
    recipientRole: 'Admin',
    link: '/inputs/fuel-logs/log123', // Example link
    sender: { id: 'worker007', name: 'John Doe', type: 'User' }
  },
  {
    id: 'notif002',
    type: 'INPUT_APPROVED',
    message: 'Your timesheet for 2024-07-28 has been approved.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    isRead: false,
    recipientRole: 'Worker',
    link: '/timesheets/ts456',
    sender: { name: 'Admin Team', type: 'User' }
  },
  {
    id: 'notif003',
    type: 'INPUT_UNDER_REVIEW',
    message: 'Your maintenance request for TRK002 is under review.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    isRead: true,
    recipientRole: 'Worker',
    link: '/maintenance/req789',
    sender: { name: 'Admin Team', type: 'User' }
  },
  {
    id: 'notif004',
    type: 'MAINTENANCE_ALERT',
    message: 'Vehicle TRK003 reported an engine fault. Immediate attention required.',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    isRead: false,
    recipientRole: 'Admin',
    link: '/fleet/TRK003/alerts',
    sender: { name: 'System', type: 'System' }
  },
  {
    id: 'notif005',
    type: 'TASK_ASSIGNED',
    message: 'New delivery task assigned: Shipment SH001 to New York.',
    description: 'Deliver by EOD tomorrow. Client: TechCorp Inc.',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    isRead: true,
    recipientRole: 'Worker',
    link: '/tasks/task101',
    sender: { name: 'System', type: 'System' }
  },
  {
    id: 'notif006',
    type: 'GENERAL_ANNOUNCEMENT',
    message: 'Upcoming team meeting on Friday at 10 AM.',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    isRead: false,
    recipientRole: 'All', // Test for 'All'
    sender: { name: 'Management', type: 'User' }
  },
  {
    id: 'notif007',
    type: 'NEW_WORKER_INPUT',
    message: 'Jane Smith submitted vacation request for Aug 5-10.',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
    isRead: true,
    recipientRole: 'Admin',
    link: '/requests/vacation/vac456',
    sender: { id: 'worker008', name: 'Jane Smith', type: 'User' }
  },
];

export const getNotifications = (userRole: 'Admin' | 'Worker'): Promise<NotificationItem[]> => {
  console.log('Mock API: Fetching notifications for role:', userRole);
  return new Promise(resolve => {
    setTimeout(() => {
      const relevantNotifications = mockNotificationsDB.filter(
        n => n.recipientRole === userRole || n.recipientRole === 'All'
      );
      // Sort by timestamp descending (newest first)
      resolve(
        relevantNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      );
    }, 300);
  });
};

export const markNotificationAsRead = (notificationId: string): Promise<NotificationItem | undefined> => {
  console.log('Mock API: Marking notification as read:', notificationId);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const notification = mockNotificationsDB.find(n => n.id === notificationId);
      if (notification) {
        notification.isRead = true;
        console.log('Mock API: Notification marked as read:', notification);
        resolve(notification);
      } else {
        console.error('Mock API: Notification not found to mark as read:', notificationId);
        reject(new Error('Notification not found'));
      }
    }, 200);
  });
};

export const markAllNotificationsAsRead = (userRole: 'Admin' | 'Worker'): Promise<NotificationItem[]> => {
  console.log('Mock API: Marking all notifications as read for role:', userRole);
  return new Promise(resolve => {
    setTimeout(() => {
      const updatedNotifications: NotificationItem[] = [];
      mockNotificationsDB.forEach(n => {
        if (n.recipientRole === userRole || n.recipientRole === 'All') {
          if (!n.isRead) {
            n.isRead = true;
            updatedNotifications.push(n);
          }
        }
      });
      console.log(`Mock API: Marked ${updatedNotifications.length} notifications as read.`);
      // Return all relevant notifications for the user, now updated
      const relevantNotifications = mockNotificationsDB.filter(
        n => n.recipientRole === userRole || n.recipientRole === 'All'
      );
      resolve(
        relevantNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      );
    }, 400);
  });
};

// --- User Profile Mock API ---

// Mock Tasks DB
let mockTasksDB: TaskPreview[] = [
  { taskId: 'task001', taskTitle: 'Deliver package SH001 to New York', status: 'In Progress', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() },
  { taskId: 'task002', taskTitle: 'Inspect TRK002 for maintenance', status: 'Pending', dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString() },
  { taskId: 'task003', taskTitle: 'Client follow-up: MegaStore LLC', status: 'Completed' },
  { taskId: 'task004', taskTitle: 'Submit Q3 Fuel Consumption Report', status: 'Pending', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()},
];

// Mock User Profiles DB
let mockUserProfilesDB: UserProfile[] = [
  {
    id: 'user001',
    name: 'Alice Wonderland (Worker)',
    email: 'alice.worker@example.com',
    role: 'Worker',
    status: 'Active',
    profilePictureUrl: 'https://i.pravatar.cc/150?u=alice',
    currentTask: mockTasksDB[0], // Alice is working on task001
    team: 'Alpha Team',
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    phone: '555-1234'
  },
  {
    id: 'user002',
    name: 'Bob The Builder (Admin)',
    email: 'bob.admin@example.com',
    role: 'Admin',
    status: 'Active',
    profilePictureUrl: 'https://i.pravatar.cc/150?u=bob',
    currentTask: mockTasksDB[3], // Bob is working on task004 (admin task)
    team: 'Management',
    lastLogin: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 mins ago
    phone: '555-5678'
  },
  {
    id: 'user003',
    name: 'Charlie Brown (Worker)',
    email: 'charlie.worker@example.com',
    role: 'Worker',
    status: 'Inactive',
    // profilePictureUrl: undefined, // No picture
    currentTask: undefined, // No current task
    team: 'Bravo Team',
    lastLogin: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
  }
];

export const getUserProfile = (userId: string): Promise<UserProfile | undefined> => {
  console.log('Mock API: Fetching user profile for ID:', userId);
  return new Promise(resolve => {
    setTimeout(() => {
      const profile = mockUserProfilesDB.find(p => p.id === userId);
      // In a real API, currentTask might be a separate fetch or joined.
      // Here, it's directly on the profile if assigned.
      console.log('Mock API: Responding with user profile:', profile);
      resolve(profile);
    }, 350); // Simulate network delay
  });
};

// Example function to simulate task update - might be used by a different part of the app
export const updateUserTask = (userId: string, taskId: string | undefined, newStatus?: TaskStatus): Promise<UserProfile | undefined> => {
  console.log(`Mock API: Updating task for user ${userId}, taskId: ${taskId}, newStatus: ${newStatus}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const profile = mockUserProfilesDB.find(p => p.id === userId);
      if (profile) {
        if (taskId === undefined) { // Unassign task
            profile.currentTask = undefined;
        } else {
            const task = mockTasksDB.find(t => t.taskId === taskId);
            if (task) {
                if(newStatus) task.status = newStatus; // Update status in the main task DB
                profile.currentTask = { ...task }; // Assign a copy to the user
            } else {
                 console.error('Mock API: Task not found to update for user:', taskId);
                 // Do not change user's task if new one is not found
            }
        }
        console.log('Mock API: User profile task updated:', profile);
        resolve(profile);
      } else {
        console.error('Mock API: User profile not found for task update:', userId);
        reject(new Error('User profile not found'));
      }
    }, 500);
  });
};
