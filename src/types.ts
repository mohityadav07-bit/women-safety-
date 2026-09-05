export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  email: string;
  notifySms: boolean;
  notifyCall: boolean;
}

export interface UserProfile {
  name: string;
  phone: string;
  bloodGroup: string;
  medicalNotes: string;
  address: string;
  emergencyPin: string;
  camouflageCode: string;
  contacts: EmergencyContact[];
}

export interface LocationPoint {
  lat: number;
  lng: number;
  accuracy: number;
  speed?: number | null;
  heading?: number | null;
  timestamp: number;
}

export interface PoliceStation {
  name: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  distanceKm: number;
}

export interface SosSession {
  sosId: string;
  active: boolean;
  startTime: number;
  lastUpdated: number;
  currentLocation: LocationPoint;
  locationHistory: LocationPoint[];
  contactsNotified: { name: string; phone: string; status: "SENT" | "SIMULATED" | "FAILED" }[];
  nearestPoliceStation?: PoliceStation;
  distressMessage: string;
}

export interface SafetyReport {
  id: string;
  type: "SAFE" | "UNSAFE";
  category: "LIGHTING" | "CROWD" | "POLICE_PATROL" | "ISOLATED" | "HARASSMENT_INCIDENT" | "SAFE_HAVEN";
  title: string;
  description: string;
  lat: number;
  lng: number;
  rating: number;
  createdAt: number;
  author: string;
}

export interface EmergencyResource {
  id: string;
  name: string;
  category: string;
  number: string;
  description: string;
  icon: string;
}

export type ActiveTab = "sos" | "map" | "fakecall" | "profile" | "guide";
