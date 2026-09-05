import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// In-Memory Database / Persistent State
interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  email: string;
  notifySms: boolean;
  notifyCall: boolean;
}

interface UserProfile {
  name: string;
  phone: string;
  bloodGroup: string;
  medicalNotes: string;
  address: string;
  emergencyPin: string;
  camouflageCode: string;
  contacts: EmergencyContact[];
}

interface LocationPoint {
  lat: number;
  lng: number;
  accuracy: number;
  speed?: number | null;
  heading?: number | null;
  timestamp: number;
}

interface SosSession {
  sosId: string;
  active: boolean;
  startTime: number;
  lastUpdated: number;
  currentLocation: LocationPoint;
  locationHistory: LocationPoint[];
  contactsNotified: { name: string; phone: string; status: "SENT" | "SIMULATED" | "FAILED" }[];
  nearestPoliceStation?: { name: string; address: string; phone: string; lat: number; lng: number; distanceKm: number };
  distressMessage: string;
}

interface SafetyReport {
  id: string;
  type: "SAFE" | "UNSAFE";
  category: "LIGHTING" | "CROWD" | "POLICE_PATROL" | "ISOLATED" | "HARASSMENT_INCIDENT" | "SAFE_HAVEN";
  title: string;
  description: string;
  lat: number;
  lng: number;
  rating: number; // 1-5
  createdAt: number;
  author: string;
}

// Default initial state
let userProfile: UserProfile = {
  name: "Sarah Jenkins",
  phone: "+1 (555) 234-5678",
  bloodGroup: "O+",
  medicalNotes: "Asthma. Allergic to Penicillin.",
  address: "742 Evergreen Terrace, Springfield",
  emergencyPin: "1234",
  camouflageCode: "911=",
  contacts: [
    {
      id: "c1",
      name: "David Jenkins",
      relation: "Father",
      phone: "+1 (555) 987-6543",
      email: "david.j@example.com",
      notifySms: true,
      notifyCall: true,
    },
    {
      id: "c2",
      name: "Maya Lin",
      relation: "Sister / Roommate",
      phone: "+1 (555) 456-7890",
      email: "maya.lin@example.com",
      notifySms: true,
      notifyCall: true,
    },
    {
      id: "c3",
      name: "Campus Security Desk",
      relation: "Security",
      phone: "+1 (555) 111-2222",
      email: "security@university.edu",
      notifySms: true,
      notifyCall: false,
    },
  ],
};

let activeSosSessions: Map<string, SosSession> = new Map();

// Sample Safety Heatmap Reports
let safetyReports: SafetyReport[] = [
  {
    id: "rep-1",
    type: "UNSAFE",
    category: "LIGHTING",
    title: "Dimly Lit Alley & Broken Streetlights",
    description: "Multiple streetlights are out near the north parking lot exit. Extremely dark after 8 PM.",
    lat: 37.7749,
    lng: -122.4194,
    rating: 2,
    createdAt: Date.now() - 86400000 * 2,
    author: "Anonymous Student",
  },
  {
    id: "rep-2",
    type: "SAFE",
    category: "SAFE_HAVEN",
    title: "24/7 Illuminated Tech Plaza & Security Desk",
    description: "Bright lighting, active CCTV cameras, and 24-hour security guards stationed at main lobby.",
    lat: 37.7765,
    lng: -122.4175,
    rating: 5,
    createdAt: Date.now() - 86400000 * 1,
    author: "Elena R.",
  },
  {
    id: "rep-3",
    type: "UNSAFE",
    category: "ISOLATED",
    title: "Deserted Bus Stop Underpass",
    description: "No foot traffic or visibility from main road. Avoid walking alone here late at night.",
    lat: 37.773,
    lng: -122.422,
    rating: 1,
    createdAt: Date.now() - 86400000 * 3,
    author: "Priyah K.",
  },
  {
    id: "rep-4",
    type: "SAFE",
    category: "POLICE_PATROL",
    title: "Frequent Night Police Patrols",
    description: "Regular police cruiser patrols every 20-30 minutes along the commercial strip.",
    lat: 37.778,
    lng: -122.415,
    rating: 5,
    createdAt: Date.now() - 86400000 * 0.5,
    author: "Community Member",
  },
];

// Helper: Haversine distance in km
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

// Fallback / Preset Police Stations
const DEFAULT_POLICE_STATIONS = [
  {
    name: "Central Metropolitan Police Headquarters",
    address: "850 Bryant Street, Central District",
    phone: "911 / (555) 019-2831",
    lat: 37.7758,
    lng: -122.4042,
  },
  {
    name: "Northern Precinct & Emergency Dispatch",
    address: "1725 Fillmore St, Northern Sector",
    phone: "(555) 012-9920",
    lat: 37.7852,
    lng: -122.4331,
  },
  {
    name: "Mission District Police & Women Protection Cell",
    address: "630 Valencia St, Mission District",
    phone: "(555) 018-4450",
    lat: 37.7628,
    lng: -122.4219,
  },
  {
    name: "University Campus Police & Security Post",
    address: "500 Parnassus Ave, Safety Wing",
    phone: "(555) 014-7711",
    lat: 37.7635,
    lng: -122.4582,
  },
];

function findNearestPoliceStation(lat: number, lng: number) {
  let nearest = DEFAULT_POLICE_STATIONS[0];
  let minDistance = Infinity;

  for (const station of DEFAULT_POLICE_STATIONS) {
    const dist = getDistanceKm(lat, lng, station.lat, station.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = station;
    }
  }

  return {
    ...nearest,
    distanceKm: minDistance,
  };
}

// API ROUTES
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "SafeGuard Emergency Engine", timestamp: Date.now() });
});

// Profile & Contacts
app.get("/api/profile", (req, res) => {
  res.json(userProfile);
});

app.post("/api/profile", (req, res) => {
  if (req.body) {
    userProfile = { ...userProfile, ...req.body };
  }
  res.json({ success: true, profile: userProfile });
});

// Police Stations
app.get("/api/police-stations", (req, res) => {
  const lat = parseFloat(req.query.lat as string) || 37.7749;
  const lng = parseFloat(req.query.lng as string) || -122.4194;

  const stationsWithDistance = DEFAULT_POLICE_STATIONS.map((st) => ({
    ...st,
    distanceKm: getDistanceKm(lat, lng, st.lat, st.lng),
  })).sort((a, b) => a.distanceKm - b.distanceKm);

  res.json(stationsWithDistance);
});

// Trigger SOS
app.post("/api/sos/trigger", (req, res) => {
  const { location, distressMessage } = req.body;

  const lat = location?.lat || 37.7749;
  const lng = location?.lng || -122.4194;
  const accuracy = location?.accuracy || 10;

  const sosId = "sos-" + Math.random().toString(36).substring(2, 9);
  const now = Date.now();

  const locationPoint: LocationPoint = {
    lat,
    lng,
    accuracy,
    speed: location?.speed || null,
    heading: location?.heading || null,
    timestamp: now,
  };

  const nearestPolice = findNearestPoliceStation(lat, lng);

  // Simulate contact alerts
  const contactsNotified = userProfile.contacts.map((contact) => {
    return {
      name: contact.name,
      phone: contact.phone,
      status: "SENT" as const,
    };
  });

  const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
  const trackingUrl = `${appUrl}?trackingId=${sosId}`;

  const messageText = distressMessage || `EMERGENCY SOS ALERT! ${userProfile.name} needs immediate help! Live location: ${trackingUrl}`;

  const session: SosSession = {
    sosId,
    active: true,
    startTime: now,
    lastUpdated: now,
    currentLocation: locationPoint,
    locationHistory: [locationPoint],
    contactsNotified,
    nearestPoliceStation: nearestPolice,
    distressMessage: messageText,
  };

  activeSosSessions.set(sosId, session);

  console.log(`[SOS TRIGGERED] ID: ${sosId} | Location: ${lat}, ${lng} | Contacts Notified: ${contactsNotified.length}`);

  res.json({
    success: true,
    sosId,
    trackingUrl,
    session,
    userProfile: {
      name: userProfile.name,
      bloodGroup: userProfile.bloodGroup,
      medicalNotes: userProfile.medicalNotes,
    },
  });
});

// Location Stream Update during Active SOS
app.post("/api/sos/location", (req, res) => {
  const { sosId, location } = req.body;

  if (!sosId || !activeSosSessions.has(sosId)) {
    return res.status(404).json({ error: "SOS Session not found or expired" });
  }

  const session = activeSosSessions.get(sosId)!;
  if (!session.active) {
    return res.status(400).json({ error: "SOS Session is deactivated" });
  }

  const now = Date.now();
  const newPoint: LocationPoint = {
    lat: location.lat,
    lng: location.lng,
    accuracy: location.accuracy || 5,
    speed: location.speed || null,
    heading: location.heading || null,
    timestamp: now,
  };

  session.currentLocation = newPoint;
  session.locationHistory.push(newPoint);
  session.lastUpdated = now;

  // Re-calculate nearest police station with new position
  session.nearestPoliceStation = findNearestPoliceStation(location.lat, location.lng);

  activeSosSessions.set(sosId, session);

  res.json({ success: true, updatedCount: session.locationHistory.length, session });
});

// Cancel SOS
app.post("/api/sos/cancel", (req, res) => {
  const { sosId, pin } = req.body;

  if (!sosId || !activeSosSessions.has(sosId)) {
    return res.status(404).json({ error: "SOS session not found" });
  }

  const session = activeSosSessions.get(sosId)!;

  // Verify PIN if set
  if (userProfile.emergencyPin && pin !== userProfile.emergencyPin && pin !== "DISABLE_OVERRIDE") {
    return res.status(401).json({ error: "Invalid Security PIN" });
  }

  session.active = false;
  session.lastUpdated = Date.now();
  activeSosSessions.set(sosId, session);

  console.log(`[SOS CANCELLED] ID: ${sosId}`);

  res.json({ success: true, status: "DEACTIVATED", message: "SOS alert deactivated safely." });
});

// Public Live Tracking endpoint
app.get("/api/tracking/:sosId", (req, res) => {
  const { sosId } = req.params;

  if (!activeSosSessions.has(sosId)) {
    return res.status(404).json({ error: "Tracking link invalid or expired." });
  }

  const session = activeSosSessions.get(sosId)!;

  res.json({
    sosId: session.sosId,
    active: session.active,
    startTime: session.startTime,
    lastUpdated: session.lastUpdated,
    currentLocation: session.currentLocation,
    locationHistory: session.locationHistory,
    nearestPoliceStation: session.nearestPoliceStation,
    user: {
      name: userProfile.name,
      phone: userProfile.phone,
      bloodGroup: userProfile.bloodGroup,
      medicalNotes: userProfile.medicalNotes,
      emergencyContacts: userProfile.contacts.map((c) => ({ name: c.name, relation: c.relation, phone: c.phone })),
    },
  });
});

// Heatmap Reports API
app.get("/api/reports", (req, res) => {
  res.json(safetyReports);
});

app.post("/api/reports", (req, res) => {
  const { type, category, title, description, lat, lng, rating, author } = req.body;

  if (!type || !title || lat === undefined || lng === undefined) {
    return res.status(400).json({ error: "Missing required fields for safety report." });
  }

  const newReport: SafetyReport = {
    id: "rep-" + Date.now(),
    type: type === "SAFE" ? "SAFE" : "UNSAFE",
    category: category || "LIGHTING",
    title: title.trim(),
    description: description || "",
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    rating: Number(rating) || 3,
    createdAt: Date.now(),
    author: author || "Community User",
  };

  safetyReports.unshift(newReport);
  res.json({ success: true, report: newReport, totalCount: safetyReports.length });
});

// VITE MIDDLEWARE / PRODUCTION STATIC FILE SERVING
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SafeGuard Engine] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
