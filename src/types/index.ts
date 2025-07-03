// src/types/index.ts

import React from 'react';

export interface Metric {
  title: string;
  value: string;
  change: string;
  iconName: 'Package' | 'Users' | 'DollarSign' | 'AlertTriangle' | 'Truck' | string; // Allow other strings for flexibility
  color: string;
  bgColor: string;
}

export type ShipmentStatus = 'Pending' | 'Processing' | 'In Transit' | 'Delivered' | 'Delayed' | 'Cancelled' | string;

export interface ShipmentPreview {
  id: string; // Usually a unique identifier like SH001
  client: string; // Client name or ID (could reference a Client type)
  status: ShipmentStatus;
  destination: string;
  eta?: string; // Estimated time of arrival
}

export interface Shipment extends ShipmentPreview {
  origin: string;
  carrier: string;
  trackingNumber?: string;
  weightKg?: number;
  dimensionsCm?: {
    length: number;
    width: number;
    height: number;
  };
  contents?: string;
  notes?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export type ShipmentFormData = Partial<Omit<Shipment, 'id' | 'createdAt' | 'updatedAt'>> & {
  client: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
};


// --- Client Types ---
export type ClientStatus = 'Active' | 'Inactive' | 'Prospect' | 'Onboarding' | string;

export interface Client {
  id: string; // e.g., CL001
  name: string;
  email: string;
  phone?: string;
  address?: string;
  status: ClientStatus;
  companyName?: string;
  contactPerson?: string;
  industry?: string;
  notes?: string;
  satisfactionScore?: number; // e.g., 1-5 or 1-100
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export type ClientFormData = Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'satisfactionScore'>> & {
  name: string;
  email: string;
  status: ClientStatus;
};

export interface ClientActivitySummary {
  clientId: string;
  totalRequests: number;
  lastRequestDate?: string; // ISO date string
  commonDestinations?: string[];
  satisfactionTrend?: number[]; // e.g., [80, 85, 90]
}


export interface AlertPreview {
  id: string;
  title: string;
  description: string;
  severity: 'High' | 'Medium' | 'Info' | string;
  category?: 'Shipment' | 'System' | 'Fleet' | string; // Optional category
}

// --- AI Assistant Types ---
export interface AIMessage {
  id: string;
  type: 'user' | 'ai';
  message: string;
  timestamp: string;
  quickActions?: QuickAction[]; // Optional: AI might suggest actions
}

export interface QuickAction {
  icon?: React.ElementType; // Lucide icon
  title: string;
  description?: string;
  action: string; // Identifier for the action
  payload?:any; // Data associated with the action
}

export interface AIQueryLog { // For logging to ai_queries table
  id: string; // Unique log ID
  timestamp: string; // ISO date string
  userId?: string; // Optional: if you log per user
  queryText: string;
  rawResponse?: string; // Full response from Flowise/LLM
  parsedResponse?: string; // User-facing part of the response
  processingTimeMs?: number;
  flowiseConversationId?: string; // If Flowise provides one
  triggeredAction?: string; // If an action was triggered from the response
}

// --- Report Types ---
export type ReportType = 'Daily Task' | 'Weekly Summary' | 'Incident' | 'Feedback' | 'Other' | string;
export type ReportUrgency = 'Low' | 'Medium' | 'High' | 'Critical' | string;
export type ReportDepartment = 'Operations' | 'Logistics' | 'Customer Service' | 'Fleet Management' | 'Admin' | 'Sales' | string;

export interface Report {
  id: string; // e.g., REP001
  title: string;
  submittedBy: string; // User ID or name
  department: ReportDepartment;
  type: ReportType;
  urgency: ReportUrgency;
  date: string; // ISO date string of submission or relevance
  content: string; // Rich text or markdown content
  attachments?: { fileName: string; url: string; size?: number }[]; // Mocked for now
  summary?: string; // AI-generated summary
  tags?: string[];
  status?: 'Open' | 'In Progress' | 'Resolved' | 'Closed'; // Optional status
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export type ReportFormData = Omit<Report, 'id' | 'submittedBy' | 'date' | 'attachments' | 'summary' | 'createdAt' | 'updatedAt' | 'status'> & {
  // attachments might be handled differently in form, e.g. File[]
  // submittedBy and date will be set automatically on submission
};

// --- Fleet Types ---
export type VehicleStatus = 'Active' | 'Maintenance' | 'Idle' | 'Out of Service' | string;
export type VehicleType = 'Truck' | 'Van' | 'Motorcycle' | 'Drone' | 'Other' | string;
export type MaintenanceType = 'Scheduled' | 'Repair' | 'Inspection' | string;

export interface Vehicle {
  id: string; // e.g., TRK001
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin?: string;
  type: VehicleType;
  status: VehicleStatus;
  currentLocation?: { lat: number; lng: number; address?: string }; // Mocked
  fuelLevel?: number; // Percentage
  mileage?: number;
  assignedDriverId?: string; // Links to a Driver/User ID
  lastMaintenanceDate?: string; // ISO date string
  nextMaintenanceDate?: string; // ISO date string
}

export type VehicleFormData = Partial<Omit<Vehicle, 'id' | 'currentLocation' | 'assignedDriverId'>>;

export interface MaintenanceLog {
  id: string; // e.g., MAINT001
  vehicleId: string;
  date: string; // ISO date string
  type: MaintenanceType;
  description: string;
  cost?: number;
  serviceProvider?: string;
  notes?: string;
  completed: boolean;
}

export type MaintenanceLogFormData = Omit<MaintenanceLog, 'id'>;

export interface DriverAssignment { // Simplified for now
  id: string;
  vehicleId: string;
  driverId: string; // User ID of the driver
  driverName?: string; // For display
  assignmentStartDate: string; // ISO date string
  assignmentEndDate?: string; // ISO date string (if temporary)
  notes?: string;
}

export type DriverAssignmentFormData = Omit<DriverAssignment, 'id' | 'driverName'>;

// --- Tracking Types ---
export interface TrackingUpdate {
  timestamp: string; // ISO date string
  status: ShipmentStatus; // Re-use ShipmentStatus
  location: string; // e.g., "Warehouse A, Chicago, IL" or "In transit near Denver, CO"
  notes?: string;
}

export interface TrackingInfo {
  shipmentId: string;
  currentStatus: ShipmentStatus;
  currentLocation: string; // More detailed than a simple city
  estimatedDelivery: string; // ETA string or ISO date
  origin: string;
  destination: string;
  carrier?: string;
  trackingNumber?: string;
  updates: TrackingUpdate[];
  mapData?: any; // Placeholder for map coordinates or route data
}

// --- Financial Document Types ---
export type DocumentStatus = 'Draft' | 'Sent' | 'Paid' | 'Partially Paid' | 'Overdue' | 'Void' | 'Cancelled' | string;

export interface LineItem {
  id: string; // or just use index if not persisted independently
  description: string;
  quantity: number;
  unitPrice: number;
  total: number; // quantity * unitPrice
}

interface BaseDocument {
  id: string; // e.g., INV001, FN001, RCT001
  documentNumber: string; // User-friendly or legally required number
  clientId: string; // Link to Client.id
  clientName?: string; // For display convenience
  issueDate: string; // ISO date string
  dueDate?: string; // ISO date string (esp. for Invoices, FeeNotes)
  lineItems: LineItem[];
  subtotal: number;
  taxRate?: number; // Percentage, e.g., 0.07 for 7%
  taxAmount?: number;
  totalAmount: number;
  currency: string; // e.g., "USD", "EUR"
  notes?: string;
  status: DocumentStatus;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface Invoice extends BaseDocument {
  paymentTerms?: string;
  linkedFeeNoteIds?: string[];
  linkedReceiptIds?: string[];
}

export interface FeeNote extends BaseDocument {
  // Specific fields for Fee Notes, if any
  // Could be structurally similar to Invoice but used for different purposes
  relatedInvoiceId?: string;
}

export interface Receipt extends BaseDocument {
  paymentDate: string; // ISO date string
  paymentMethod: string; // e.g., "Credit Card", "Bank Transfer", "Cash"
  transactionId?: string;
  relatedInvoiceId?: string; // Link to Invoice.id it pays for
  relatedFeeNoteId?: string;
}

// FormData types
export type LineItemFormData = Omit<LineItem, 'id' | 'total'>;
export type InvoiceFormData = Omit<Invoice, 'id' | 'documentNumber' | 'subtotal' | 'taxAmount' | 'totalAmount' | 'createdAt' | 'updatedAt' | 'clientName' | 'linkedFeeNoteIds' | 'linkedReceiptIds'> & { lineItems: LineItemFormData[] };
export type FeeNoteFormData = Omit<FeeNote, 'id' | 'documentNumber' | 'subtotal' | 'taxAmount' | 'totalAmount' | 'createdAt' | 'updatedAt' | 'clientName' | 'relatedInvoiceId'> & { lineItems: LineItemFormData[] };
export type ReceiptFormData = Omit<Receipt, 'id' | 'documentNumber' | 'subtotal' | 'taxAmount' | 'totalAmount' | 'createdAt' | 'updatedAt' | 'clientName' | 'relatedInvoiceId' | 'relatedFeeNoteId'> & { lineItems: LineItemFormData[] };

// --- Settings Types ---
export interface UserProfileSettings {
  fullName?: string;
  email?: string; // Usually non-editable or requires verification
  avatarUrl?: string;
  jobTitle?: string;
  phoneNumber?: string;
  // password change would be a separate flow, not direct data field
}

export interface NotificationPreferences {
  emailNotifications: {
    newShipmentUpdates?: boolean;
    shipmentDelays?: boolean;
    clientMessages?: boolean;
    systemAlerts?: boolean;
    weeklySummary?: boolean;
  };
  pushNotifications: { // For potential future mobile app
    enabled?: boolean;
    // similar categories as email
  };
  inAppNotifications: { // Controls what appears in the bell icon
    showAll?: boolean;
    // filter by severity, etc.
  }
}

export interface UserSettings {
  id: string; // userId
  profile: UserProfileSettings;
  notifications: NotificationPreferences;
  theme?: 'light' | 'dark' | 'system';
  language?: string; // e.g., 'en', 'es'
  timezone?: string; // e.g., 'America/New_York'
}

export interface OrganizationSettings {
  id: string; // orgId
  organizationName: string;
  logoUrl?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  primaryContactEmail?: string;
  defaultCurrency?: string; // e.g., "USD"
  defaultTimezone?: string;
  slaTargets?: { // Service Level Agreement
    responseTimeHours?: number;
    deliveryAccuracyPercent?: number;
  };
  // other org-level configs
}

// FormData types for settings - usually partial updates
export type UserProfileSettingsFormData = Partial<UserProfileSettings>;
export type NotificationPreferencesFormData = Partial<NotificationPreferences>; // May need deep partial
export type OrganizationSettingsFormData = Partial<Omit<OrganizationSettings, 'id'>>;


// --- Alert/Notification Types ---
export interface NotificationAlert {
  id: string;
  title: string;
  description: string;
  severity: 'High' | 'Medium' | 'Info' | 'Success' | 'Error' | string; // Expanded severities for notifications
  category?: 'Shipment' | 'System' | 'Fleet' | 'Client' | 'Report' | string;
  timestamp: string; // ISO date string
  read: boolean;
  link?: string; // Optional link to navigate to when alert is clicked
}

// --- Analytics Types ---
export interface TimeSeriesDataPoint {
  date: string; // e.g., "YYYY-MM-DD" or "MMM YY"
  value: number;
  [key: string]: any; // For additional properties like different series in one chart
}

export interface CategoricalDataPoint {
  name: string; // Category name
  value: number;
  fill?: string; // Optional color for charts like pie or bar
  [key: string]: any;
}

export interface AnalyticsChartData {
  title: string;
  type: 'line' | 'bar' | 'pie' | string; // Chart type hint
  data: TimeSeriesDataPoint[] | CategoricalDataPoint[];
  description?: string;
  dataKeys?: string[]; // To specify which keys to use if data objects have multiple values
}

export type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all' | { from: string; to: string };


// General API response structures
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

// Specific structure for the /api/summary endpoint
export interface SummaryData {
  metrics: Metric[];
  recentShipments: ShipmentPreview[]; // client field here is just a string for preview
  activeAlerts: AlertPreview[];
}
