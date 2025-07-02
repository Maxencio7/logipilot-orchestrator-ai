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
