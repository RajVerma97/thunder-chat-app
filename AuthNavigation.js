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
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

const AuthNavigation = () => {
  const [currentUser, setCurrentUser] = useState(null);

  //query the database for a number

  useEffect(() => {
    auth().onAuthStateChanged(user => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });
  });

  const screenOption = {
    headerShown: false,
  };

  return (
    <NavigationContainer>
      {!currentUser ? (
        <Stack.Navigator
          initialRouteName="SplashScreen"
          screenOptions={screenOption}>
          <Stack.Screen name="SplashScreen" component={SplashScreen} />
          <Stack.Screen
            name="PhoneNumberScreen"
            component={PhoneNumberScreen}
          />
          <Stack.Screen name="VerifyOtpScreen" component={VerifyOtpScreen} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator
          initialRouteName="SplashScreen"
          screenOptions={screenOption}>
          {!currentUser.displayName && (
            <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
          )}
          <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
          <Stack.Screen name="ChatScreen" component={ChatScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default AuthNavigation;
