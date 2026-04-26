import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
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
      <Text style={styles.heading}>Profile</Text>

      <View style={styles.card}>
        <Row label="Name"        value={profile?.name} />
        <Row label="Email"       value={profile?.email} />
        <Row label="City"        value={profile?.city} />
        <Row label="Total km"    value={String(profile?.kmCovered ?? 0)} />
        <Row label="Territories" value={String(profile?.territories ?? 0)} />
        <Row label="Total Runs"  value={String(profile?.totalRuns ?? 0)} />
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
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
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  card: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 32,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  rowLabel: {
    fontSize: 15,
    color: '#555',
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },
  errorText: {
    color: 'red',
    fontSize: 15,
  },
  signOutButton: {
    backgroundColor: '#e84040',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
