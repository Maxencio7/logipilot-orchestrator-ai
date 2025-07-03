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

// Unified Search Result Item for Global Search
export interface SearchResultItem {
  type: 'Shipment' | 'Client' | 'Alert';
  id: string; // Original ID of the item
  title: string; // Formatted title for display
  description: string; // Formatted description for display
  link: string; // URL to navigate to the item's page
}


export interface AlertPreview {
  id: string;
  title: string;
  description: string;
  severity: 'High' | 'Medium' | 'Info' | string;
  category?: 'Shipment' | 'System' | 'Fleet' | string; // Optional category
}

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
