import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// signOut ends the Firebase Auth session, which triggers onAuthStateChanged
// in App.js to fire with null — that's what switches the screen back to Auth.
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

// user is passed in as a prop from App.js (which gets it from onAuthStateChanged)
export default function HomeScreen({ user }) {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log('HomeScreen: signed out');
    } catch (err) {
      console.log('HomeScreen: sign out FAILED: ' + err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome, {user?.email}</Text>
      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  welcome: {
    fontSize: 18,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#e84040',
    padding: 14,
    borderRadius: 8,
    paddingHorizontal: 32,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
