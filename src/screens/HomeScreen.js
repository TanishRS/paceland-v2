import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen({ user }) {
  const [userDoc, setUserDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      (snap) => {
        if (snap.exists()) {
          setUserDoc(snap.data());
          setLoading(false);
          setError(null);
        } else {
          setError('Profile not found. Please sign out and sign in again.');
          setLoading(false);
        }
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [user.uid]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome back, {userDoc.name || user.email.split('@')[0]}</Text>

      <View style={styles.statsRow}>
        <StatCard label="Territories" value={String(userDoc.territories ?? 0)} />
        <StatCard label="Total km"    value={(userDoc.kmCovered ?? 0).toFixed(2)} />
        <StatCard label="Total Runs"  value={String(userDoc.totalRuns ?? 0)} />
      </View>

      <TouchableOpacity style={styles.startButton} onPress={() => navigation.navigate('Map')}>
        <Text style={styles.startButtonText}>Start Running</Text>
      </TouchableOpacity>
    </View>
  );
}

function StatCard({ label, value }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  card: {
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cardValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a73e8',
  },
  cardLabel: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#1a73e8',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
