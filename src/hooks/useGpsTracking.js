// Single-watcher GPS hook — centralises all Location logic so screens
// never accidentally subscribe twice and leak a background watcher.
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export default function useGpsTracking() {
  const [location, setLocation] = useState(null);       // { lat, lng, t }
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let subscription = null;
    let cancelled = false;

    async function startTracking() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;

      if (status !== 'granted') {
        setError('Location permission denied. Please enable in Settings.');
        return;
      }

      setPermissionGranted(true);

      // Get one fast fix via getCurrentPositionAsync so the map can centre
      // immediately — the watcher's first tick can lag 5-10 s on cold start.
      const initial = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      if (!cancelled) {
        setLocation({
          lat: initial.coords.latitude,
          lng: initial.coords.longitude,
          t: Date.now(),
        });
      }

      // High accuracy = GPS chip, not cell-tower / Wi-Fi triangulation.
      // Both timeInterval AND distanceInterval must fire to emit an update,
      // which filters out the micro-jitter you get standing still.
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,
          distanceInterval: 5,
        },
        (pos) => {
          console.log("[PACE-DEBUG] hook fired", { lat: pos.coords.latitude, lng: pos.coords.longitude });
          if (!cancelled) {
            setLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              t: Date.now(),
            });
          }
        }
      );
    }

    startTracking();

    return () => {
      cancelled = true;
      // Without .remove() the OS-level watcher survives unmount and drains
      // the battery until the process is killed.
      if (subscription) subscription.remove();
    };
  }, []);

  return { location, permissionGranted, error };
}
