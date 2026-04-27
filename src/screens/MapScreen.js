import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

export default function MapScreen() {
  const [location, setLocation] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const watcherRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function startLocationTracking() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('MapScreen: permission status =', status);
      if (isMounted) setPermissionStatus(status);

      if (status !== 'granted') {
        if (isMounted) setErrorMsg('Location permission denied.');
        return;
      }

      watcherRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,
          distanceInterval: 5,
        },
        (pos) => {
          const { latitude, longitude } = pos.coords;
          console.log(`MapScreen: position update lat=${latitude} lng=${longitude}`);
          if (isMounted) setLocation(pos);
        }
      );
    }

    startLocationTracking();

    return () => {
      isMounted = false;
      if (watcherRef.current) {
        watcherRef.current.remove();
      }
    };
  }, []);

  if (permissionStatus === 'denied') {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>
          Location permission denied. Please enable in Settings.
        </Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1a73e8" />
        <Text style={styles.message}>Getting your location...</Text>
      </View>
    );
  }

  const { latitude, longitude } = location.coords;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
        followsUserLocation={true}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
      />
      <View style={styles.debugOverlay}>
        <Text style={styles.debugText}>
          lat: {latitude.toFixed(5)}, lng: {longitude.toFixed(5)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  debugOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 6,
  },
  debugText: {
    color: '#000',
    fontSize: 13,
  },
});
