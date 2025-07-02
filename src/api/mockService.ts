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
