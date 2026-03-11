import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

// Main App Screens
import MapScreen from './src/screens/MapScreen';
import ReviewScreen from './src/screens/ReviewScreen';
import RecommendationsScreen from './src/screens/RecommendationsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Auth Screens
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import OnboardingInterestsScreen from './src/screens/OnboardingInterestsScreen';

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    // Check if token exists on app start
    const bootstrapAsync = async () => {
      let token;
      let hasInterests = false;
      try {
        token = await AsyncStorage.getItem('userToken');
        // A minimal check: normally you'd verify token via backend /api/auth/me here
        // If they have a token, we should also know if they've completed onboarding.
        // For simplicity, we assume they did not complete onboarding if they are freshly signing up.
        // We can store a flag "onboardingCompleted" locally.
        const completed = await AsyncStorage.getItem('onboardingCompleted');
        hasInterests = completed === 'true';

      } catch (e) {
        console.error('Failed to load token', e);
      }

      setUserToken(token);
      setNeedsOnboarding(token && !hasInterests); // If token exists but onboarding isn't complete
      setIsLoading(false);
    };

    bootstrapAsync();
  }, []);

  const handleLogin = async (token, user) => {
    setUserToken(token);
    // If returning user has interests, they are good. 
    if (user && user.interests && user.interests.length > 0) {
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      setNeedsOnboarding(false);
    } else {
      setNeedsOnboarding(true);
    }
  };

  const handleSignup = async (token, user) => {
    setUserToken(token);
    // New users always need onboarding
    await AsyncStorage.removeItem('onboardingCompleted');
    setNeedsOnboarding(true);
  };

  const handleOnboardingComplete = async () => {
    await AsyncStorage.setItem('onboardingCompleted', 'true');
    setNeedsOnboarding(false);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator>
        {userToken == null ? (
          // No token found, user isn't signed in
          <>
            <Stack.Screen name="Login" options={{ headerShown: false }}>
              {props => <LoginScreen {...props} onLogin={handleLogin} />}
            </Stack.Screen>
            <Stack.Screen name="Signup" options={{ headerShown: false }}>
              {props => <SignupScreen {...props} onSignup={handleSignup} />}
            </Stack.Screen>
          </>
        ) : needsOnboarding ? (
          // User is signed in but hasn't picked interests
          <Stack.Screen name="Onboarding" options={{ headerShown: false }}>
            {props => <OnboardingInterestsScreen {...props} onComplete={handleOnboardingComplete} />}
          </Stack.Screen>
        ) : (
          // User is signed in and fully onboarded
          <>
            <Stack.Screen
              name="Map"
              component={MapScreen}
              options={{ title: 'WhereWeGo', headerShown: false }}
            />
            <Stack.Screen
              name="Review"
              component={ReviewScreen}
              options={{ title: 'Rate & Tag Place' }}
            />
            <Stack.Screen
              name="Recommendations"
              component={RecommendationsScreen}
              options={{ title: 'Trip Suggestions' }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ title: 'Profile & Preferences' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
