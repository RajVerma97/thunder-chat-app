import React, {useState, useEffect} from 'react';
import auth from '@react-native-firebase/auth';
import {LoginContext} from './Context/LoginContext';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import PhoneNumberScreen from './screens/PhoneNumberScreen';
import VerifyOtpScreen from './screens/VerifyOtpScreen';
import ProfileScreen from './screens/ProfileScreen';
import SplashScreen from './screens/SplashScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import ChatScreen from './screens/ChatScreen';
import ContactScreen from './screens/ContactScreen';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

const AuthNavigation = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });
    return unsubscribe;
  });

  const screenOption = {
    headerShown: true,
  };

  return (
    <NavigationContainer>
      {!currentUser ? (
        <Stack.Navigator initialRouteName="SplashScreen">
          <Stack.Screen
            name="SplashScreen"
            component={SplashScreen}
            options={{
              title: '',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="PhoneNumberScreen"
            component={PhoneNumberScreen}
            options={{
              title: '',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="VerifyOtpScreen"
            component={VerifyOtpScreen}
            options={{
              title: '',
              headerShown: false,
            }}
          />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator
          initialRouteName="SplashScreen"
          screenOptions={screenOption}>
          {!currentUser.displayName && (
            <Stack.Screen
              name="ProfileScreen"
              component={ProfileScreen}
              options={{
                title: '',
                headerShown: false,
              }}
            />
          )}
          <Stack.Screen
            name="WelcomeScreen"
            component={WelcomeScreen}
            options={{
              title: 'Thunder',
              headerShown: true,
              headerStyle: {
                backgroundColor: 'lightblue',
              },
            }}
          />
          <Stack.Screen
            name="ContactScreen"
            component={ContactScreen}
            options={{
              title: 'ContactScreen',
              headerShown: true,
              headerStyle: {
                backgroundColor: 'lightblue',
              },
            }}
          />
          <Stack.Screen
            name="ChatScreen"
            component={ChatScreen}
            options={{
              title: 'Chat Screen',
              headerShown: true,
              headerStyle: {
                backgroundColor: 'lightblue',
              },
              headerTintColor: 'black',
              headerTintStyle: {
                fontWeight: 'bold',
              },
            }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default AuthNavigation;
