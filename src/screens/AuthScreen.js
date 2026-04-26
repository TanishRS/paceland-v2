import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

// Firebase Auth functions — modular SDK (never the compat layer)
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

// Firestore functions — modular SDK
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Our initialised auth and db instances
import { auth, db } from '../config/firebase';

function getFriendlyError(err) {
  switch (err.code) {
    case 'auth/invalid-credential':   return 'Wrong email or password';
    case 'auth/email-already-in-use': return 'An account with this email already exists';
    case 'auth/weak-password':        return 'Password must be at least 6 characters';
    case 'auth/invalid-email':        return 'Please enter a valid email';
    default:                          return err.message;
  }
}

export default function AuthScreen() {
  const [mode, setMode] = useState('login');       // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    if (mode === 'signup') {
      console.log('AuthScreen: starting signup');
      try {
        // Create the user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;
        console.log('AuthScreen: auth created uid=' + uid);

        // Derive a default name from the part of the email before the @
        const defaultName = email.split('@')[0];

        try {
          // Write the user document to Firestore at users/{uid}
          // doc(db, 'users', uid) builds the reference: collection='users', document=uid
          await setDoc(doc(db, 'users', uid), {
            email,
            name: defaultName,
            city: 'Mumbai',
            territories: 0,
            totalRuns: 0,
            kmCovered: 0,
            // serverTimestamp() tells Firestore to use the server's clock,
            // not the device clock — important for consistency across devices
            createdAt: serverTimestamp(),
          });
          console.log('AuthScreen: firestore write success');
        } catch (firestoreErr) {
          console.log('AuthScreen: firestore write FAILED: ' + firestoreErr.message);
          // We still let the user in — auth succeeded, Firestore write failed.
          // The document can be written later. We surface it as a non-fatal warning.
          setError('Account created but profile save failed. Try logging out and back in.');
        }
      } catch (authErr) {
        console.log('AuthScreen: signup FAILED: ' + authErr.message);
        setError(getFriendlyError(authErr));
      }
    } else {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('AuthScreen: login success uid=' + userCredential.user.uid);
      } catch (authErr) {
        console.log('AuthScreen: login FAILED: ' + authErr.message);
        setError(getFriendlyError(authErr));
      }
    }

    setLoading(false);
  };

  const toggleMode = () => {
    setError('');
    setMode(mode === 'login' ? 'signup' : 'login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Paceland</Text>
      <Text style={styles.subtitle}>{mode === 'login' ? 'Log In' : 'Sign Up'}</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Error area — only visible when there is an error string */}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>{mode === 'login' ? 'Log In' : 'Sign Up'}</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity onPress={toggleMode} style={styles.toggleButton}>
        <Text style={styles.toggleText}>
          {mode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Log In'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#555',
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  error: {
    color: 'red',
    marginBottom: 12,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#1a73e8',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleButton: {
    alignItems: 'center',
  },
  toggleText: {
    color: '#1a73e8',
    fontSize: 14,
  },
});
