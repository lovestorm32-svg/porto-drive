import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Driver, LocationPoint, Ride } from '../types';

interface MapViewProps {
  pickup?: LocationPoint | null;
  dropoff?: LocationPoint | null;
  drivers?: Driver[];
  activeRide?: Ride | null;
  onMapClick?: (lat: number, lng: number) => void;
  interactiveSelectMode?: 'pickup' | 'dropoff' | null;
  center?: [number, number];
  zoom?: number;
  height?: string;
  className?: string;
}

export const MapView: React.FC<MapViewProps> = ({
  pickup,
  dropoff,
  drivers = [],
  activeRide,
  onMapClick,
  interactiveSelectMode,
  center = [24.7136, 46.6753], // Riyadh default center
  zoom = 13,
  height = '100%',
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create Leaflet Map
    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: false,
      attributionControl: false,
    });

    // Add sleek dark CartoDB tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Zoom control at bottom-left
    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle map click events
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const clickHandler = (e: L.LeafletMouseEvent) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    };

    map.on('click', clickHandler);
    return () => {
      map.off('click', clickHandler);
    };
  }, [onMapClick]);

  // Update Markers and Polyline Routes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    const boundsPoints: L.LatLngExpression[] = [];

    // 1. Pickup Pin
    if (pickup) {
      boundsPoints.push([pickup.lat, pickup.lng]);
      const pickupIcon = L.divIcon({
        className: 'custom-pickup-pin',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-8 h-8 bg-emerald-500/30 rounded-full animate-ping"></div>
            <div class="relative w-8 h-8 bg-emerald-600 border-2 border-white rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-500/50">
              <span class="text-xs font-bold font-sans">A</span>
            </div>
            <div class="absolute -bottom-6 bg-slate-900/90 text-[10px] text-white px-2 py-0.5 rounded shadow whitespace-nowrap font-sans border border-slate-700">
              الانطلاق
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([pickup.lat, pickup.lng], { icon: pickupIcon })
        .bindPopup(`<b>نقطة الانطلاق:</b><br>${pickup.name || pickup.address}`)
        .addTo(markersGroup);
    }

    // 2. Dropoff Pin
    if (dropoff) {
      boundsPoints.push([dropoff.lat, dropoff.lng]);
      const dropoffIcon = L.divIcon({
        className: 'custom-dropoff-pin',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-8 h-8 bg-rose-500/30 rounded-full animate-ping"></div>
            <div class="relative w-8 h-8 bg-rose-600 border-2 border-white rounded-full flex items-center justify-center text-white shadow-xl shadow-rose-500/50">
              <span class="text-xs font-bold font-sans">B</span>
            </div>
            <div class="absolute -bottom-6 bg-slate-900/90 text-[10px] text-white px-2 py-0.5 rounded shadow whitespace-nowrap font-sans border border-slate-700">
              الوجهة
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([dropoff.lat, dropoff.lng], { icon: dropoffIcon })
        .bindPopup(`<b>نقطة الوصول:</b><br>${dropoff.name || dropoff.address}`)
        .addTo(markersGroup);
    }

    // 3. Render Route Polyline if coordinates exist
    if (activeRide && activeRide.routeCoordinates && activeRide.routeCoordinates.length > 1) {
      const polyline = L.polyline(activeRide.routeCoordinates, {
        color: '#10b981',
        weight: 5,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: activeRide.status === 'searching' ? '8, 8' : undefined,
      }).addTo(map);

      routeLayerRef.current = polyline;

      activeRide.routeCoordinates.forEach((pt) => {
        boundsPoints.push(pt);
      });
    }

    // 4. Render Drivers
    drivers.forEach((driver) => {
      const isAssigned = activeRide?.driverId === driver.id;
      const isOnline = driver.status === 'online' || isAssigned;

      if (!isOnline && !isAssigned) return;

      const lat = driver.currentLocation.lat;
      const lng = driver.currentLocation.lng;
      const heading = driver.currentLocation.heading || 0;

      boundsPoints.push([lat, lng]);

      const driverIcon = L.divIcon({
        className: 'custom-driver-car-marker',
        html: `
          <div class="relative flex items-center justify-center transition-all duration-700">
            ${isAssigned ? '<div class="absolute w-12 h-12 bg-emerald-500/25 rounded-full animate-ping"></div>' : ''}
            <div 
              style="transform: rotate(${heading}deg);" 
              class="relative w-9 h-9 ${isAssigned ? 'bg-emerald-600 ring-4 ring-emerald-300 shadow-emerald-900/80' : 'bg-slate-900 ring-2 ring-emerald-500 shadow-slate-950/80'} text-white rounded-xl flex items-center justify-center shadow-lg transition-transform duration-500"
            >
              <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
              </svg>
            </div>
            <div class="absolute -top-6 bg-slate-950 text-white border border-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap">
              ${driver.vehicle.plateNumber.split(' ').slice(0, 3).join(' ')}
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      L.marker([lat, lng], { icon: driverIcon })
        .bindPopup(`
          <div class="text-right p-1 font-sans">
            <p class="font-bold text-slate-100 text-sm">${driver.name}</p>
            <p class="text-xs text-emerald-400 font-semibold">${driver.vehicle.make} ${driver.vehicle.model} (${driver.vehicle.plateNumber})</p>
            <p class="text-[11px] text-slate-300 mt-1">التقييم: ★ ${driver.rating} • رحلات: ${driver.totalTrips}</p>
          </div>
        `)
        .addTo(markersGroup);
    });

    // Auto-fit bounds if we have multiple points
    if (boundsPoints.length >= 2) {
      try {
        const bounds = L.latLngBounds(boundsPoints);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      } catch {
        // bounds error fallback
      }
    } else if (boundsPoints.length === 1) {
      map.panTo(boundsPoints[0]);
    }
  }, [pickup, dropoff, drivers, activeRide]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {interactiveSelectMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-slate-900/95 backdrop-blur-md text-white text-xs px-4 py-2 rounded-full border border-emerald-500/50 shadow-xl flex items-center gap-2 animate-bounce">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>
            {interactiveSelectMode === 'pickup'
              ? 'انقر على الخريطة لتحديد نقطة الانطلاق (أ)'
              : 'انقر على الخريطة لتحديد نقطة الوصول (ب)'}
          </span>
        </div>
      )}
      <div ref={mapContainerRef} style={{ height }} className="w-full h-full" />
    </div>
  );
};
