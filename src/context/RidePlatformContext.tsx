import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import {
  ChatMessage,
  Driver,
  DriverDocument,
  DriverOffer,
  DriverStatus,
  LocationPoint,
  PaymentType,
  PricingSettings,
  RatingReview,
  Ride,
  RideStatus,
  SystemStats,
  User,
  VehicleType,
} from '../types';
import {
  INITIAL_DRIVERS,
  INITIAL_PRICING,
  INITIAL_USER,
  POPULAR_LOCATIONS,
} from '../data/mockData';
import {
  calculateDistanceKm,
  calculateHeading,
  estimateTravelTimeMinutes,
  generateRoutePoints,
} from '../utils/geoUtils';
import { soundEffects } from '../utils/audioAlerts';

interface RideContextType {
  user: User;
  drivers: Driver[];
  selectedDriverId: string;
  setSelectedDriverId: (id: string) => void;
  activeDriver: Driver;
  activeRide: Ride | null;
  messages: ChatMessage[];
  ratings: RatingReview[];
  pricing: PricingSettings;
  systemStats: SystemStats;
  incomingRequestForDriver: Ride | null;
  driverCountdown: number;

  // Passenger negotiation & booking actions
  requestRideWithNegotiation: (
    pickup: LocationPoint,
    dropoff: LocationPoint,
    vehicleType: VehicleType,
    passengerProposedPrice: number,
    paymentMethod: PaymentType
  ) => void;
  updatePassengerProposedPrice: (newPrice: number) => void;
  acceptDriverOffer: (offerId: string) => void;
  cancelRide: (reason?: string) => void;
  submitRating: (stars: number, comment: string, tags: string[], tipAmount: number) => void;
  sendMessage: (text: string, senderRole: 'passenger' | 'driver') => void;
  topUpUserWallet: (amount: number) => void;

  // Driver negotiation actions
  toggleDriverOnline: (driverId: string) => void;
  acceptRideAsDriver: (driverId: string, customPrice?: number) => void;
  submitDriverCounterOffer: (driverId: string, counterPrice: number) => void;
  declineRideAsDriver: (driverId: string) => void;
  driverArrivedAtPickup: () => void;
  driverStartTrip: () => void;
  driverCompleteTrip: () => void;
  registerDriver: (driverData: Partial<Driver>) => void;
  uploadDriverDocument: (driverId: string, doc: Partial<DriverDocument>) => void;

  // Admin actions
  approveDriver: (driverId: string) => void;
  rejectDriver: (driverId: string) => void;
  updateDriverStatus: (driverId: string, status: DriverStatus) => void;
  updatePricing: (newSettings: Partial<PricingSettings>) => void;
  toggleSurge: () => void;

  // Sim controls
  speedUpSimulation: boolean;
  setSpeedUpSimulation: (val: boolean) => void;
  resetDemoToCleanState: () => void;
}

const RidePlatformContext = createContext<RideContextType | undefined>(undefined);

export const RidePlatformProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(INITIAL_USER);
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('drv_201');
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [ratings, setRatings] = useState<RatingReview[]>([]);
  const [pricing, setPricing] = useState<PricingSettings>(INITIAL_PRICING);
  const [incomingRequestForDriver, setIncomingRequestForDriver] = useState<Ride | null>(null);
  const [driverCountdown, setDriverCountdown] = useState<number>(20);
  const [speedUpSimulation, setSpeedUpSimulation] = useState<boolean>(true);

  // Active driver object
  const activeDriver = drivers.find((d) => d.id === selectedDriverId) || drivers[0];

  // System stats computation
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalRidesToday: 42,
    activeRidesNow: 0,
    totalRevenueToday: 3850.0,
    platformProfitToday: 462.0, // 12% commission
    onlineDrivers: 5,
    busyDrivers: 0,
    averageRating: 4.95,
  });

  // Calculate live stats
  useEffect(() => {
    const online = drivers.filter((d) => d.status === 'online').length;
    const busy = drivers.filter((d) => d.status === 'busy').length;
    setSystemStats((prev) => ({
      ...prev,
      onlineDrivers: online,
      busyDrivers: busy,
      activeRidesNow: activeRide && activeRide.status !== 'completed' && activeRide.status !== 'cancelled' ? 1 : 0,
    }));
  }, [drivers, activeRide]);

  // Request Ride with InDrive/Porto Drive Price Negotiation
  const requestRideWithNegotiation = (
    pickup: LocationPoint,
    dropoff: LocationPoint,
    vehicleType: VehicleType,
    passengerProposedPrice: number,
    paymentMethod: PaymentType
  ) => {
    const distanceKm = calculateDistanceKm(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);
    const durationMins = estimateTravelTimeMinutes(distanceKm);
    const tierConfig = pricing.tiers[vehicleType];

    const baseFare = tierConfig.baseFare;
    const distCost = distanceKm * tierConfig.perKmRate;
    const timeCost = durationMins * tierConfig.perMinuteRate;
    const surge = pricing.isSurgeActive ? pricing.surgeMultiplier : 1.0;
    const recommendedPrice = Math.max(tierConfig.minimumFare, Math.round((baseFare + distCost + timeCost) * surge));

    // Route points between pickup and dropoff
    const tripRoute = generateRoutePoints(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng, 30);

    const initialRide: Ride = {
      id: `porto_${Date.now().toString().slice(-6)}`,
      passengerId: user.id,
      passengerName: user.name,
      passengerPhone: user.phone,
      passengerAvatar: user.avatar,
      passengerRating: user.rating,
      pickup,
      dropoff,
      vehicleType,
      status: 'negotiating',
      distanceKm,
      estimatedDurationMins: durationMins,
      suggestedBasePrice: recommendedPrice,
      passengerProposedPrice: passengerProposedPrice,
      price: passengerProposedPrice,
      driverOffers: [],
      paymentMethod,
      paymentStatus: 'pending',
      requestedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      routeCoordinates: tripRoute,
      fareBreakdown: {
        baseFare,
        distanceCost: Number(distCost.toFixed(2)),
        timeCost: Number(timeCost.toFixed(2)),
        surgeMultiplier: surge,
        taxAndFees: Number((passengerProposedPrice * 0.12).toFixed(2)),
        discount: 0,
        total: passengerProposedPrice,
      },
    };

    setActiveRide(initialRide);
    setMessages([]);

    // Open incoming modal on driver phone
    setIncomingRequestForDriver(initialRide);
    setDriverCountdown(20);
    soundEffects.playIncomingRideRing();

    // Generate up to 5 competitive captain offers (staggered arrivals for authentic experience)
    const onlineCaptains = drivers.filter((d) => d.status === 'online');
    
    onlineCaptains.slice(0, 5).forEach((captain, index) => {
      // Each captain bids around passenger price (+0, +5, +10, -5, +15 ج.م)
      const bidVariations = [0, 5, 10, -5, 15];
      const variance = bidVariations[index % bidVariations.length];
      const offeredPrice = Math.max(tierConfig.minimumFare, passengerProposedPrice + variance);
      const etaMins = 2 + index * 2;
      const dist = Number((0.8 + index * 0.7).toFixed(1));

      setTimeout(() => {
        setActiveRide((prev) => {
          if (!prev || prev.status !== 'negotiating') return prev;
          
          const newOffer: DriverOffer = {
            id: `bid_${captain.id}_${Date.now()}`,
            driverId: captain.id,
            driverName: captain.name,
            driverAvatar: captain.avatar,
            driverRating: captain.rating,
            totalTrips: captain.totalTrips,
            vehicleMake: captain.vehicle.make,
            vehicleModel: captain.vehicle.model,
            vehicleYear: captain.vehicle.year,
            vehiclePlate: captain.vehicle.plateNumber,
            vehicleType: captain.vehicle.type,
            offeredPrice,
            etaMinutes: etaMins,
            distanceKm: dist,
            createdAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
            status: 'pending',
          };

          // Avoid duplicate offers from same driver
          const filteredOffers = prev.driverOffers.filter((o) => o.driverId !== captain.id);
          soundEffects.playMessagePing();

          return {
            ...prev,
            driverOffers: [newOffer, ...filteredOffers],
          };
        });
      }, 700 + index * 1200);
    });
  };

  // Passenger increases their price offer during negotiation
  const updatePassengerProposedPrice = (newPrice: number) => {
    if (!activeRide) return;
    setActiveRide((prev) => (prev ? { ...prev, passengerProposedPrice: newPrice, price: newPrice } : null));

    // Update the pending request for the driver as well
    setIncomingRequestForDriver((prev) => (prev ? { ...prev, passengerProposedPrice: newPrice, price: newPrice } : null));
  };

  // Passenger accepts one of the 5 captain offers!
  const acceptDriverOffer = (offerId: string) => {
    if (!activeRide) return;
    const selectedOffer = activeRide.driverOffers.find((o) => o.id === offerId);
    if (!selectedOffer) return;

    const matchedDriver = drivers.find((d) => d.id === selectedOffer.driverId) || activeDriver;

    soundEffects.playRideAccepted();
    setIncomingRequestForDriver(null);

    // Route from selected driver to pickup
    const driverToPickupRoute = generateRoutePoints(
      matchedDriver.currentLocation.lat,
      matchedDriver.currentLocation.lng,
      activeRide.pickup.lat,
      activeRide.pickup.lng,
      20
    );

    const agreedRide: Ride = {
      ...activeRide,
      status: 'driver_arriving',
      driverId: matchedDriver.id,
      driver: matchedDriver,
      price: selectedOffer.offeredPrice,
      routeCoordinates: driverToPickupRoute,
      currentDriverIndex: 0,
      driverOffers: activeRide.driverOffers.map((o) =>
        o.id === offerId ? { ...o, status: 'accepted' } : { ...o, status: 'rejected' }
      ),
    };

    setActiveRide(agreedRide);

    // Set driver to busy
    setDrivers((prev) =>
      prev.map((d) => (d.id === matchedDriver.id ? { ...d, status: 'busy' } : d))
    );

    // Automated greeting message
    setMessages([
      {
        id: `msg_${Date.now()}`,
        rideId: agreedRide.id,
        senderId: matchedDriver.id,
        senderRole: 'driver',
        text: `أهلاً بحضرتك يا فندم، كابتن ${matchedDriver.name} معك بسيارة ${matchedDriver.vehicle.make} ${matchedDriver.vehicle.model}. في طريقي إليك بالسعر المتفق عليه (${selectedOffer.offeredPrice} ج.م) 🚖`,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        isRead: false,
      },
    ]);
  };

  // Driver counter offer from Driver App
  const submitDriverCounterOffer = (driverId: string, counterPrice: number) => {
    const driver = drivers.find((d) => d.id === driverId) || activeDriver;
    if (!activeRide) return;

    soundEffects.playMessagePing();
    const newOffer: DriverOffer = {
      id: `bid_${driver.id}_${Date.now()}`,
      driverId: driver.id,
      driverName: driver.name,
      driverAvatar: driver.avatar,
      driverRating: driver.rating,
      totalTrips: driver.totalTrips,
      vehicleMake: driver.vehicle.make,
      vehicleModel: driver.vehicle.model,
      vehicleYear: driver.vehicle.year,
      vehiclePlate: driver.vehicle.plateNumber,
      vehicleType: driver.vehicle.type,
      offeredPrice: counterPrice,
      etaMinutes: 3,
      distanceKm: 1.2,
      createdAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      status: 'countered',
    };

    setActiveRide((prev) => {
      if (!prev) return null;
      const filtered = prev.driverOffers.filter((o) => o.driverId !== driver.id);
      return {
        ...prev,
        driverOffers: [newOffer, ...filtered],
      };
    });

    setIncomingRequestForDriver(null);
  };

  // Driver directly accepts passenger's suggested price
  const acceptRideAsDriver = (driverId: string, customPrice?: number) => {
    const driver = drivers.find((d) => d.id === driverId) || activeDriver;
    if (!activeRide) return;

    const finalFare = customPrice || activeRide.passengerProposedPrice || activeRide.price;

    soundEffects.playRideAccepted();
    setIncomingRequestForDriver(null);

    const driverToPickupRoute = generateRoutePoints(
      driver.currentLocation.lat,
      driver.currentLocation.lng,
      activeRide.pickup.lat,
      activeRide.pickup.lng,
      20
    );

    const updatedRide: Ride = {
      ...activeRide,
      status: 'driver_arriving',
      driverId: driver.id,
      driver,
      price: finalFare,
      routeCoordinates: driverToPickupRoute,
      currentDriverIndex: 0,
    };

    setActiveRide(updatedRide);

    setDrivers((prev) =>
      prev.map((d) => (d.id === driver.id ? { ...d, status: 'busy' } : d))
    );

    setMessages([
      {
        id: `msg_${Date.now()}`,
        rideId: updatedRide.id,
        senderId: driver.id,
        senderRole: 'driver',
        text: `تم قبول عرضك (${finalFare} ج.م) وأنا في الطريق إليك الآن يا فندم.`,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        isRead: false,
      },
    ]);
  };

  // Driver Decline Ride
  const declineRideAsDriver = (_driverId: string) => {
    setIncomingRequestForDriver(null);
  };

  // Driver Arrived At Pickup Point
  const driverArrivedAtPickup = () => {
    if (!activeRide) return;
    soundEffects.playDriverArrived();
    setActiveRide((prev) => (prev ? { ...prev, status: 'arrived' } : null));

    setMessages((prev) => [
      ...prev,
      {
        id: `msg_${Date.now()}`,
        rideId: activeRide.id,
        senderId: activeRide.driverId || 'drv_201',
        senderRole: 'driver',
        text: 'وصلت عند موقع الالتقاء وبانتظار حضرتك أمام المكان 🚖',
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        isRead: false,
      },
    ]);
  };

  // Driver Start Trip
  const driverStartTrip = () => {
    if (!activeRide) return;
    const tripRoute = generateRoutePoints(
      activeRide.pickup.lat,
      activeRide.pickup.lng,
      activeRide.dropoff.lat,
      activeRide.dropoff.lng,
      35
    );

    setActiveRide((prev) =>
      prev
        ? {
            ...prev,
            status: 'in_progress',
            startedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
            routeCoordinates: tripRoute,
            currentDriverIndex: 0,
          }
        : null
    );
  };

  // Driver Complete Trip
  const driverCompleteTrip = () => {
    if (!activeRide) return;
    soundEffects.playRideCompleted();

    const commissionAmount = Number((activeRide.price * (pricing.commissionRate / 100)).toFixed(2));
    const driverEarning = Number((activeRide.price - commissionAmount).toFixed(2));

    const completedRide: Ride = {
      ...activeRide,
      status: 'completed',
      completedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      paymentStatus: 'paid',
    };

    setActiveRide(completedRide);

    // Deduct user wallet if paid by wallet
    if (activeRide.paymentMethod === 'wallet') {
      setUser((prev) => ({
        ...prev,
        walletBalance: Math.max(0, Number((prev.walletBalance - activeRide.price).toFixed(2))),
        totalRides: prev.totalRides + 1,
      }));
    } else {
      setUser((prev) => ({ ...prev, totalRides: prev.totalRides + 1 }));
    }

    // Update driver earnings and status to online
    if (activeRide.driverId) {
      setDrivers((prev) =>
        prev.map((d) => {
          if (d.id === activeRide.driverId) {
            return {
              ...d,
              status: 'online',
              totalTrips: d.totalTrips + 1,
              earnings: {
                ...d.earnings,
                today: Number((d.earnings.today + driverEarning).toFixed(2)),
                thisWeek: Number((d.earnings.thisWeek + driverEarning).toFixed(2)),
                walletBalance: Number((d.earnings.walletBalance + driverEarning).toFixed(2)),
                tripsToday: d.earnings.tripsToday + 1,
              },
            };
          }
          return d;
        })
      );
    }

    // Update platform stats
    setSystemStats((prev) => ({
      ...prev,
      totalRidesToday: prev.totalRidesToday + 1,
      totalRevenueToday: Number((prev.totalRevenueToday + activeRide.price).toFixed(2)),
      platformProfitToday: Number((prev.platformProfitToday + commissionAmount).toFixed(2)),
    }));
  };

  // Cancel Ride
  const cancelRide = (reason?: string) => {
    if (!activeRide) return;
    setActiveRide((prev) => (prev ? { ...prev, status: 'cancelled', cancellationReason: reason } : null));
    setIncomingRequestForDriver(null);

    if (activeRide.driverId) {
      setDrivers((prev) =>
        prev.map((d) => (d.id === activeRide.driverId ? { ...d, status: 'online' } : d))
      );
    }
  };

  // Submit Rating & Review
  const submitRating = (stars: number, comment: string, tags: string[], tipAmount: number) => {
    if (!activeRide) return;

    const newRating: RatingReview = {
      id: `rate_${Date.now()}`,
      rideId: activeRide.id,
      fromUserId: user.id,
      toUserId: activeRide.driverId || 'drv_201',
      role: 'passenger',
      stars,
      comment,
      tags,
      tipAmount,
      createdAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    setRatings((prev) => [newRating, ...prev]);

    if (tipAmount > 0 && activeRide.driverId) {
      setDrivers((prev) =>
        prev.map((d) => {
          if (d.id === activeRide.driverId) {
            return {
              ...d,
              earnings: {
                ...d.earnings,
                today: Number((d.earnings.today + tipAmount).toFixed(2)),
                walletBalance: Number((d.earnings.walletBalance + tipAmount).toFixed(2)),
              },
            };
          }
          return d;
        })
      );
    }

    setTimeout(() => {
      setActiveRide(null);
    }, 1200);
  };

  // Messaging
  const sendMessage = (text: string, senderRole: 'passenger' | 'driver') => {
    if (!activeRide || !text.trim()) return;
    soundEffects.playMessagePing();
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      rideId: activeRide.id,
      senderId: senderRole === 'passenger' ? user.id : activeRide.driverId || 'drv_201',
      senderRole,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  // Top up user wallet
  const topUpUserWallet = (amount: number) => {
    setUser((prev) => ({
      ...prev,
      walletBalance: Number((prev.walletBalance + amount).toFixed(2)),
      paymentMethods: prev.paymentMethods.map((pm) =>
        pm.type === 'wallet' ? { ...pm, details: `رصيد: ${(prev.walletBalance + amount).toFixed(2)} ج.م` } : pm
      ),
    }));
  };

  // Driver actions
  const toggleDriverOnline = (driverId: string) => {
    setDrivers((prev) =>
      prev.map((d) => {
        if (d.id === driverId) {
          const nextStatus: DriverStatus = d.status === 'online' ? 'offline' : 'online';
          return { ...d, status: nextStatus };
        }
        return d;
      })
    );
  };

  const updateDriverStatus = (driverId: string, status: DriverStatus) => {
    setDrivers((prev) => prev.map((d) => (d.id === driverId ? { ...d, status } : d)));
  };

  const approveDriver = (driverId: string) => {
    setDrivers((prev) =>
      prev.map((d) =>
        d.id === driverId
          ? {
              ...d,
              status: 'online',
              documents: d.documents.map((doc) => ({ ...doc, status: 'approved' })),
            }
          : d
      )
    );
  };

  const rejectDriver = (driverId: string) => {
    setDrivers((prev) =>
      prev.map((d) =>
        d.id === driverId
          ? {
              ...d,
              status: 'suspended',
              documents: d.documents.map((doc) => ({ ...doc, status: 'rejected' })),
            }
          : d
      )
    );
  };

  const uploadDriverDocument = (driverId: string, doc: Partial<DriverDocument>) => {
    setDrivers((prev) =>
      prev.map((d) => {
        if (d.id === driverId) {
          const newDoc: DriverDocument = {
            id: `doc_${Date.now()}`,
            type: doc.type || 'national_id',
            nameAr: doc.nameAr || 'وثيقة جديدة',
            documentNumber: doc.documentNumber || '29402120109928',
            expiryDate: doc.expiryDate || '2029-12-31',
            status: 'pending',
            fileUrl: doc.fileUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
          };
          return {
            ...d,
            status: 'pending_approval',
            documents: [...d.documents, newDoc],
          };
        }
        return d;
      })
    );
  };

  const registerDriver = (driverData: Partial<Driver>) => {
    const newDrv: Driver = {
      id: `drv_${Date.now().toString().slice(-4)}`,
      name: driverData.name || 'كابتن جديد',
      phone: driverData.phone || '+20 10 0000 0000',
      email: driverData.email || 'driver@portodrive.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
      rating: 5.0,
      totalTrips: 0,
      acceptanceRate: 100,
      status: 'pending_approval',
      currentLocation: {
        lat: 30.0444 + (Math.random() - 0.5) * 0.04,
        lng: 31.4722 + (Math.random() - 0.5) * 0.04,
        heading: 90,
        address: 'القاهرة الجديدة، مصر',
      },
      vehicle: driverData.vehicle || {
        make: 'هيونداي',
        model: 'أكسنت RB',
        year: 2024,
        color: 'فضي',
        colorHex: '#94a3b8',
        plateNumber: 'ب ر ت 9920',
        type: 'economy',
      },
      documents: driverData.documents || [],
      earnings: {
        today: 0,
        thisWeek: 0,
        walletBalance: 0,
        tripsToday: 0,
      },
      createdAt: new Date().toISOString().split('T')[0],
    };

    setDrivers((prev) => [newDrv, ...prev]);
    setSelectedDriverId(newDrv.id);
  };

  const updatePricing = (newSettings: Partial<PricingSettings>) => {
    setPricing((prev) => ({ ...prev, ...newSettings }));
  };

  const toggleSurge = () => {
    setPricing((prev) => ({
      ...prev,
      isSurgeActive: !prev.isSurgeActive,
      surgeMultiplier: !prev.isSurgeActive ? 1.35 : 1.0,
    }));
  };

  const resetDemoToCleanState = () => {
    setActiveRide(null);
    setIncomingRequestForDriver(null);
    setMessages([]);
    setDrivers(INITIAL_DRIVERS);
    setUser(INITIAL_USER);
    setPricing(INITIAL_PRICING);
  };

  // Real-time animation ticker
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const tickInterval = speedUpSimulation ? 1200 : 2500;

    intervalRef.current = setInterval(() => {
      if (activeRide && (activeRide.status === 'driver_arriving' || activeRide.status === 'in_progress')) {
        const coords = activeRide.routeCoordinates;
        const currentIndex = activeRide.currentDriverIndex || 0;

        if (coords && currentIndex < coords.length - 1) {
          const nextIndex = currentIndex + 1;
          const [nextLat, nextLng] = coords[nextIndex];
          const [prevLat, prevLng] = coords[currentIndex];
          const heading = calculateHeading(prevLat, prevLng, nextLat, nextLng);

          setDrivers((prev) =>
            prev.map((d) =>
              d.id === activeRide.driverId
                ? {
                    ...d,
                    currentLocation: {
                      ...d.currentLocation,
                      lat: nextLat,
                      lng: nextLng,
                      heading,
                    },
                  }
                : d
            )
          );

          setActiveRide((prev) => (prev ? { ...prev, currentDriverIndex: nextIndex } : null));

          if (activeRide.status === 'driver_arriving' && nextIndex >= coords.length - 1) {
            driverArrivedAtPickup();
          } else if (activeRide.status === 'in_progress' && nextIndex >= coords.length - 1) {
            driverCompleteTrip();
          }
        }
      }

      setDrivers((prev) =>
        prev.map((d) => {
          if (d.status === 'online' && (!activeRide || d.id !== activeRide.driverId)) {
            const jitterLat = (Math.random() - 0.5) * 0.0003;
            const jitterLng = (Math.random() - 0.5) * 0.0003;
            return {
              ...d,
              currentLocation: {
                ...d.currentLocation,
                lat: d.currentLocation.lat + jitterLat,
                lng: d.currentLocation.lng + jitterLng,
              },
            };
          }
          return d;
        })
      );
    }, tickInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeRide, speedUpSimulation]);

  return (
    <RidePlatformContext.Provider
      value={{
        user,
        drivers,
        selectedDriverId,
        setSelectedDriverId,
        activeDriver,
        activeRide,
        messages,
        ratings,
        pricing,
        systemStats,
        incomingRequestForDriver,
        driverCountdown,
        requestRideWithNegotiation,
        updatePassengerProposedPrice,
        acceptDriverOffer,
        submitDriverCounterOffer,
        cancelRide,
        submitRating,
        sendMessage,
        topUpUserWallet,
        toggleDriverOnline,
        acceptRideAsDriver,
        declineRideAsDriver,
        driverArrivedAtPickup,
        driverStartTrip,
        driverCompleteTrip,
        registerDriver,
        uploadDriverDocument,
        approveDriver,
        rejectDriver,
        updateDriverStatus,
        updatePricing,
        toggleSurge,
        speedUpSimulation,
        setSpeedUpSimulation,
        resetDemoToCleanState,
      }}
    >
      {children}
    </RidePlatformContext.Provider>
  );
};

export const useRidePlatform = () => {
  const context = useContext(RidePlatformContext);
  if (!context) {
    throw new Error('useRidePlatform must be used within a RidePlatformProvider');
  }
  return context;
};
