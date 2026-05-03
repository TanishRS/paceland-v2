import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

export default function LeaderboardScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      orderBy('territories', 'desc'),
      orderBy('kmCovered', 'desc'),
      limit(20),
    );
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setUsers(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, []);

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

  if (users.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No players yet. Be the first to claim land.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Leaderboard</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          const isMe = auth.currentUser && item.id === auth.currentUser.uid;
          return (
            <View style={styles.row}>
              <Text style={styles.rank}>{index + 1}</Text>
              <Text style={styles.name} numberOfLines={1}>{item.name || item.email}</Text>
              {isMe && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>YOU</Text>
                </View>
              )}
              <View style={styles.stats}>
                <Text style={styles.territories}>{item.territories ?? 0}</Text>
                <Text style={styles.km}>{(item.kmCovered ?? 0).toFixed(2)} km</Text>
              </View>
            </View>
          );
        }}
      />
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
    marginBottom: 16,
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
  emptyText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rank: {
    width: 32,
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
  },
  name: {
    flex: 1,
    fontSize: 15,
    color: '#222',
  },
  badge: {
    backgroundColor: '#1a73e8',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginRight: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  stats: {
    alignItems: 'flex-end',
  },
  territories: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
  },
  km: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
});
