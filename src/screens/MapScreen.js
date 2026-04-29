import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Polyline, Polygon } from 'react-native-maps';
import useGpsTracking from '../hooks/useGpsTracking';
import { addDoc, collection, serverTimestamp, updateDoc, doc, query, where, onSnapshot, increment } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

function haversineMeters(a, b) {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sin1 = Math.sin(dLat / 2);
  const sin2 = Math.sin(dLng / 2);
  const chord =
    sin1 * sin1 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * sin2 * sin2;
  return R * 2 * Math.atan2(Math.sqrt(chord), Math.sqrt(1 - chord));
}

function polygonAreaMeters(points) {
  if (points.length < 3) return 0;
  const lat0 = points.reduce((s, p) => s + p.lat, 0) / points.length;
  const cosLat = Math.cos((lat0 * Math.PI) / 180);
  const R = 6371000;
  const xy = points.map(p => ({
    x: ((p.lng * Math.PI) / 180) * R * cosLat,
    y: ((p.lat * Math.PI) / 180) * R,
  }));
  let area = 0;
  for (let i = 0; i < xy.length; i++) {
    const j = (i + 1) % xy.length;
    area += xy[i].x * xy[j].y - xy[j].x * xy[i].y;
  }
  return Math.abs(area / 2);
}

export default function MapScreen() {
  const { location, error } = useGpsTracking();
  const [isTracking, setIsTracking]         = useState(false);
  const [runPath, setRunPath]               = useState([]);
  const [distanceMeters, setDistanceMeters] = useState(0);
  const [elapsedMs, setElapsedMs]           = useState(0);
  const [territories, setTerritories]       = useState([]);

  const lastPointRef  = useRef(null);
  const timerRef      = useRef(null);
  const startTimeRef  = useRef(null);
  const mapRef            = useRef(null);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (!isTracking || !location) return;
    setRunPath((prev) => [...prev, { lat: location.lat, lng: location.lng, t: Date.now() }]);
    if (lastPointRef.current) {
      const segmentDistance = haversineMeters(lastPointRef.current, location);
      setDistanceMeters((d) => d + segmentDistance);
    }
    lastPointRef.current = location;
  }, [location, isTracking]);

  useEffect(() => () => clearInterval(timerRef.current), []);

  useEffect(() => {
    if (!location || !mapRef.current) return;
    if (!hasInitializedRef.current || isTracking) {
      hasInitializedRef.current = true;
      mapRef.current.animateToRegion(
        { latitude: location.lat, longitude: location.lng, latitudeDelta: 0.005, longitudeDelta: 0.005 },
        500,
      );
    }
  }, [location, isTracking]);

  useEffect(() => {
    const q = query(
      collection(db, 'territories'),
      where('userId', '==', auth.currentUser.uid),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTerritories(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsubscribe;
  }, []);

  function startRun() {
    lastPointRef.current = location;
    startTimeRef.current = Date.now();
    setIsTracking(true);
    timerRef.current = setInterval(
      () => setElapsedMs(Date.now() - startTimeRef.current),
      500,
    );
  }

  function stopRun() {
    clearInterval(timerRef.current);
    timerRef.current = null;
    saveRun();
  }

  function resetRunState() {
    lastPointRef.current = null;
    startTimeRef.current = null;
    setIsTracking(false);
    setRunPath([]);
    setDistanceMeters(0);
    setElapsedMs(0);
  }

  async function saveRun() {
    if (runPath.length < 2 || distanceMeters < 10) {
      Alert.alert('Run too short to save');
      resetRunState();
      return;
    }
    const paceSecPerKm = (elapsedMs / 1000) / (distanceMeters / 1000);
    const userRef = doc(db, 'users', auth.currentUser.uid);
    try {
      await addDoc(collection(db, 'runs'), {
        userId: auth.currentUser.uid,
        distance: distanceMeters,
        duration: Math.round(elapsedMs / 1000),
        pace: paceSecPerKm,
        path: runPath,
        createdAt: serverTimestamp(),
      });
      try {
        await updateDoc(userRef, {
          kmCovered: increment(distanceMeters / 1000),
          totalRuns: increment(1),
        });
      } catch (e) {
        console.warn('Failed to update user counters:', e);
      }
      const first = runPath[0];
      const last = runPath[runPath.length - 1];
      if (haversineMeters(first, last) <= 20 && runPath.length >= 3 && distanceMeters >= 100) {
        try {
          const area = polygonAreaMeters(runPath);
          await addDoc(collection(db, 'territories'), {
            userId: auth.currentUser.uid,
            polygon: runPath.map(p => ({ lat: p.lat, lng: p.lng })),
            area,
            createdAt: serverTimestamp(),
          });
          await updateDoc(userRef, {
            territories: increment(1),
          });
          Alert.alert(`Run saved! Territory claimed (${Math.round(area)} m²)`);
        } catch (e) {
          console.error(e);
          Alert.alert('Run saved, but territory claim failed.');
        }
      } else {
        Alert.alert('Run saved!');
      }
      resetRunState();
    } catch (e) {
      console.error(e);
      Alert.alert('Could not save run');
    }
  }

  function formatTime(ms) {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>{error}</Text>
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

  const polylineCoords = runPath.map((p) => ({ latitude: p.lat, longitude: p.lng }));
  const paceSecPerKm = distanceMeters > 0
    ? (elapsedMs / 1000) / (distanceMeters / 1000) : 0;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        ref={mapRef}
        showsUserLocation={true}
        initialRegion={{
          latitude: location.lat,
          longitude: location.lng,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
      >
        {polylineCoords.length > 1 && (
          <Polyline coordinates={polylineCoords} strokeColor="#1a73e8" strokeWidth={4} />
        )}
        {territories.map(t => (
          <Polygon
            key={t.id}
            coordinates={t.polygon.map(p => ({ latitude: p.lat, longitude: p.lng }))}
            fillColor="rgba(76, 175, 80, 0.3)"
            strokeColor="rgba(76, 175, 80, 0.8)"
            strokeWidth={2}
          />
        ))}
      </MapView>

      <View style={styles.statsOverlay}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{(distanceMeters / 1000).toFixed(2)}</Text>
          <Text style={styles.statLabel}>km</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatTime(elapsedMs)}</Text>
          <Text style={styles.statLabel}>time</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{paceSecPerKm > 0 ? formatTime(paceSecPerKm * 1000) : '--:--'}</Text>
          <Text style={styles.statLabel}>pace /km</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.trackButton, isTracking && styles.stopButton]}
        onPress={isTracking ? stopRun : startRun}
      >
        <Text style={styles.trackButtonText}>{isTracking ? 'Stop' : 'Start Run'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  message: { marginTop: 12, fontSize: 16, color: '#333', textAlign: 'center' },
  statsOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 12,
    padding: 14,
  },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: '700', color: '#111' },
  statLabel: { fontSize: 12, color: '#555', marginTop: 2 },
  trackButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#1a73e8',
    borderRadius: 32,
    paddingVertical: 16,
    paddingHorizontal: 48,
  },
  stopButton: { backgroundColor: '#d93025' },
  trackButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
