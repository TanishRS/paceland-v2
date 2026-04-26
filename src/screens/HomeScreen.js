import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function HomeScreen({ user }) {
  const namePart = user?.email?.split('@')[0] ?? 'Runner';
  console.log('HomeScreen: rendered for user ' + user?.email);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome back, {namePart}</Text>

      <View style={styles.statsRow}>
        <StatCard label="Territories" value="0" />
        <StatCard label="Total km"    value="0" />
        <StatCard label="Total Runs"  value="0" />
      </View>

      <TouchableOpacity style={styles.startButton}>
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
});
