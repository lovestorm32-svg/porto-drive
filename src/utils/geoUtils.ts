// Geographic and calculations utilities for ride-hailing simulation

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  // Apply a street meandering factor (typically 1.25x-1.35x of direct line in city grid)
  return Math.max(1.2, Number((d * 1.3).toFixed(2)));
}

export function estimateTravelTimeMinutes(distanceKm: number, averageSpeedKmh: number = 38): number {
  const hours = distanceKm / averageSpeedKmh;
  const minutes = Math.round(hours * 60);
  return Math.max(4, minutes + 2); // add buffer for traffic lights
}

export function calculateHeading(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(dLng);
  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

// Generate realistic polyline points that follow city streets (grid-like with slight curves)
export function generateRoutePoints(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  steps: number = 25
): [number, number][] {
  const points: [number, number][] = [];
  
  // Create an intermediate Manhattan-style corner waypoint to look like real street driving
  const midLat = startLat + (endLat - startLat) * 0.45;
  const midLng = startLng + (endLng - startLng) * 0.55;

  const halfSteps = Math.floor(steps / 2);

  // Leg 1: start to intermediate
  for (let i = 0; i <= halfSteps; i++) {
    const t = i / halfSteps;
    // slight curve perturbation
    const curve = Math.sin(t * Math.PI) * 0.0015;
    const lat = startLat + (midLat - startLat) * t + curve;
    const lng = startLng + (midLng - startLng) * t - curve * 0.5;
    points.push([lat, lng]);
  }

  // Leg 2: intermediate to end
  for (let i = 1; i <= halfSteps; i++) {
    const t = i / halfSteps;
    const curve = Math.sin(t * Math.PI) * 0.0012;
    const lat = midLat + (endLat - midLat) * t - curve;
    const lng = midLng + (endLng - midLng) * t + curve * 0.8;
    points.push([lat, lng]);
  }

  // Ensure exact end point
  points.push([endLat, endLng]);
  return points;
}
