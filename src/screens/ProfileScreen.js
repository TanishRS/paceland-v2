import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export default function ProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      console.log('ProfileScreen: fetching user doc');
      try {
        const snap = await getDoc(doc(db, 'users', auth.currentUser.uid));
        const data = snap.data();
        console.log('ProfileScreen: fetched, name=' + data?.name);
        setProfile(data);
      } catch (err) {
        console.log('ProfileScreen: fetch FAILED: ' + err.message);
        setError('Could not load profile. Try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log('ProfileScreen: signed out');
    } catch (err) {
      console.log('ProfileScreen: sign out FAILED: ' + err.message);
    }
  };

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
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <Text style={styles.heading}>Profile</Text>

      <View style={styles.card}>
        <Row label="Name"        value={profile?.name} />
        <Row label="Email"       value={profile?.email} />
        <Row label="City"        value={profile?.city} />
        <Row label="Total km"    value={`${Number(profile?.kmCovered ?? 0).toFixed(2)} km`} />
        <Row label="Territories" value={String(profile?.territories ?? 0)} />
        <Row label="Total Runs"  value={String(profile?.totalRuns ?? 0)} last />
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

function Row({ label, value, last }) {
  return (
    <View style={[styles.row, last && styles.lastRow]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value ?? '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
  },
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    paddingTop: 60,
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
    paddingHorizontal: 24,
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderColor: '#374151',
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 24,
    marginTop: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    color: '#9CA3AF',
    fontSize: 15,
    fontWeight: '400',
  },
  rowValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  errorText: {
    color: 'red',
    fontSize: 15,
  },
  signOutButton: {
    backgroundColor: 'transparent',
    borderColor: '#DC2626',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 24,
    marginTop: 32,
    alignItems: 'center',
  },
  signOutText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '700',
  },
});
