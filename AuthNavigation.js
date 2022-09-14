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
import SettingsScreen from './screens/SettingsScreen';
import ChatScreen from './screens/ChatScreen';
import ContactScreen from './screens/ContactScreen';
import SearchScreen from './screens/SearchScreen';
import ForwardScreen from './screens/ForwardScreen';
import CustomDrawer from './components/CustomDrawer';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const Root = () => {
  <Stack.Navigator>
    <Stack.Screen
      name="ContactScreen"
      component={ContactScreen}
      options={{
        title: 'ContactScreen',
        headerShown: true,
        headerStyle: {
          backgroundColor: '#222831',
        },
        headerTintColor: 'white',
      }}
    />

    <Stack.Screen
      name="ChatScreen"
      component={ChatScreen}
      options={{
        title: 'Chat Screen',
        headerShown: true,
        headerStyle: {
          backgroundColor: '#222831',
        },
        headerTintColor: 'white',
        headerTintStyle: {
          fontWeight: 'bold',
        },
      }}
    />
  </Stack.Navigator>;
};

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
        <Drawer.Navigator
          initialRouteName="WelcomeScreen"
          drawerContent={props => <CustomDrawer {...props} />}>
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
          <Drawer.Screen
            name="WelcomeScreen"
            component={WelcomeScreen}
            options={{
              title: 'Home Screen',
              headerShown: true,
              headerStyle: {
                backgroundColor: '#222831',
              },
              headerTintColor: 'white',
            }}
          />
          <Drawer.Screen
            name="SettingsScreen"
            component={SettingsScreen}
            options={{
              title: 'settings',
              headerShown: true,
              headerStyle: {
                backgroundColor: '#222831',
              },
              headerTintColor: 'white',
              headerTintStyle: {
                fontWeight: 'bold',
              },
            }}
          />
        </Drawer.Navigator>
      )}
    </NavigationContainer>
  );
};

export default AuthNavigation;
