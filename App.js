import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// NavigationContainer is the root wrapper required by React Navigation.
// Every app using React Navigation must have exactly one of these.
import { NavigationContainer } from '@react-navigation/native';

// createNativeStackNavigator gives us a stack navigator backed by native
// screen transitions — faster than the JS-based stack navigator.
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// onAuthStateChanged fires every time the user's login state changes:
// on app start (restoring session from AsyncStorage), on login, on logout.
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/config/firebase';

import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  // user: the Firebase User object when logged in, null when logged out
  const [user, setUser] = useState(null);
  // loading: true while we wait for Firebase to restore the session from
  // AsyncStorage on first launch — without this we'd flash AuthScreen
  // for a split second even when the user is already logged in.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged returns an unsubscribe function.
    // We call it in the cleanup so the listener is removed when App unmounts.
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Blank loading screen while Firebase restores the session.
  // Using a plain View rather than a splash screen keeps this simple for Day 1.
  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // When user is set, the only screen in the stack is Home.
          // We pass user as a prop via an inline component wrapper because
          // Stack.Screen's `component` prop doesn't support passing extra props.
          <Stack.Screen name="Home">
            {() => <HomeScreen user={user} />}
          </Stack.Screen>
        ) : (
          // When user is null, the only screen in the stack is Auth.
          // React Navigation will automatically animate the transition
          // when the stack switches between these two states.
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
