export type UserRole = 'passenger' | 'driver' | 'admin';

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  rating: number;
  totalRides: number;
  walletBalance: number;
  paymentMethods: PaymentMethod[];
  createdAt: string;
}

export type DriverStatus = 'offline' | 'online' | 'busy' | 'pending_approval' | 'suspended';

export interface DriverDocument {
  id: string;
  type: 'national_id' | 'driver_license' | 'vehicle_registration' | 'inspection_certificate';
  nameAr: string;
  documentNumber: string;
  expiryDate: string;
  status: 'pending' | 'approved' | 'rejected';
  fileUrl: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  rating: number;
  totalTrips: number;
  acceptanceRate: number; // percentage
  status: DriverStatus;
  currentLocation: {
    lat: number;
    lng: number;
    heading: number; // degrees
    address: string;
  };
  vehicle: {
    model: string;
    make: string;
    year: number;
    color: string;
    colorHex: string;
    plateNumber: string;
    type: VehicleType;
  };
  documents: DriverDocument[];
  earnings: {
    today: number;
    thisWeek: number;
    walletBalance: number;
    tripsToday: number;
  };
  createdAt: string;
}

export type VehicleType = 'economy' | 'comfort' | 'ladies' | 'fast';

export interface VehicleTierConfig {
  id: VehicleType;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  capacity: number;
  baseFare: number;
  perKmRate: number;
  perMinuteRate: number;
  minimumFare: number;
  icon: string;
  multiplier: number;
}

export type RideStatus =
  | 'idle'
  | 'negotiating' // Waiting for and reviewing driver offers/bids
  | 'searching'
  | 'driver_assigned'
  | 'driver_arriving'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface LocationPoint {
  lat: number;
  lng: number;
  address: string;
  name: string;
}

export interface DriverOffer {
  id: string;
  driverId: string;
  driverName: string;
  driverAvatar: string;
  driverRating: number;
  totalTrips: number;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehiclePlate: string;
  vehicleType: VehicleType;
  offeredPrice: number; // in EGP (ج.م)
  etaMinutes: number;
  distanceKm: number;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
}

export interface Ride {
  id: string;
  passengerId: string;
  passengerName: string;
  passengerPhone: string;
  passengerAvatar: string;
  passengerRating: number;
  driverId?: string;
  driver?: Driver;
  pickup: LocationPoint;
  dropoff: LocationPoint;
  vehicleType: VehicleType;
  status: RideStatus;
  distanceKm: number;
  estimatedDurationMins: number;
  suggestedBasePrice: number; // Baseline recommendation in EGP
  passengerProposedPrice: number; // Passenger's initial offer in EGP
  price: number; // Final agreed price
  driverOffers: DriverOffer[]; // Up to 5 captains can submit offers
  paymentMethod: PaymentType;
  paymentStatus: 'pending' | 'paid' | 'failed';
  requestedAt: string;
  startedAt?: string;
  completedAt?: string;
  routeCoordinates: [number, number][];
  currentDriverIndex?: number;
  cancellationReason?: string;
  fareBreakdown: {
    baseFare: number;
    distanceCost: number;
    timeCost: number;
    surgeMultiplier: number;
    taxAndFees: number;
    discount: number;
    total: number;
  };
}

export type PaymentType = 'cash' | 'wallet' | 'card' | 'apple_pay';

export interface PaymentMethod {
  id: string;
  type: PaymentType;
  labelAr: string;
  details: string; // e.g. **** 4242 or balance
  isDefault: boolean;
}

export interface ChatMessage {
  id: string;
  rideId: string;
  senderId: string;
  senderRole: 'passenger' | 'driver';
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface RatingReview {
  id: string;
  rideId: string;
  fromUserId: string;
  toUserId: string;
  role: 'passenger' | 'driver';
  stars: number;
  comment: string;
  tags: string[];
  tipAmount: number;
  createdAt: string;
}

export interface PricingSettings {
  commissionRate: number; // e.g. 15%
  surgeMultiplier: number; // e.g. 1.2
  isSurgeActive: boolean;
  cancelFee: number;
  tiers: Record<VehicleType, VehicleTierConfig>;
}

export interface SystemStats {
  totalRidesToday: number;
  activeRidesNow: number;
  totalRevenueToday: number;
  platformProfitToday: number;
  onlineDrivers: number;
  busyDrivers: number;
  averageRating: number;
}
